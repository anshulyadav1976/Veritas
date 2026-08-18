# Veritas contributor guidance

The authoritative plan is [PLAN.md](PLAN.md); product and engineering rationale live in `docs/`.

- Apply Ponytail (full): inspect and reuse before adding code, prefer platform/stdlib and existing dependencies, and do not introduce an abstraction or service before a second real use requires it.
- Keep a modular monolith. SQLite is the system of record; do not add queues, caches, search clusters, or services without a measured need. Preserve the single-writer worker boundary.
- Keep source history, article analysis, and claim verification distinct. Political orientation is never a factuality score.
- Every derived reader-facing insight needs inspectable provenance, methodology/version metadata, and uncertainty where applicable.
- Treat crawled pages, feeds, model output, and custom provider URLs as untrusted input. Never expose or log credentials; validate structured AI output.
- Preserve copyright boundaries: link and attribute original reporting; store only permitted metadata/snippets by default.
- Add focused deterministic tests for non-trivial logic and versioned eval fixtures for intelligence features. Do not call live providers in ordinary tests.
- Build accessible, responsive interfaces: semantic HTML, keyboard operation, visible focus, sufficient contrast, reduced motion, and text equivalents for visuals.
- Update the relevant documentation when a material architecture, schema, methodology, provider, security, or product decision changes.

## Commands

- `pnpm db:migrate` — apply SQLite migrations.
- `pnpm dev` — run the local app.
- `pnpm worker` — claim and process one queued job.
- `pnpm lint && pnpm test && pnpm build` — required verification before a major commit.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
