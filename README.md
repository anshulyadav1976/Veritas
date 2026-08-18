# Veritas

Open-source, self-hostable news intelligence: a transparent evidence layer that groups reporting into stories and preserves links to original sources.

## Status

Foundation and the first ingestion/reader slice are complete: RSS and Atom feeds can be ingested into SQLite, reports are clustered transparently, and readers can inspect original links on a story page. GDELT discovery and evidence intelligence remain in progress; this is not yet a complete news product.

## Local development

Requirements: Node.js 22.13+ and pnpm.

```bash
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm dev
```

Open `http://localhost:3000`. Check `http://localhost:3000/api/health` for database health.

The public read-only API begins at `http://localhost:3000/api/v1/stories`; see [docs/api.md](docs/api.md). The app includes a web manifest for standalone mobile installation. Offline caching/saved stories are intentionally not enabled yet, so readers are never shown stale evidence without a clear feature boundary.

Run verification with `pnpm lint`, `pnpm test`, and `pnpm build`.

## Configuration and secrets

Provider credentials can be supplied from `.env` for local/self-hosted use. The owner-only `/settings` dashboard can also store them, encrypted at rest, when both `VERITAS_ENCRYPTION_KEY` and `VERITAS_ADMIN_PASSWORD` are configured. Saved secrets are never returned after saving. Never commit `.env` or the `data/` directory.

To add an RSS or Atom source, add a reviewed feed record to `registry/feeds.json`, then run `pnpm ingest`. Veritas stores metadata and a short attributed excerpt—not full article copies—and links readers to the publisher’s canonical page.

## Documentation

Start with [PLAN.md](PLAN.md). Architectural, security, provider, methodology, testing, and design decisions are in [docs](docs/).

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Automated CI runs migrations, linting, tests, and the production build on pushes and pull requests. Follow [SECURITY.md](SECURITY.md) for vulnerability reporting.

## Licence

The intended application licence is AGPL-3.0-or-later, pending maintainer confirmation. No licence file has been added yet.
