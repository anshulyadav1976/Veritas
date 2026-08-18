# News pipeline

## Acquisition policy

The public instance stores canonical links, source identity, headline/byline/time, a short permitted attributed excerpt, fingerprints, derived metadata, and provenance. Full body retrieval is exceptional, policy-controlled, and transient for analysis; it is not a mirror. Respect publisher terms, robots directives where applicable, rate limits, canonical links, paywall boundaries, attribution, and each provider’s terms. “Publicly accessible” does not grant redistribution rights.

## Flow

1. **Discover:** scheduler polls curated RSS/Atom feeds and queries GDELT within provider limits. Optional BYOK adapters discover candidates only through their permitted API.
2. **Validate and normalize:** reject malformed records; resolve the publisher against the source registry; normalize URLs (scheme/host casing, fragments, known trackers, query ordering) while retaining raw input and reasoning.
3. **Acquire metadata safely:** use feed/API fields first. If a page visit is allowed, enforce network/robots/retention policy and capture only allowed extraction results.
4. **Deduplicate:** exact canonical URL and feed external ID first; then bounded title/time/fingerprint similarity. Preserve all provider sightings and aliases.
5. **Infer lineage cautiously:** detect disclosed wire credit, matching fingerprint, canonical relationships, and publisher relationships. Mark uncertain lineage as unknown, never as independent.
6. **Cluster:** score eligible active stories within a time window and either join, create a new story, or leave for review. Do not match on a famous entity alone.
7. **Prioritize:** importance considers independent chains, rate of new coverage, geographical breadth, source quality/variety, official relevance, topic impact, and recency—not volume/virality alone.
8. **Analyze selectively:** only stories over an importance/evidence threshold receive global summaries and later claim/framing work. Cache immutable analysis runs.

## Initial cluster algorithm

Candidate stories are limited by a recency window, common coarse topic/region/entity signals, and language compatibility. A weighted score then combines:

- normalized headline lexical similarity;
- distinct entity overlap (people/organizations/locations);
- compatible event/action vocabulary;
- date/location agreement or non-conflict;
- publication-time proximity;
- optional embedding similarity once it improves a labelled evaluation set.

The system creates a new story if no score passes the conservative join threshold. It refuses an automatic join when location/date/action conflicts are strong, even when a famous person overlaps. Store feature values, threshold, and model/version on each membership. Subsequent evidence can merge clearly duplicate stories or split a mixed cluster; retain a supersession trail and recalculate dependent analysis.

Evaluate with labelled duplicate/nonduplicate pairs and manually curated story clusters by region/language/topic. Track pair precision/recall, cluster purity/completeness, false joins, false splits, and time-to-cluster. Tune thresholds per evidence—not intuition.

## Reporting-chain diversity

Count at least four things separately: article URLs, publications, owners, and estimated reporting chains. A chain begins as an article unless a cited wire service, near-identical fingerprint, syndication marker, or a human review establishes a relationship. Display “estimated” and the unclassified share. Never describe 20 copies of one wire report as 20 confirmations.

## Lifecycle and operations

Stories move `developing → active → settled → archived`, and can be `superseded`. Freshness decays, but an update/new primary document may reactivate a story. A single worker claims jobs using deterministic idempotency keys (provider + external ID/canonical URL + version), exponential backoff, bounded retries, and dead-letter visibility through SQLite job records. Operators can retry, reject, merge, split, or correct with reason/provenance.

## PWA boundary

The PWA consumes the public reading experience; it never performs provider ingestion or holds server secrets. Installability needs a manifest and HTTPS/localhost; a service worker is useful but not required for installability ([MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)). Phase 1 caches the app shell/offline page; saved-story offline caching comes only after privacy and stale-data behavior are clear.
# News pipeline

## Current vertical slice

`pnpm ingest` reads only the reviewed RSS/Atom records in `registry/feeds.json`. Each entry is fetched with a body cap, timeout, disabled redirects, and XML `DOCTYPE` rejection. The parser produces source/article metadata, strips HTML from a short excerpt, and canonicalizes the outbound article URL.

The original feed URL is retained in `article_aliases` when canonicalization changes it. Canonical URL uniqueness prevents a repeat feed item from becoming a second article. New reports receive a transparent headline-overlap clustering decision; the reader can see the stored decision and algorithm version on the story page.

## Deliberate boundaries

- Only explicitly configured registry feeds are fetched. No user-provided feed URL is accepted by the web application.
- Veritas stores metadata and a bounded attributed excerpt, not a full article archive.
- An alias proves a normalization operation, not that a publisher has declared a canonical URL. Publisher-declared canonical links and redirect evidence require a future, separately reviewed fetcher.
- GDELT discovery is a separate provider command so a self-host can choose its query and retention implications explicitly.
