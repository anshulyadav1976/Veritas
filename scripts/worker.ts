import { randomUUID } from "node:crypto";

import { readFeedRegistry } from "../src/lib/feed-registry";
import { ingestCandidate } from "../src/lib/ingestion";
import { claimJob, completeJob, failJob } from "../src/lib/jobs";
import { fetchRss } from "../src/lib/providers/rss";

const workerId = `worker-${process.pid}-${randomUUID()}`;
const job = claimJob(workerId);

if (!job) {
  console.log("No queued jobs.");
  process.exit(0);
}

async function run(runningJob: NonNullable<typeof job>) {
  try {
    if (runningJob.kind !== "rss-ingest") throw new Error(`Unsupported job kind: ${runningJob.kind}`);
    const payload = JSON.parse(runningJob.payloadJson) as { feedId?: string };
    const feed = readFeedRegistry().find((item) => item.id === payload.feedId);
    if (!feed) throw new Error("Feed is no longer in the registry");
    const articles = await fetchRss(feed);
    const inserted = articles.map(ingestCandidate).filter((result) => !result.duplicate).length;
    completeJob(runningJob.id);
    console.log(`${feed.id}: ${inserted} new of ${articles.length} candidates`);
  } catch (error) {
    failJob(runningJob, error instanceof Error ? error.message : "Unknown job error");
    console.error(`Job ${runningJob.id} failed.`);
    process.exitCode = 1;
  }
}
// ponytail: one worker and one job per invocation; add a long-running loop only when measured ingestion volume needs it.
void run(job);
