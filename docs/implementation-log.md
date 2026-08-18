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
