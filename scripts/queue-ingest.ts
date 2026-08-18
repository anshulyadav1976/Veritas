import { readFeedRegistry } from "../src/lib/feed-registry";
import { enqueueJob } from "../src/lib/jobs";

const bucket = new Date().toISOString().slice(0, 13);
let queued = 0;
for (const feed of readFeedRegistry()) if (enqueueJob("rss-ingest", { feedId: feed.id }, `rss:${feed.id}:${bucket}`).queued) queued += 1;
console.log(`Queued ${queued} RSS jobs for ${bucket}:00Z.`);
