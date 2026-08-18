import { describe, expect, it } from "vitest";

import { mcpGetStoryInput, mcpListStoriesInput } from "./mcp-input";

describe("MCP public-read inputs", () => {
  it("bounds story listing to the public reader limits", () => {
    expect(mcpListStoriesInput.parse({ limit: 30, region: "GB" })).toEqual({ limit: 30, region: "GB" });
    expect(mcpListStoriesInput.safeParse({ limit: 31 }).success).toBe(false);
  });

  it("requires a stable story identifier", () => {
    expect(mcpGetStoryInput.safeParse({ storyId: "not-a-story" }).success).toBe(false);
  });
});
