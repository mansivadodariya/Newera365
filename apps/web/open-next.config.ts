import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';
import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue';

// KV incremental cache + in-isolate revalidation queue so ISR (revalidate:60)
// actually serves cached pages and re-renders in the background instead of
// SSR-ing every request. ponytail: swap kv → r2IncrementalCache once R2 is
// enabled on the Cloudflare account (KV free tier caps at 1k writes/day).
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  queue: memoryQueue,
});
