# Testing and evaluation

## Deterministic software tests

Use Vitest with local fixtures for domain/provider/unit/integration work and Playwright for small, critical browser journeys. Do not use live news, search, LLM, or fact-check APIs in ordinary tests. Provider contract fixtures include malformed, missing, localized, duplicate, rate-limited, and changed-format payloads.

| Area | Required checks |
| --- | --- |
| URL and source resolution | tracking removal, canonical/AMP aliases, query ordering, IDN/host normalization, source aliases, preservation of raw provenance |
| Acquisition | feed parsing, limits/backoff, idempotency, legal retention markers, errors and redaction |
| Deduplication/lineage | duplicates, close headlines, syndicated/wire markers, non-duplicates, owner versus reporting-chain distinction |
| Clustering/ranking | pair scoring, hard conflicts, time windows, merge/split history, importance without volume-only domination |
| Data/API | SQLite migrations/constraints, single-writer lock, schema validation, pagination/filter correctness, unknown states |
| Security | credential encrypt/decrypt/rotation/delete, no secret return/logging, SSRF hostile URLs/DNS/redirects, injection sanitization, CSRF/authorization |
| Accessibility/UI | semantics, keyboard navigation, focus, contrast, mobile layout, reduced motion, loading/error/empty states, text alternatives |

Run browser coverage on Chromium and WebKit for core flows; Playwright supports these engines and isolated test contexts ([docs](https://playwright.dev/docs/browsers)). Add Firefox where cost allows. Keep snapshot tests sparse; prefer behavioral checks.

## Intelligence evaluation sets

Version source data, annotations, scorer, prompt/template, model, and evaluation reports. Split fixtures into development and held-out sets. Human labels have guidelines, multiple reviewers where stakes justify it, adjudication, and a record of disagreement.

| Capability | Representative held-out cases | Measurements / release gate |
| --- | --- | --- |
| Story clustering | multilingual/region-specific stories; same person, different event; breaking updates; wire copies; mergers/splits | pair precision/recall, cluster purity/completeness, false-join/split rate; never relax thresholds if hard-conflict false joins rise |
| Summaries | developing stories, corrections, contested facts, sparse evidence | factual support and correct attribution rate; no ungrounded statement tolerated in reader-facing summary |
| Claim decomposition/status | compound claims, numerical claims, causal claims, opinions/predictions, conflicting primary evidence | atomicity, status agreement, evidence precision/recall; display no status if evidence thresholds fail |
| Framing/omissions | carefully curated cross-source examples across political contexts/languages | cited-span precision, annotator agreement, false-motive rate; require sample/caveat output |
| Diversity/blindspots | wire-dominated scenarios, imbalanced source pools, unknown classifications, geographic/sector cases | denominator correctness, unknown disclosure, no flag below minimum evidence/sample thresholds |
| Grounded Q&A (later) | answerable, unanswerable, adversarial, stale, conflicting-evidence questions | citation entailment, abstention quality, hallucination/misattribution rate |
| Injection resistance | hostile HTML/text asking for secrets/tool use/rule changes | zero policy violations and no instruction-following from retrieved content |

## Evaluation operating rules

Automated tests prove mechanics; they do not prove political or factual fairness. Ship a reader-facing intelligence feature only with a baseline, documented sample/method limits, a release threshold, sampled human review, and rollback/disable path. Re-run evaluations after provider/model/prompt/methodology changes, and keep reports attached to analysis versions. Corrections become new fixture cases.
## Current implemented baseline

`pnpm db:migrate`, `pnpm lint`, `pnpm test`, and `pnpm build` are required locally and in CI. Tests cover URL canonicalization, XML parsing limits, conservative clustering, encrypted credentials, provider endpoint SSRF policy, claim and reviewed-summary input validation, and GDELT record parsing.

The MCP command is additionally smoke-tested with a local stdio JSON-RPC initialization, tool listing, and `veritas_list_stories` call. The check asserts the server starts, advertises only its read tools, and keeps protocol stdout parseable.

Registry tests require evidence-linked review metadata, unique IDs/URLs, and public HTTPS feed addresses. The shared endpoint-policy tests also cover a private DNS answer before acquisition; ordinary tests make no live feed request.

Browser-local following tests validate that malformed storage is ignored and only unique UUIDs are retained; the UI still needs interactive browser coverage when that runner becomes available in this environment.

Locale tests choose the first valid browser language preference, fall back deterministically to English, and refuse to format invalid timestamps. The full production build verifies request-header rendering across the server component tree.

## Labelled clustering baseline

`evals/clustering.json` is a small, version-controlled pair set that the test suite evaluates against the automatic headline-overlap rule. It is a regression tripwire, not a quality claim: it currently contains one true pair and one hard negative. Expand it with reviewed, jurisdiction-diverse examples before changing the clustering threshold or adding new signals.

The current deterministic rule also tests explicit opposing-action pairs (for example, open/close and approve/reject) and recorded publication-time proximity. It remains a small regression baseline, not a claim of production-quality multilingual clustering.

## Reader-facing evidence gate

Published claims must have a linked story report and an attributed note. Timeline items currently represent publication dates only. Diversity cards disclose the count of sources with recorded ownership; they do not calculate independence, political balance, or blindspots until the data model and labelled evaluation set support those claims.

Story-level primary-material records are additionally bounded to reviewed HTTPS links without embedded credentials, an explicit material type, and a relevance note. Claim-to-primary-material attachments preserve an explicit supporting, contradicting, or context relationship; neither display treats a linked fact check or official record as a blanket verification result.

New claim evidence must include a bounded attributed source span. Claim type and all six status values are schema-validated; a `confirmed` assessment is rejected without a linked supporting primary material or fact check. Tests currently cover these deterministic validation rules. The next evidence evaluation fixture must measure whether reviewer-entered spans actually support the atomic claim and whether status assessment remains appropriate as conflicting evidence arrives.

Correction inputs require an existing, same-story target and a bounded explanation. A correction and the `story-derived-v1` report-count recomputation run in one SQLite transaction; tests cover the validation boundary, while a targeted integration fixture remains required before claiming broad correction-workflow coverage.

Claim-to-primary-material evidence is now validated to the same story as the claim. Reader output labels publisher-report evidence and primary-material evidence separately; both use discrete support, contradiction, or context relationships and neither becomes an automatic verdict.

## Reviewed-summary guard

A reader-facing reviewed summary is accepted only when it is 20–1,000 characters and tied to a non-rejected report already in its story. The page distinguishes this `operator-summary-v1` record from a short ingestion excerpt, which remains explicitly unreviewed. This enforces provenance mechanically, but does not substitute for the held-out factual-support evaluation required before automated summaries are introduced.
