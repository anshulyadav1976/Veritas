import { describe, expect, it } from "vitest";

import { correctionInput, recomputeInput } from "./corrections";

const storyId = "7814f7ef-95e5-4a59-8e2b-21e5cdf0ac70";

describe("correction and recompute input", () => {
  it("requires a bounded correction against an explicit evidence record", () => {
    expect(correctionInput.parse({ storyId, targetType: "claim", targetId: storyId, note: "The linked record was corrected by the issuing authority." }).targetType).toBe("claim");
  });

  it("does not accept an untraceable correction or a vague recompute reason", () => {
    expect(correctionInput.safeParse({ storyId, targetType: "story", targetId: storyId, note: "too short" }).success).toBe(false);
    expect(recomputeInput.safeParse({ storyId, reason: "short" }).success).toBe(false);
  });
});
