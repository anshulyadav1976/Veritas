import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ingestCandidate } from "../src/lib/ingestion";
import { fetchRss } from "../src/lib/providers/rss";
import type { FeedDefinition } from "../src/lib/providers/types";

async function main() {
  const registry = JSON.parse(readFileSync(resolve(process.cwd(), "registry/feeds.json"), "utf8")) as { feeds: FeedDefinition[] };
  for (const feed of registry.feeds) {
    const entries = await fetchRss(feed);
    const results = entries.map(ingestCandidate);
    console.log(`${feed.id}: ${results.filter((result) => !result.duplicate).length} new of ${entries.length} candidates`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
