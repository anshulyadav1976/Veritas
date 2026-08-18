import { describe, expect, it } from "vitest";
import { mergeInput, splitInput } from "./story-operations";
const story = "7814f7ef-95e5-4a59-8e2b-21e5cdf0ac70";
describe("story operation input", () => {
  it("rejects self-merges and short review reasons", () => expect(mergeInput.safeParse({ targetStoryId: story, sourceStoryId: story, reason: "too short" }).success).toBe(false));
  it("requires a bounded split headline and reason", () => expect(splitInput.parse({ sourceStoryId: story, articleId: "article_x", headline: "Separate bridge closure report", reason: "The report covers a separate event and should not remain clustered." }).articleId).toBe("article_x"));
});
