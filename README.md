# Veritas

Open-source, self-hostable news intelligence: a transparent evidence layer that groups reporting into stories and preserves links to original sources.

## Status

Phase 0 foundation. The application starts with an editorial shell and SQLite migrations; RSS/GDELT ingestion is the next milestone. It is not yet a complete news product.

## Local development

Requirements: Node.js 22.13+ and pnpm.

```bash
cp .env.example .env
pnpm install
pnpm db:migrate
pnpm dev
```

Open `http://localhost:3000`. Check `http://localhost:3000/api/health` for database health.

Run verification with `pnpm lint`, `pnpm test`, and `pnpm build`.

## Configuration and secrets

Provider credentials can be supplied from `.env` for local/self-hosted use. Dashboard-managed credentials will be added in Phase 1 and require `VERITAS_ENCRYPTION_KEY`; they will be encrypted at rest and never returned after saving. Never commit `.env` or the `data/` directory.

## Documentation

Start with [PLAN.md](PLAN.md). Architectural, security, provider, methodology, testing, and design decisions are in [docs](docs/).

## Licence

The intended application licence is AGPL-3.0-or-later, pending maintainer confirmation. No licence file has been added yet.
