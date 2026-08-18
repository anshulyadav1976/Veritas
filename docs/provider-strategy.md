# Provider strategy

Providers are replaceable, capability-scoped adapters. Their credentials, limits, fields, retention, attribution, and terms are stored as configuration/policy—not spread through the product. The project’s default OSS path must run without a paid provider. Provider terms change; check the linked official source before implementation or release.

| Provider | Purpose / interface | Auth, limits, and content | Default OSS role |
| --- | --- | --- | --- |
| RSS / Atom | Curated publisher discovery (`latest`) | Usually no key. Poll conservatively, honor feed/publisher terms. Feed normally supplies metadata/link, not redistribution rights. | **Yes.** Backbone; maintainer-curated registry. |
| [GDELT 2.0](https://www.gdeltproject.org/data.html) | Broad global discovery; stories/events/metadata signals | Public data/API surfaces; GDELT 2.0 updates at 15-minute cadence and covers 65 translated languages according to its documentation. Verify the relevant endpoint’s current terms/rate expectations before high-volume use. Do not treat discovered publisher content as sublicensed. | **Yes, optional by config.** Broad discovery, not the source of canonical truth. |
| [Media Cloud](https://www.mediacloud.org/documentation) | Research/historical media coverage discovery | Account/API as applicable; terms position it for academic, nonprofit, and journalistic research, prohibit selling/sublicensing access, and make clear it cannot grant rights to third-party story content ([terms](https://www.mediacloud.org/legal/media-cloud-terms-of-use)). | **No.** Optional research/BYOK integration pending terms review. |
| [Brave Search](https://api-dashboard.search.brave.com/documentation/quickstart) | Query-driven news/web discovery and source finding | API key in `X-Subscription-Token`. Current docs list usage-based pricing with $5 monthly credit and plan-specific quota/rate headers; code must honor response headers ([pricing](https://api-dashboard.search.brave.com/documentation/pricing), [rate limits](https://api-dashboard.search.brave.com/documentation/guides/rate-limiting)). Returns result URLs/titles/snippets. | **BYOK only.** Useful discovery, not default dependency. |
| [NewsAPI](https://newsapi.org/docs) | General news search/headlines | API key. Its current Developer plan is development/testing only, delayed and limited to 100 requests/day; production requires paid plan ([pricing](https://newsapi.org/pricing)). It does not provide full article content. | **BYOK only.** Never ship it as default production infrastructure. |
| [Guardian Open Platform](https://open-platform.theguardian.com/) | Guardian archive/content discovery | Developer key; Guardian advertises archive access from 1999 and free use for non-profit projects, with commercial packages separately discussed. Follow current terms/attribution/licensing at implementation time. | **BYOK only.** Single-publisher enrichment, not core discovery. |
| [Google Fact Check Tools API](https://developers.google.com/fact-check/tools/api/reference/rest) | Search existing ClaimReview fact-check records | Google API credentials/quota as configured in the project; `claims.search` retrieves fact-checked claims. It is evidence discovery—not a universal truth service. | **BYOK only, Phase 4.** |

## LLM and embeddings

Use one OpenAI-compatible client contract first: base URL, API key, model, structured-output capability, and explicit time/cost limits. OpenAI and OpenRouter can use it immediately; other OpenAI-compatible endpoints are configurable. Add provider-specific Anthropic, Gemini, or Ollama adapters only when required by a real user. Embeddings are an independent capability to allow a different model/provider; persist model ID/dimensions/version and never compare vectors from incompatible models.

Custom base URLs are a special security boundary: hosted instances allow HTTPS public endpoints only after DNS/IP validation and revalidation at connection time; deny loopback, private/RFC1918, link-local, multicast/reserved and metadata ranges, internal DNS results, nonstandard schemes/ports as policy requires, and redirects. Self-hosters may opt into relaxed rules with a conspicuous warning.

## Provider contract and operational policy

A provider yields normalized candidates plus provider provenance, never unverified product records. Adapters declare capabilities, required credentials, attribution, permitted retention, rate/backoff hints, and test-connection behavior. Every call has timeout, body-size bound, retry classification, redacted error, and usage record. Build exactly RSS and GDELT first. The generic shapes above are a design boundary, not a plugin framework to implement upfront.

## Source registry data

The initial registry contains only original community/maintainer assertions with citations, review timestamps, confidence, and methodology. Licensed rating providers may be queried through adapters only where their terms allow; proprietary AllSides, MBFC, and Ad Fontes data is neither scraped nor committed without explicit redistribution permission. Proposed changes should be reviewable data patches with evidence and regional methodology, subject to a later governance/moderation process.
# Provider strategy

## GDELT DOC 2.0 discovery

`pnpm ingest:gdelt -- '<query>' [timespan]` is an explicit, operator-run discovery command. It uses GDELT DOC 2.0 ArticleList JSON with a fixed HTTPS endpoint, `datedesc` ordering, a 15-second timeout, disabled redirects, and a 2 MiB response cap. The query is required; Veritas does not silently select topics or run a global crawl.

The command accepts GDELT’s documented duration syntax (for example `1day`, `12h`, or `2weeks`) and limits result count to the API’s documented 250-record maximum. It retains the outbound publisher URL, not a GDELT mirror, and treats GDELT source fields as discovery metadata—not a source assessment or factual verification.

GDELT provides a rolling corpus and can change coverage or response fields. The parser validates the small ArticleList subset that Veritas uses and drops malformed individual records rather than trusting an unbounded response. It is intentionally not an automatic background job until self-host operators establish their own query, cadence, and retention policy.

Research: [GDELT DOC 2.0 API documentation](https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/) documents ArticleList JSON, timespan syntax, and the 250-record maximum.

## OpenAI-compatible credentials

The owner dashboard can save an OpenAI-compatible key, base URL, and optional model encrypted at rest. When configured, that saved credential takes precedence over `OPENAI_API_KEY`, `OPENAI_BASE_URL`, and `OPENAI_MODEL`; otherwise the environment configuration is used. Secrets are resolved only in server code and never included in a page, API response, log, or connection-test result.

The dashboard’s **Test connection** action performs a bounded, no-redirect `GET /models` request with the bearer token and reports only generic success or failure. The official OpenAI model reference documents this endpoint and its bearer authentication pattern: [Models API](https://platform.openai.com/docs/api-reference/models/object). Compatible providers must expose the same route for this test. No provider request is made unless the owner explicitly invokes the test.
