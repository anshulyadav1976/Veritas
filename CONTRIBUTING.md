# Contributing to Veritas

Thank you for helping build an evidence-first news reader.

## Before opening a pull request

1. Read [AGENTS.md](AGENTS.md), [docs/intelligence-methodology.md](docs/intelligence-methodology.md), and [docs/security-privacy.md](docs/security-privacy.md).
2. Keep changes small, testable, and attributable. Do not add publisher full text, credentials, proprietary bias datasets, or unlicensed source data.
3. Run `pnpm db:migrate`, `pnpm lint`, `pnpm test`, and `pnpm build`.

## Data and assessment contributions

Source identity, ownership, orientation, reliability, and claim records can affect people and institutions. Contributions must include a stable evidence link, jurisdiction/context, date or effective range where known, methodology/version, and uncertainty. Do not submit a categorical political or factuality label without evidence. Maintainers should preserve corrections and disputed evidence rather than silently rewriting history.

## Security reports

Do not open a public issue for a suspected vulnerability. Follow [SECURITY.md](SECURITY.md).
