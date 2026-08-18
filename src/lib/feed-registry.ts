import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { z } from "zod";

import type { FeedDefinition } from "./providers/types";

const publicHttpsUrl = z.string().url().max(2_048).superRefine((value, context) => {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) context.addIssue({ code: "custom", message: "Use HTTPS without embedded credentials" });
});
const feedSchema = z.object({
  id: z.string().regex(/^[a-z0-9_-]+$/).max(100), name: z.string().trim().min(1).max(200), url: publicHttpsUrl,
  countryCode: z.string().regex(/^[A-Z]{2}$/), languageTag: z.string().regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/).optional(), sourceType: z.string().trim().min(1).max(100),
  review: z.object({ evidenceUrl: publicHttpsUrl, reviewedAt: z.string().datetime({ offset: true }), methodVersion: z.string().regex(/^[a-z0-9][a-z0-9._-]{0,99}$/) }),
});
const registrySchema = z.object({ feeds: z.array(feedSchema).max(2_000) }).superRefine((value, context) => {
  const ids = new Set<string>(); const urls = new Set<string>();
  for (const [index, feed] of value.feeds.entries()) {
    if (ids.has(feed.id)) context.addIssue({ code: "custom", path: ["feeds", index, "id"], message: "Feed IDs must be unique" }); ids.add(feed.id);
    if (urls.has(feed.url)) context.addIssue({ code: "custom", path: ["feeds", index, "url"], message: "Feed URLs must be unique" }); urls.add(feed.url);
  }
});

export type ReviewedFeed = z.infer<typeof feedSchema>;
export function parseFeedRegistry(value: unknown): ReviewedFeed[] { return registrySchema.parse(value).feeds; }
export function readFeedRegistry(): FeedDefinition[] {
  return parseFeedRegistry(JSON.parse(readFileSync(resolve(process.cwd(), "registry/feeds.json"), "utf8"))).map(({ review: _review, ...feed }) => feed);
}
