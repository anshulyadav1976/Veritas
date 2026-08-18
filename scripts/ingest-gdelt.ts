import { ingestCandidate } from "../src/lib/ingestion";
import { fetchGdelt } from "../src/lib/providers/gdelt";

const [query, timespan = "1day"] = process.argv.slice(2).filter((argument, index) => index !== 0 || argument !== "--");
async function main() {
  if (!query) throw new Error("Usage: pnpm ingest:gdelt -- '<query>' [timespan]");
  const articles = await fetchGdelt({ query, timespan });
  let inserted = 0;
  for (const article of articles) if (!ingestCandidate(article).duplicate) inserted += 1;
  console.log(`GDELT: ${inserted} new articles from ${articles.length} results.`);
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
