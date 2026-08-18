import { describe, expect, it } from "vitest";

import { claimInput, claimPrimaryMaterialInput } from "./claims";

describe("operator evidence input", () => {
  const valid = { storyId: "7814f7ef-95e5-4a59-8e2b-21e5cdf0ac70", articleId: "article_example", text: "The bridge was closed after the vessel strike.", status: "unverified", stance: "context", note: "The report says the bridge was closed after the incident." };
  it("requires a bounded claim and an attributable evidence note", () => {
    expect(claimInput.parse(valid)).toMatchObject(valid);
  });
  it("does not accept a claim without an evidence note", () => {
    expect(claimInput.safeParse({ ...valid, note: "short" }).success).toBe(false);
  });
  it("requires bounded primary-material evidence", () => {
    expect(claimPrimaryMaterialInput.safeParse({ claimId: "7814f7ef-95e5-4a59-8e2b-21e5cdf0ac70", primaryMaterialId: "7814f7ef-95e5-4a59-8e2b-21e5cdf0ac70", stance: "supports", note: "The official record supports this limited claim." }).success).toBe(true);
  });
});
