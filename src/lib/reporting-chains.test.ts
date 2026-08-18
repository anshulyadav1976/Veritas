import { describe, expect, it } from "vitest";
import { chainInput } from "./reporting-chains";
describe("reporting-chain input", () => {
  it("requires a cited basis and bounded confidence", () => expect(chainInput.parse({ storyId: "7814f7ef-95e5-4a59-8e2b-21e5cdf0ac70", articleId: "article_x", label: "Wire copy", basis: "The publisher explicitly credits the same wire service.", confidence: "0.8" }).confidence).toBe(0.8));
  it("rejects an unsupported chain label", () => expect(chainInput.safeParse({ storyId: "7814f7ef-95e5-4a59-8e2b-21e5cdf0ac70", articleId: "article_x", label: "x", basis: "short", confidence: 2 }).success).toBe(false));
});
