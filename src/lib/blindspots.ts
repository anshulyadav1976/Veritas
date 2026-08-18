import { z } from "zod";

import { db } from "./db";
import { runMigrations } from "./migrations";

const minimumReports = 5;
const minimumSources = 3;
const minimumCountries = 2;
const minimumReviewedFraction = 0.8;

export const geographicBlindspotScopeInput = z.object({
  storyId: z.string().uuid(),
  expectedCountryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
  rationale: z.string().trim().min(8).max(500),
});

export type BlindspotReport = { sourceId: string; countryCode: string | null; reviewed: boolean; chainId: string | null };
export type GeographicBlindspot = { state: "unavailable" | "observed_gap" | "represented"; message: string; reportCount: number; sourceCount: number; countryCount: number; reviewedCount: number; expectedCountryCode: string | null; methodVersion: string };

export function evaluateGeographicBlindspot(expectedCountryCode: string | null, reports: BlindspotReport[]): GeographicBlindspot {
  const reportCount = reports.length;
  const sourceCount = new Set(reports.map((report) => report.sourceId)).size;
  const countryCount = new Set(reports.flatMap((report) => report.countryCode ? [report.countryCode] : [])).size;
  const reviewedCount = reports.filter((report) => report.reviewed).length;
  const base = { reportCount, sourceCount, countryCount, reviewedCount, expectedCountryCode, methodVersion: "geographic-coverage-gap-v1" } as const;
  if (!expectedCountryCode) return { ...base, state: "unavailable", message: "No reviewed geographic comparison target has been set." };
  if (reportCount < minimumReports || sourceCount < minimumSources || countryCount < minimumCountries) return { ...base, state: "unavailable", message: "Too few reports, publications, or represented countries for a geographic coverage check." };
  if (reviewedCount / reportCount < minimumReviewedFraction) return { ...base, state: "unavailable", message: "Too few reports have reviewed coverage records for a geographic coverage check." };
  if (reports.some((report) => !report.countryCode || !report.chainId)) return { ...base, state: "unavailable", message: "Every report needs a source country and reviewed reporting-chain record before a geographic coverage check." };
  if (!reports.some((report) => report.countryCode === expectedCountryCode)) return { ...base, state: "observed_gap", message: `No report from the reviewed ${expectedCountryCode} source sample was found. This is a sample limitation, not evidence of intentional omission.` };
  return { ...base, state: "represented", message: `The reviewed sample includes at least one ${expectedCountryCode} source report; this does not establish balanced coverage.` };
}

export function saveGeographicBlindspotScope(input: unknown) {
  const value = geographicBlindspotScopeInput.parse(input);
  runMigrations();
  const story = db.prepare("SELECT id FROM stories WHERE id = ?").get(value.storyId);
  if (!story) throw new Error("Story does not exist");
  db.prepare("INSERT INTO story_geographic_blindspot_scopes (story_id, expected_country_code, rationale, method_version) VALUES (?, ?, ?, 'operator-geographic-scope-v1') ON CONFLICT(story_id) DO UPDATE SET expected_country_code = excluded.expected_country_code, rationale = excluded.rationale, method_version = excluded.method_version, updated_at = CURRENT_TIMESTAMP").run(value.storyId, value.expectedCountryCode, value.rationale);
}
