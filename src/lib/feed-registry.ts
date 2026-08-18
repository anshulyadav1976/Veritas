import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { z } from "zod";

import type { FeedDefinition } from "./providers/types";

const registrySchema = z.object({ feeds: z.array(z.object({ id: z.string().regex(/^[a-z0-9_-]+$/), name: z.string().min(1), url: z.url(), countryCode: z.string().length(2).optional(), languageTag: z.string().min(2).optional(), sourceType: z.string().min(1).optional() })) });
export function readFeedRegistry(): FeedDefinition[] {
  return registrySchema.parse(JSON.parse(readFileSync(resolve(process.cwd(), "registry/feeds.json"), "utf8"))).feeds;
}
