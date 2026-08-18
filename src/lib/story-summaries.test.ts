import { describe, expect, it } from "vitest";
import { summaryInput } from "./story-summaries";
describe("reviewed story summary input", () => {
  it("requires a bounded summary linked to one story report", () => expect(summaryInput.parse({ storyId: "7814f7ef-95e5-4a59-8e2b-21e5cdf0ac70", articleId: "article_x", text: "Authorities said the bridge was closed after a vessel struck a support." }).text).toContain("bridge"));
  it("rejects an empty or unbounded summary", () => expect(summaryInput.safeParse({ storyId: "7814f7ef-95e5-4a59-8e2b-21e5cdf0ac70", articleId: "article_x", text: "short" }).success).toBe(false));
});
