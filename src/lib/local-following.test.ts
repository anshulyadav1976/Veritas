import { describe, expect, it } from "vitest";

import { parseFollowedStoryIds, serializeFollowedStoryIds } from "./local-following";

const story = "7814f7ef-95e5-4a59-8e2b-21e5cdf0ac70";

describe("local following storage", () => {
  it("keeps only unique stable story IDs", () => {
    expect(parseFollowedStoryIds(JSON.stringify([story, story, "not-a-story"]))).toEqual([story]);
  });

  it("does not trust malformed browser storage", () => {
    expect(parseFollowedStoryIds("not json")).toEqual([]);
    expect(serializeFollowedStoryIds([story, "not-a-story"])).toBe(JSON.stringify([story]));
  });
});
