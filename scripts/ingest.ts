import { readFeedRegistry } from "../src/lib/feed-registry";
import { ingestCandidate } from "../src/lib/ingestion";
import { fetchRss } from "../src/lib/providers/rss";

async function main() {
  for (const feed of readFeedRegistry()) {
    const entries = await fetchRss(feed);
    const results = entries.map(ingestCandidate);
    console.log(`${feed.id}: ${results.filter((result) => !result.duplicate).length} new of ${entries.length} candidates`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
