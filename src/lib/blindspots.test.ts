import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { evaluateGeographicBlindspot, geographicBlindspotScopeInput } from "./blindspots";

const reports = [
  { sourceId: "a", countryCode: "GB", reviewed: true, chainId: "1" },
  { sourceId: "b", countryCode: "GB", reviewed: true, chainId: "2" },
  { sourceId: "c", countryCode: "FR", reviewed: true, chainId: "3" },
  { sourceId: "d", countryCode: "FR", reviewed: true, chainId: "4" },
  { sourceId: "e", countryCode: "GB", reviewed: true, chainId: "5" },
];
const fixtures = JSON.parse(readFileSync(resolve(process.cwd(), "evals/blindspots.json"), "utf8")) as Array<{ expectedCountryCode: string; reports: typeof reports; state: string }>;

describe("conservative geographic coverage-gap check", () => {
  it("withholds a result when the reviewed sample is too small", () => expect(evaluateGeographicBlindspot("US", reports.slice(0, 4)).state).toBe("unavailable"));
  it("reports only a qualified sample gap and never an omission claim", () => expect(evaluateGeographicBlindspot("US", reports)).toMatchObject({ state: "observed_gap", message: expect.stringContaining("not evidence of intentional omission") }));
  it("requires an explicit country target and rationale", () => expect(geographicBlindspotScopeInput.safeParse({ storyId: "7814f7ef-95e5-4a59-8e2b-21e5cdf0ac70", expectedCountryCode: "us", rationale: "Check whether the reviewed source sample includes US reporting." }).success).toBe(true));
  it("matches the versioned conservative blindspot cases", () => fixtures.forEach((fixture) => expect(evaluateGeographicBlindspot(fixture.expectedCountryCode, fixture.reports).state).toBe(fixture.state)));
});
