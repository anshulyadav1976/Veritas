import { XMLParser } from "fast-xml-parser";
import { canonicalizeUrl } from "../url";
import type { ArticleCandidate, FeedDefinition } from "./types";

const MAX_FEED_BYTES = 2 * 1024 * 1024;
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", processEntities: false, trimValues: true });
const list = <T,>(value: T | T[] | undefined): T[] => value === undefined ? [] : Array.isArray(value) ? value : [value];
const text = (value: unknown) => typeof value === "string" ? value.trim() || undefined : undefined;
const date = (value: unknown) => { const parsed = new Date(text(value) ?? ""); return Number.isNaN(parsed.valueOf()) ? undefined : parsed.toISOString(); };
const excerptText = (value: string) => value.replace(/&(lt|gt|amp|quot|#39);/g, (entity) => ({ "&lt;": "<", "&gt;": ">", "&amp;": "&", "&quot;": "\"", "&#39;": "'" })[entity] ?? entity).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500);

function atomLink(value: unknown) {
  for (const link of list(value as Record<string, unknown> | Record<string, unknown>[])) {
    if (typeof link === "string") return link;
    if (link && typeof link === "object" && typeof link["@_href"] === "string" && (link["@_rel"] === undefined || link["@_rel"] === "alternate")) return link["@_href"];
  }
}

export function parseRssOrAtom(feed: FeedDefinition, xml: string): ArticleCandidate[] {
  if (Buffer.byteLength(xml) > MAX_FEED_BYTES) throw new Error(`Feed ${feed.id} exceeds ${MAX_FEED_BYTES} bytes`);
  if (/<!doctype/i.test(xml)) throw new Error(`Feed ${feed.id} contains a disallowed DOCTYPE`);
  const parsed = parser.parse(xml) as Record<string, unknown>;
  const root = new URL(feed.url);
  const source = { name: feed.name, domain: root.hostname.toLowerCase(), countryCode: feed.countryCode, languageTag: feed.languageTag, sourceType: feed.sourceType };
  const rssItems = (parsed.rss as { channel?: { item?: unknown } } | undefined)?.channel?.item;
  const atomEntries = (parsed.feed as { entry?: unknown } | undefined)?.entry;
  return list(rssItems ?? atomEntries).flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    const href = text(item.link) ?? atomLink(item.link);
    const title = text(item.title);
    if (!href || !title) return [];
    try {
      const rawUrl = new URL(href, feed.url).toString();
      const url = canonicalizeUrl(rawUrl);
      const excerpt = text(item.description) ?? text(item.summary) ?? text(item.content);
      return [{ provider: "rss" as const, providerId: text(item.guid) ?? text(item.id) ?? url, source, url, rawUrl, title, author: text(item.author) ?? text(item["dc:creator"]), publishedAt: date(item.pubDate) ?? date(item.published) ?? date(item.updated), excerpt: excerpt ? excerptText(excerpt) : undefined, languageTag: feed.languageTag }];
    } catch { return []; }
  });
}

export async function fetchRss(feed: FeedDefinition) {
  const response = await fetch(feed.url, { headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9" }, redirect: "error", signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`Feed ${feed.id} responded ${response.status}`);
  if (Number(response.headers.get("content-length") ?? 0) > MAX_FEED_BYTES) throw new Error(`Feed ${feed.id} exceeds ${MAX_FEED_BYTES} bytes`);
  return parseRssOrAtom(feed, await response.text());
}
