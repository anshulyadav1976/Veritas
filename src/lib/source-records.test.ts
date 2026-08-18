import { describe, expect, it } from "vitest";
import { sourceRecordInput } from "./source-records";

describe("source review input", () => {
  const value = { sourceId: "source_example", status: "reviewed", rationale: "Published correction policy and ownership disclosure were reviewed.", evidenceUrl: "https://example.com/standards", ownerName: "Example Group", ownerEvidenceUrl: "https://example.com/about", confidence: "0.8" };
  it("requires bounded source and ownership evidence", () => expect(sourceRecordInput.parse(value).confidence).toBe(0.8));
  it("rejects invalid source evidence links", () => expect(sourceRecordInput.safeParse({ ...value, evidenceUrl: "not-a-url" }).success).toBe(false));
});
