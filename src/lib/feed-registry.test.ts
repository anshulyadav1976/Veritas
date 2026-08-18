import { describe, expect, it } from "vitest";

import { parseFeedRegistry } from "./feed-registry";

const feed = { id: "example-news", name: "Example News", url: "https://news.example/feed.xml", countryCode: "GB", languageTag: "en", sourceType: "publisher", review: { evidenceUrl: "https://news.example/about", reviewedAt: "2026-08-18T12:00:00Z", methodVersion: "registry-review-v1" } };

describe("reviewed feed registry", () => {
  it("requires reviewed provenance for every feed", () => expect(parseFeedRegistry({ feeds: [feed] })[0]?.id).toBe("example-news"));
  it("rejects unsafe, duplicate, or unreviewed contributions", () => {
    expect(() => parseFeedRegistry({ feeds: [{ ...feed, url: "http://news.example/feed.xml" }] })).toThrow("HTTPS");
    expect(() => parseFeedRegistry({ feeds: [feed, feed] })).toThrow("unique");
    expect(() => parseFeedRegistry({ feeds: [{ ...feed, review: undefined }] })).toThrow();
  });
});
