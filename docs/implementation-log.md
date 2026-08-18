# Implementation log

## 2026-08-18 — Phase 0 foundation

### Delivered

- Next.js 16 App Router application with a server-rendered, anonymous editorial home and a no-cache health route.
- File-backed SQLite system of record using WAL, foreign keys, and a 5-second busy timeout.
- Immutable SQL migration runner and first schema for sources, articles, stories, story membership, and idempotent jobs.
- One-shot worker command that atomically claims exactly one queued job. It is intentionally single-writer for self-hosted SQLite safety.
- URL canonicalization utility with deterministic tracker, fragment, path, host, and query-order normalization tests.
- `.env.example` for local database and environment-based provider credentials. Dashboard-managed credentials begin in Phase 1 and require an encryption key.
- Editorial initial shell based on the approved design reference, including the empty state that accurately says ingestion has not run.

### Security and operating choices

- Prepared SQL statements are required for runtime values; migrations are checked-in static SQL.
- SQLite lives under ignored `data/`; self-hosters must mount that path on persistent storage.
- pnpm permits install scripts only for the required SQLite driver and two transitive build tools, recorded in `pnpm-workspace.yaml`.
- The app has no user accounts, provider calls, content extraction, raw-news storage, or dashboard secret storage yet.

### Verification

- `pnpm db:migrate` — passed.
- `pnpm lint` — passed.
- `pnpm test` — passed (2 URL-normalization tests).
- `pnpm build` — passed.
- Live `GET /api/health` returned `{"status":"ok"}`; the home page rendered the expected empty state.

### Research consulted

- [Next.js installation and App Router guidance](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js backend-for-frontend guidance](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [Drizzle’s SQLite driver comparison](https://orm.drizzle.team/docs/sqlite/get-started-sqlite) informed the choice to use the mature `better-sqlite3` file driver directly rather than Node’s still-release-candidate built-in SQLite API.

### Next

Implement the RSS provider and source/feed registry with fixture-based parsing before making any live network calls.

## 2026-08-18 — RSS ingestion baseline

### Delivered

- An opt-in `registry/feeds.json` and `pnpm ingest` command. An empty registry makes no network calls.
- RSS 2.0 and Atom candidate parsing with canonical URLs, publication time, author, short text-only excerpts, and source metadata.
- Two-megabyte body/content-length caps, a 10-second fetch timeout, redirects disabled, and explicit `DOCTYPE` rejection before XML parsing.
- Prepared-statement persistence for sources/articles; canonical URL deduplication; transparent initial story membership with headline-token scoring.
- Fixture tests for RSS, Atom, DTD rejection, URL cleanup, and false-join prevention in the clustering baseline.

### Research consulted

- [RSS 2.0 specification](https://www.rssboard.org/rss-2-0)
- [Atom Syndication Format, RFC 4287](https://www.rfc-editor.org/info/rfc4287/)
- [GDELT DOC 2.0 API introduction](https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/)
- [fast-xml-parser entity-expansion advisory](https://github.com/NaturalIntelligence/fast-xml-parser/security/advisories/GHSA-jmr7-xgp7-cmfj)

### Verification

- `pnpm lint`, `pnpm test` (6 tests), `pnpm db:migrate`, `pnpm ingest`, and `pnpm build` all passed.

### Next

Add GDELT discovery behind explicit configuration, then build story-detail provenance and the owner-only credential dashboard.

## 2026-08-18 — encrypted owner credentials

- Added owner-only `/settings` login, signed HttpOnly strict-site cookie, encrypted provider-key storage, masked credential list, replacement and deletion.
- Requires both `VERITAS_ADMIN_PASSWORD` and a 32-byte base64 `VERITAS_ENCRYPTION_KEY`; environment credentials remain supported.
- AES-256-GCM encryption tests plus migration, lint, test, and production-build verification passed.
- Based on [OWASP cryptographic storage guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html).

## 2026-08-18 — public story reader and URL-alias provenance

### Delivered

- Added `article_aliases` to retain an original feed URL whenever canonicalization removes trackers or otherwise changes it.
- Made home-page story cards navigable and added a server-rendered story page with the publisher’s original link, source metadata, bounded excerpt, join decision, score, and algorithm version.
- Kept the source list deliberately neutral: it describes grouping evidence and explicitly says it is not a credibility verdict.
- Added a keyboard skip link, visible focus treatment, responsive evidence trail, touch-ready buttons, and a confirmation prompt before deleting a stored credential.

### Verification

- `pnpm db:migrate`, `pnpm lint`, `pnpm test` (10 tests), and `pnpm build` passed.
- The reader route is covered by the production build and fixture-backed ingestion tests. The local browser runner is not available in this environment, so interactive browser coverage is not claimed here.
- The UI was reviewed against the current [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md); the actionable findings addressed in this slice were skip navigation, heading wrapping, hover/focus/touch feedback, and destructive-action confirmation.

### Research consulted

- [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html) for server-side input/access-control boundaries and safe management endpoint behavior.

## 2026-08-18 — opt-in GDELT discovery

- Added a validated `pnpm ingest:gdelt -- '<query>' [timespan]` command for GDELT DOC 2.0 ArticleList discovery.
- The fixed endpoint uses HTTPS, a timeout, disabled redirects, and a bounded JSON response. Each external record is validated independently; malformed items are dropped without accepting malformed JSON as source data.
- GDELT is deliberately query-driven and not scheduled by default. It is discovery metadata only and never represented as source assessment or verification.
- Fixture parsing, linting, tests, and the production build passed. An isolated live request reached GDELT but received HTTP 429; the command now reports that rate limit without retrying or creating background load.

## 2026-08-18 — grounded operator evidence records

### Delivered

- Added source-assessment/ownership record storage and an evidence model: claims have a discrete status, version, and one or more report-linked evidence records whose stance remains separate.
- Added an owner-only `/stories/:id/review` workflow. It validates bounded claim text and evidence notes, confirms the selected report belongs to the story inside the write transaction, and publishes the record to the public story page with an outbound citation.
- Added a public empty state that says evidence records have not been reviewed rather than implying a claim is false or absent.

### Verification

- `pnpm db:migrate`, lint, 14 unit tests, and a production build passed.
- The owner review route is covered by the production build and input-validation tests. The local browser runner is not available in this environment, so interactive browser coverage is not claimed here.

### Research consulted

- [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) informed the next custom-provider endpoint hardening step; it recommends real URL parsing, blocked internal targets, and disabled/validated redirects.

## 2026-08-18 — custom provider endpoint guard

- Dashboard-managed custom endpoints are now accepted only for OpenAI-compatible credentials over public HTTPS. The server resolves the host and rejects private, local, link-local, reserved, multicast, IPv6 local, and mapped-private answers before saving.
- Tests cover a public endpoint plus HTTP, literal loopback, and DNS-private failures. The documented environment-variable path remains deliberate self-host operator control rather than a browser-reachable bypass.

## 2026-08-18 — small public API and mobile manifest

- Added a schema-bounded, same-origin, read-only story API with a 1–100 limit and no-store responses. It exposes no secrets, provider controls, or mutations.
- Added the standalone web manifest for mobile installation. Offline caches are deliberately deferred until saved-story freshness and clear-local-data controls exist.
- `pnpm lint`, 16 unit tests, and `pnpm build` passed. A production-server smoke test verified the API’s successful `limit=1` JSON/no-store response and its `400` response for `limit=101`.

## 2026-08-18 — local-only saved stories

- Added a local reading list backed only by browser storage, with save/remove controls on a story and a `/saved` page. No account, cookie, server database record, or analytics event is created.
- The UI makes the storage boundary and clearing behavior explicit; it is not presented as offline evidence caching.
- The UI was checked against the current [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md); this pass added intentional mobile tap feedback, hover treatment for saved-story links, long-headline wrapping, and `content-visibility` for larger saved lists.

## 2026-08-18 — open-source quality baseline

- Added repository CI for the exact migration, lint, unit-test, and production-build checks used locally.
- Added contributor and security reporting guides that make data provenance, sensitive assessment contributions, and secret handling explicit.
- Verified the CI action majors against the current upstream release pages before adding the workflow.

## 2026-08-18 — regional reader and source identity surfaces

- Added bounded regional story filters for the current curated-country set and made every report’s publisher a source-profile link.
- Added source profiles that distinguish identity, historical assessment records, ownership assertions, and recent publisher reporting. Unknown is shown explicitly; a missing assessment is not rendered as a reliability or ideological judgment.
- Lint, 16 unit tests, and the production build passed. This UI pass also applied the current Web Interface Guidelines to active filters, long publisher/article labels, and responsive ownership rows.

## 2026-08-18 — cautious timeline and diversity baseline

- Added a report-publication timeline that links every item to the original publisher and explicitly avoids claiming an event chronology.
- Added transparent publisher/ownership-record coverage counts. Independent-chain, perspective-balance, and blindspot outputs remain unavailable until reviewed lineage/classification data exists.
- Added a version-controlled labelled clustering pair set, exercised by the test suite as a regression baseline. Lint, 17 tests, and a production build passed.

## 2026-08-18 — operational encrypted provider configuration

- Added server-only OpenAI-compatible credential resolution: an encrypted dashboard credential overrides the explicit environment fallback when present.
- Added an owner-invoked connection test against the standard Models endpoint. It has a timeout and disabled redirects, and returns only generic success/failure so provider error bodies and secrets never reach the browser.
- Added request-shape and error-redaction tests. Lint, 19 tests, and a production build passed. The endpoint contract was verified against the official [OpenAI Models API reference](https://platform.openai.com/docs/api-reference/models/object).

## 2026-08-18 — grounded owner Q&A

- Added an owner-only Ask This Story workflow that requires a configured model and bounded report excerpts. No query reaches an LLM unless the owner chooses to ask.
- The response must be JSON with citation IDs from the supplied evidence set. Malformed responses, provider errors, missing models, and invented citations produce no answer.
- Added prompt-boundary and citation-rejection tests. Lint, 21 tests, and the production build passed. The JSON-response pattern was checked against the official [OpenAI API reference](https://platform.openai.com/docs/api-reference/evals/deleteRun?lang=python).

## 2026-08-18 — idempotent RSS jobs

- Added a UTC-hour idempotent RSS queue command and a one-job worker that runs real feed ingestion.
- Failed jobs retry twice with capped backoff; after that, SQLite retains the failed status and a bounded error message for operator inspection. No job endpoint is public.
- Lint, 22 tests, production build, empty-registry queue, and empty-worker commands passed.

## 2026-08-18 — reviewable source records

- Added an owner-only source review form for evidence-linked historical assessment records and dated ownership assertions with a bounded confidence field.
- Public profiles keep these records separate from individual articles and explain that no assessment is a verdict on a particular report.
- Lint, 24 tests, and the production build passed.

## 2026-08-18 — reversible story review

- Added owner-only merge and split operations with required reasons. Merges supersede the source story and preserve its memberships; splits reject the original membership and create a reviewed membership in a new story.
- Every operation is recorded in `story_operations` and shown as story history instead of silently rewriting clustering decisions.
- Migrations, lint, 26 unit tests, a production build, and an isolated SQLite merge/split transaction smoke test passed.

## 2026-08-18 — documented reporting chains

- Added owner-reviewed reporting-chain records with an evidence article, basis, confidence, and article membership.
- Story diversity now distinguishes documented chains from reports without a chain record; it does not infer independence from missing data.
- Migrations, lint, 28 tests, and a production build passed.

## 2026-08-18 — request-time dashboard endpoint validation

- Dashboard-managed OpenAI-compatible endpoints are now re-resolved and validated before provider connection tests and grounded-Q&A requests, not only at save time.
- Environment-configured endpoints remain the documented self-host operator exception. Lint, 28 tests, and the production build passed.

## 2026-08-18 — installable PWA safety boundary

- Added a manifest icon, service-worker registration, and offline fallback page for standalone installation.
- The service worker caches only the offline page and never stores reports, evidence, claims, or API results. Lint, 28 tests, and a production build passed.

## 2026-08-18 — opt-in local media diet

- Added browser-only media-diet tracking, disabled by default, with a 200-visit cap and one-click local history removal.
- The interface labels it as a reading-history summary and explicitly does not infer source independence, political balance, or quality. Lint, 28 tests, and a production build passed.

## 2026-08-18 — evidence-linked reviewed summaries

- Added one bounded, operator-reviewed story summary record with a required reference to a non-rejected report in that story and an explicit method version (`operator-summary-v1`).
- Replacing a summary updates the same reviewed record and the story’s current display value. Initial RSS/GDELT excerpts remain visibly labelled as unreviewed; the system does not present them as verified or AI-authored summaries.
- `pnpm db:migrate`, `pnpm lint`, `pnpm test` (30 tests), and `pnpm build` passed.

## 2026-08-18 — local read-only MCP

- Added a local stdio MCP server with schema-bounded `veritas_list_stories` and `veritas_get_story` tools. It reads the same public model as the web reader and deliberately registers no mutation, credential, provider, ingestion, filesystem, or outbound-network tools.
- The first transport is process-owned stdio, so the app does not add a remote HTTP endpoint or authorization surface. Remote MCP remains a separately scoped deployment-security task.
- Migrations, lint, 32 unit tests, the production build, and a raw stdio JSON-RPC initialize/list/call smoke test passed. The implementation follows the current [MCP TypeScript server guide](https://ts.sdk.modelcontextprotocol.io/v2/get-started/first-server): inputs are Zod schemas and stdout is reserved for protocol messages.

## 2026-08-18 — local followed-story brief

- Added browser-local follows and a `/following` daily-brief surface. It filters the current public story list client-side, has a 100-ID validation cap, and exposes no account, server follow record, provider call, background sync, or notification delivery.
- Migrations, lint, 34 unit tests, and the production build passed. The local test suite covers malformed/tampered following storage; interactive browser coverage remains unavailable in this environment and is not claimed.
