import { describe, expect, it } from "vitest";

import { canonicalizeUrl } from "./url";

describe("canonicalizeUrl", () => {
  it("removes trackers, fragments, trailing slash, and normalizes query order", () => {
    expect(canonicalizeUrl("HTTPS://Example.com/story/?b=2&utm_source=rss&a=1#section")).toBe("https://example.com/story?a=1&b=2");
  });

  it("preserves meaningful parameters", () => {
    expect(canonicalizeUrl("https://example.com/story?id=42&gclid=ignored")).toBe("https://example.com/story?id=42");
  });
});
