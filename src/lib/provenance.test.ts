import { describe, expect, it } from "vitest";
import { describeMembership } from "./provenance";

describe("story membership provenance", () => {
  it("turns the stored clustering record into reader-facing context", () => {
    expect(describeMembership('{"signal":"headline token overlap","score":0.678}', "headline-jaccard-v1")).toBe("headline token overlap; 68% similarity (headline-jaccard-v1)");
  });
  it("does not throw on a legacy malformed record", () => {
    expect(describeMembership("not-json", "legacy-v1")).toBe("Recorded by legacy-v1");
  });
});
