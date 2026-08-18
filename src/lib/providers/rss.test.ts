import { describe, expect, it } from "vitest";
import { parseRssOrAtom } from "./rss";

const feed = { id: "example", name: "Example News", url: "https://news.example/feed.xml", languageTag: "en" };
describe("parseRssOrAtom", () => {
  it("parses RSS metadata and strips excerpt HTML", () => {
    const [article] = parseRssOrAtom(feed, `<?xml version="1.0"?><rss><channel><item><guid>item-1</guid><title>Example report</title><link>https://news.example/story?utm_source=rss</link><description>&lt;p&gt;Short &lt;b&gt;excerpt&lt;/b&gt;&lt;/p&gt;</description></item></channel></rss>`);
    expect(article).toMatchObject({ providerId: "item-1", rawUrl: "https://news.example/story?utm_source=rss", url: "https://news.example/story", excerpt: "Short excerpt" });
  });
  it("parses Atom alternate links and rejects DTD", () => {
    expect(parseRssOrAtom(feed, `<?xml version="1.0"?><feed><entry><id>atom-1</id><title>Atom report</title><link rel="alternate" href="https://news.example/atom"/></entry></feed>`)[0]?.url).toBe("https://news.example/atom");
    expect(() => parseRssOrAtom(feed, `<!DOCTYPE rss [<!ENTITY bad "x">]><rss/>`)).toThrow("disallowed DOCTYPE");
  });
});
