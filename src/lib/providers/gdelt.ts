import { z } from "zod";

import { canonicalizeUrl } from "../url";
import type { ArticleCandidate } from "./types";

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const endpoint = "https://api.gdeltproject.org/api/v2/doc/doc";
const requestSchema = z.object({
  query: z.string().trim().min(1).max(500),
  timespan: z.string().regex(/^\d+(?:min|h|hours|d|days|w|weeks|m|months)$/).default("1day"),
  maxRecords: z.number().int().min(1).max(250).default(75),
});
const responseSchema = z.object({
  articles: z.array(z.object({
    url: z.string(), title: z.string().min(1), domain: z.string().optional(),
    language: z.string().optional(), sourcecountry: z.string().optional(), seendate: z.string().optional(),
  })).default([]),
});

function gdeltTime(value: string | undefined) {
  if (!value) return undefined;
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T?(\d{2})(\d{2})(\d{2})/);
  if (!match) return undefined;
  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)));
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
}

export function parseGdeltArticleList(input: unknown): ArticleCandidate[] {
  return responseSchema.parse(input).articles.flatMap((article) => {
    try {
      const rawUrl = new URL(article.url).toString();
      const url = canonicalizeUrl(rawUrl);
      const domain = new URL(url).hostname;
      return [{ provider: "gdelt" as const, providerId: `${article.seendate ?? "unknown"}:${url}`, source: { name: article.domain ?? domain, domain, countryCode: article.sourcecountry, languageTag: article.language, sourceType: "news" }, url, rawUrl, title: article.title.trim(), publishedAt: gdeltTime(article.seendate), languageTag: article.language }];
    } catch { return []; }
  });
}

export async function fetchGdelt(input: z.input<typeof requestSchema>) {
  const request = requestSchema.parse(input);
  const url = new URL(endpoint);
  url.search = new URLSearchParams({ query: request.query, mode: "artlist", format: "json", maxrecords: String(request.maxRecords), timespan: request.timespan, sort: "datedesc" }).toString();
  const response = await fetch(url, { headers: { Accept: "application/json" }, redirect: "error", signal: AbortSignal.timeout(15_000) });
  if (response.status === 429) {
    const retryAfter = response.headers.get("retry-after");
    throw new Error(`GDELT rate limited this request${retryAfter ? `; retry after ${retryAfter}` : ""}`);
  }
  if (!response.ok) throw new Error(`GDELT responded ${response.status}`);
  if (Number(response.headers.get("content-length") ?? 0) > MAX_RESPONSE_BYTES) throw new Error(`GDELT response exceeds ${MAX_RESPONSE_BYTES} bytes`);
  const body = await response.text();
  if (Buffer.byteLength(body) > MAX_RESPONSE_BYTES) throw new Error(`GDELT response exceeds ${MAX_RESPONSE_BYTES} bytes`);
  return parseGdeltArticleList(JSON.parse(body));
}
