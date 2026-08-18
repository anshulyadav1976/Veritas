import { readFeedRegistry } from "../src/lib/feed-registry";

const feeds = readFeedRegistry();
console.log(`Registry valid: ${feeds.length} reviewed feed${feeds.length === 1 ? "" : "s"}.`);
