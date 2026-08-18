# Veritas implementation plan

## Current state

This repository contains the Phase 0 vertical slice and substantive Phase 1–3 foundations: RSS/Atom plus opt-in GDELT discovery, source-linked story reading, regional filtering, source profiles, reviewed evidence records and summaries, owner-only encrypted provider settings, a safe PWA shell, local-only saves/follows/media-diet tracking, grounded owner Q&A, and local read-only MCP. It is still an evidence-first web app—not a publisher or a truth oracle. Broader evaluated analyses, notifications, community workflows, localization, and remote MCP remain in progress.

## Decisions and assumptions

- **Architecture:** TypeScript modular monolith: one Next.js web/API process and one in-process/single-worker scheduler from the same repository. SQLite is the system of record. This matches a single self-hosted instance and removes a database service; a split Python worker is deferred until NLP needs justify it.
- **Initial stack:** Node LTS, TypeScript, Next.js 16.x App Router, React, pnpm, SQLite with WAL mode via `better-sqlite3`, SQL migrations, Zod, a simple database-backed jobs table plus a single-worker lock, Vitest, and Playwright. Use `@mozilla/readability` only if extraction becomes necessary; avoid it in Phase 0 where feed metadata suffices.
- **Repo shape when implementation starts:** `apps/web`, `apps/worker`, `packages/core`, `packages/providers`, `docs`, and `data`. Do not create more packages until a real boundary appears.
- **Default discovery:** curated RSS/Atom feeds plus GDELT DOC 2.0 discovery. Any commercial or credentialed provider is optional/BYOK.
- **Initial clustering:** deterministic URL and exact/near-duplicate suppression; then a transparent time-windowed hybrid score over normalized headline tokens, entities, date/location compatibility, and optional embeddings. Store the reasons/scores. Do not use an LLM to decide every cluster.
- **Analysis boundary:** global story intelligence is cached and versioned. Per-user work only ranks, filters, and records opted-in settings/reading state.
- **Licence recommendation:** use AGPL-3.0-or-later for application code if the maintainers want hosted modifications returned to the community; it is intentionally stricter for network services and can deter some commercial adopters. Do not select a data licence or add `LICENSE` until the maintainers confirm contributor/governance policy. Original registry contributions should be separated from third-party data and include per-record provenance/licence.

## Explicit non-goals

No native apps, Kafka, Kubernetes, Redis cluster, Elasticsearch, Neo4j, GraphQL, microservices, custom auth, custom analytics, custom vector database, autonomous fact checking, full-article mirroring, or public API/MCP server in the first usable release.

## Milestones

### M0 — repository and local foundation

Depends on: this plan approved.

- [ ] Confirm product name, AGPL recommendation, and contributor/data licence policy; add legal notices only after confirmation.
- [x] Create the TypeScript Next.js application and a separate one-shot worker command; no speculative packages.
- [x] Add local SQLite configuration, WAL/foreign-key/busy-timeout pragmas, migrations, a jobs table, and a safe `.env.example` with no real credentials.
- [x] Add Zod, Vitest, ESLint, production build verification, and explicit pnpm build-script approvals. Playwright/CI begin with Phase 1 UI flows.
- [x] Implement a minimal anonymous-read editorial shell and defer authentication until saved preferences require it.

Acceptance: a contributor can start the empty shell and SQLite database locally from documented commands; checks run without live provider credentials.

### M1 — ingestion vertical slice

Depends on: M0.

- [x] Define candidate article/source types and implement the RSS adapter. GDELT remains the next provider in this milestone.
- [x] Create a version-controlled opt-in RSS feed registry; each feed record carries name, URL, country, language, and source-type metadata.
- [x] Implement canonical URL normalization with fixtures covering tracking parameters, query ordering, and fragments. AMP and publisher-declared canonical-link evidence are deferred because Veritas does not fetch article pages in this slice.
- [x] Persist permitted article metadata, discovery provenance, canonical URL, timestamps, language, and a bounded attributed snippet; do not archive full text by default.
- [x] Deduplicate exact URLs and retain a feed URL alias when canonicalization changes it. Materially-identical cross-URL dedupe is deferred until the labelled clustering evaluation exists.
- [x] Schedule idempotent RSS ingestion with UTC-hour idempotency and bounded retries; retain job records and a short failure message for operator debugging. GDELT remains intentionally operator-invoked because its query/cadence is a policy choice.

Acceptance: fixtures and a small local feed run through discovery → normalized articles → deduplicated records, with links back to origin.

### M2 — stories and public reading loop

Depends on: M1.

- [ ] Implement the explainable hybrid clustering baseline and a reviewable story membership decision log.
- [x] Add manual merge/split controls restricted to operators; record supersession rather than rewrite history. Both operations require bounded reasons and retain a story-operation history; split membership is rejected rather than deleted.
- [x] Produce a bounded, operator-reviewed summary only from a selected story report. The displayed summary carries an explicit `operator-summary-v1` method label and an evidence-report reference; feed excerpts remain visibly unreviewed.
- [x] Add source registry fundamentals: canonical identity, country/language/type, ownership assertions, and source-assessment storage with evidence/review timestamps. The operator interface for source assessment follows once a curated source registry exists.
- [x] Build public home, regional feed, source profile, and story overview pages. They show report/publication counts, original links, publisher-level record boundaries, and stored membership decisions—not premature political charts. Topic classification and independent-chain counts follow source lineage work.

Acceptance: a user can browse a correctly clustered story, inspect its articles and original links, and see why it exists.

### M3 — useful public product

Depends on: M2.

- [ ] Add account/auth through a replaceable library or adapter, preferences, saved stories, and basic topic/region ranking with clear controls.
- [x] Add source-profile displays; keep historical assessment/ownership records and article-level reporting visibly separate. There are no orientation/reliability labels until reviewed source-assessment data exists.
- [x] Add versioned, schema-validated global summaries only where an operator selects a story report as evidence; publish the method label and retain the source link. The current owner workflow also records human-authored claims with linked publisher evidence; it does not generate or imply a model verdict.
- [x] Add an evidence-limited coverage-form comparison: reviewed per-report form counts, sample size, unclassified remainder, and explicit caveats. It deliberately does not infer political orientation, truthfulness, or quality.
- [x] Implement settings, encrypted BYOK credentials, provider test/delete flows, safe custom endpoint validation, and a security review. The first test flow is OpenAI-compatible only; other provider adapters need their own bounded connection contracts.
- [x] Add installable PWA shell and offline fallback with local saved-story IDs. The service worker intentionally caches only the offline page; report/evidence caching is deferred until it can carry clear freshness and deletion controls.

Acceptance: mobile and desktop users can personalize a transparent feed, save stories, inspect source evidence, and configure credentials without secrets reaching the browser after storage.

### M4 — evidence intelligence

Depends on: M3 and labelled evaluation data.

- [ ] Extract atomic factual claims from high-importance stories; require validated schemas, source spans, and analysis versions. Operator-authored factual/statistical/causal claims now use validated schemas, bounded source spans, and versioned methods; automated high-importance extraction remains intentionally deferred.
- [ ] Associate supporting and contradicting evidence separately; use primary sources and fact-check search as evidence, never model memory as verification. Operators can now append separately labelled publisher and primary-material evidence; any search adapter remains.
- [x] Ship discrete statuses: Confirmed, Well supported, Contested, Unverified, Contradicted, or Opinion/prediction/not fact-checkable. Status assessments are append-only; Confirmed requires linked supporting primary material/fact-check evidence.
- [x] Add reporting-chain and ownership diversity, a conservative blindspot calculation, and provenance-rich timeline entries. Reporting-chain/ownership coverage and a publication timeline exist; the geographic coverage-gap check remains unavailable unless a reviewed target and strict provenance/sample thresholds are met.
- [ ] Add an evaluation gate for every reader-facing intelligence output and a correction/recompute path. A minimal labelled clustering regression set, evidence publication guard, and append-only correction/recompute workflow now exist; broader held-out evaluation remains required.

Acceptance: every displayed status, diversity metric, and timeline item links to evidence and states limitations.

### M5 — later platform work

Depends on: M4 maturity, operating experience, and governance.

- [x] Grounded “Ask this story” with evidence-only retrieval and citations. It is owner-only in the no-account self-host model, sends bounded stored excerpts only, and rejects malformed or invented citations.
- [ ] Opt-in local media-diet analytics, followed stories, controlled notifications/daily brief, internationalized UI, community registry workflow, public API, then MCP. The local-only opt-in media-diet panel, followed-story brief, read-only API, local stdio MCP reader, and locale-aware document/date rendering are implemented; translated copy, delivery notifications, and remote MCP remain.

## Quality gates

- Deterministic tests cover URL/source matching, provider parsing, dedupe, clustering, ranking, ownership resolution, blindspot calculations, schemas, redaction, and SSRF checks.
- Versioned eval fixtures measure clustering, summary/source attribution, claim decomposition/status, framing, omissions, primary-source grounding, and prompt-injection resistance.
- UI changes receive keyboard, screen-reader, contrast, reduced-motion, mobile, and WebKit/Chromium Playwright coverage. Run the web-design-guidelines review skill once installed.

## Principal risks and responses

| Risk | Response |
| --- | --- |
| Copyright/terms | Metadata + short attributed snippets by default; per-provider retention rules; no implied redistribution rights. |
| Misleading political/factual labels | Distinct models, evidence, confidence bands, review workflow, unknown states, and no universal US spectrum. |
| Incorrect clusters | Conservative automatic joins, reversible merge/split history, labelled pair/cluster evals, and operator review. |
| Circular reporting | Record publisher, wire/reprint clues, ownership and reporting-chain lineage; calculate diversity from chains, not URLs. |
| LLM errors or injection | Untrusted-content boundary, structured validation, citations, versions, evals, least-privilege tools, and fallbacks. |
| BYOK abuse/SSRF | Encrypt secrets, never return/log them, validate and resolve custom hosts safely, block private/link-local targets and redirects. |
| SQLite concurrency ceiling | Enforce one writer/worker; document Postgres as an optional future migration only if a self-hosted instance outgrows that boundary. |

## Decisions needing maintainer input

1. Confirm the name “Veritas” is safe and desired for a public open-source project.
2. Confirm AGPL-3.0-or-later for code, and choose a separate contributor licence/governance policy for original registry data after legal review.
3. Decide whether Phase 0 is anonymous-public only (recommended) or must include accounts.

## First implementation task

After approval, perform M0 only: scaffold the workspace, SQLite persistence, safe environment validation, and test/build baseline. Do not begin ingestion in the same change.
