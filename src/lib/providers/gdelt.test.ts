import { describe, expect, it } from "vitest";

import { parseGdeltArticleList } from "./gdelt";

describe("GDELT ArticleList parser", () => {
  it("keeps publisher links while normalizing the discovery URL", () => {
    const [article] = parseGdeltArticleList({ articles: [{ url: "https://Example.com/report?utm_source=gdelt", title: "Example report", domain: "Example", language: "English", sourcecountry: "United Kingdom", seendate: "20260818T120000Z" }] });
    expect(article).toMatchObject({ provider: "gdelt", rawUrl: "https://example.com/report?utm_source=gdelt", url: "https://example.com/report", publishedAt: "2026-08-18T12:00:00.000Z", source: { domain: "example.com", countryCode: "United Kingdom" } });
  });
  it("drops malformed external records without rejecting the whole result", () => {
    expect(parseGdeltArticleList({ articles: [{ url: "not a url", title: "Bad" }] })).toEqual([]);
  });
});
