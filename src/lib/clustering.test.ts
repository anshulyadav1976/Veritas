import { describe, expect, it } from "vitest";
import { canAutoJoinStory, clusterDecision } from "./clustering";

describe("headline clustering", () => {
  it("joins strongly overlapping reports", () => {
    expect(canAutoJoinStory("Kestrel bridge closes after vessel strike", "Vessel strike closes Kestrel bridge overnight")).toBe(true);
  });
  it("does not join stories that only share a subject", () => {
    expect(canAutoJoinStory("Senator announces transport funding plan", "Senator faces inquiry over election donation")).toBe(false);
  });
  it("rejects explicit opposing actions despite similar words", () => expect(clusterDecision({ headline: "Airport opens after storm closure" }, { headline: "Airport closes after storm warning" }).join).toBe(false));
  it("records time proximity as an explainable signal", () => expect(clusterDecision({ headline: "Kestrel bridge closes after vessel strike", publishedAt: "2026-08-18T12:00:00Z" }, { headline: "Vessel strike closes Kestrel bridge overnight", publishedAt: "2026-08-18T13:00:00Z" }).timeScore).toBeGreaterThan(.9));
});
