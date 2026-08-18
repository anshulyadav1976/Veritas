# Security and privacy

## Secrets and BYOK

Credential entry is TLS-only and server-side. On receipt, validate size/format and encrypt with authenticated encryption using a server-held root key or KMS-managed data-encryption key; store a versioned encrypted envelope, provider identifier, endpoint policy, label, and masked suffix only. The raw key is returned to neither browser nor API after save, and never enters logs, traces, analytics, error messages, fixtures, exports, or support screenshots. Decrypt immediately before an outbound provider call in a server/worker memory boundary; restrict access by user/tenant and audit metadata, not values.

Require connection test, replace, delete/revoke, key rotation, retention/deletion policy, strict redaction, rate/cost controls, and server environment validation. Self-host defaults require an explicit high-entropy encryption key; startup must refuse production mode without it. Do not rely on simple database encoding or a plaintext “encrypted” flag.

## SSRF and extraction defenses

Custom OpenAI-compatible base URLs, article canonical URLs, feeds, redirect targets, and webhooks are untrusted network targets. A hosted deployment must:

- accept only `https` (plus narrowly documented local development exception);
- parse URLs with a real URL parser, resolve DNS, reject loopback/private/RFC1918, carrier-grade NAT, link-local, multicast/reserved, IPv6 local/unique-local, and cloud metadata IP ranges;
- re-check each resolved connection target to mitigate DNS rebinding; disable redirects by default or validate every hop identically;
- use egress firewall/metadata-service protections, allowlisted ports, short timeouts, response/body-size limits, and no proxy credential forwarding;
- treat domain allowlists as stronger than denylists where practical; document a clearly opt-in relaxed self-host policy.

This follows the threat model in the [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html). Test hostile URL forms, DNS answers, redirects, IPv4-mapped IPv6, decimal/hex IP forms, and metadata endpoints.

### Implemented dashboard policy

The owner dashboard currently allows a custom base URL only for an OpenAI-compatible credential. It requires HTTPS, no embedded credentials, the default HTTPS port, and DNS answers that are all public; direct/private, loopback, link-local, carrier-grade NAT, reserved, multicast, unique-local, and IPv4-mapped private addresses are refused. Dashboard endpoints are resolved and checked again immediately before each connection-test or grounded-Q&A request; redirects are disabled. Environment variables remain an explicit operator-controlled escape hatch for local development or a private model gateway; do not expose a dashboard that can reach such a gateway to untrusted users.

## Untrusted content and AI

Feed/page/article text, HTML, embedded metadata, PDF text, external fact checks, and user prompts are data—not instructions. Sanitize/strip active content before rendering; never execute fetched scripts. Separate trusted system policy, tool policy, untrusted retrieved evidence, and user input in model messages. Article-analysis workers get no browser automation, filesystem access, credential access, or arbitrary networking. Models cannot call secret-bearing providers. Schema validation, citation checks, output limits, injection fixtures, and human correction paths are mandatory.

### Current grounded Q&A boundary

The owner-only Ask This Story route sends a question and the story’s bounded, attributed excerpts to the configured OpenAI-compatible model. It supplies no tools, network access, browser access, provider credentials in model content, or full article copies. The model must return JSON with a bounded answer and numeric citations; Veritas rejects malformed output and citation IDs outside the supplied excerpt set. A successful response is an evidence-grounded synthesis, not a verification verdict. This deliberate constraint reflects the official API’s structured JSON-response options ([reference](https://platform.openai.com/docs/api-reference/evals/deleteRun?lang=python)).

## Application protections

Use secure, HttpOnly, same-site cookies; CSRF protection for cookie-authenticated mutations; authorization checks per user/tenant; rate limits on secret tests and costly analysis; validated schemas at every trust boundary; CSP and output escaping; dependency updates and vulnerability review. Never leak whether another user owns a credential or bookmark. Use least-privilege database roles when deployment demands it.

## Privacy

News interests and reading behavior can reveal sensitive political beliefs. Default to public anonymous reading, collect only the data needed for an explicit feature, make personalization/history/media-diet analytics opt-in and understandable, offer account data deletion, and plan portable export only after data provenance is mature. Do not sell behavioral profiles or add invasive engagement telemetry. Saved story/offline PWA data must have an obvious local clear control and staleness disclosure.

### Current local reading list

Saved stories are a browser-local `localStorage` list of public story IDs. Veritas does not transmit it, attach it to an account, or use it for ranking. The saved-stories page states that clearing browser storage removes the list; a future offline cache must add an explicit clear control and freshness label before caching reporting or evidence.

### Current local follows and brief

Following is a separate browser-local list of up to 100 validated story UUIDs. The `/following` page filters the already-public current story list in the browser; it does not transmit followed IDs, create an account, call an AI provider, or produce push/email notifications. Removing browser storage removes the list. Older, superseded, or no-longer-indexed stories are deliberately not persisted as a private server-side follow record. The design uses origin-scoped `localStorage` and the cross-tab `storage` event as specified by [MDN’s Web Storage API reference](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API).

### Offline behavior

The installed PWA registers a deliberately minimal service worker. It caches only the offline fallback document and uses it only when a navigation cannot reach the network. It does not cache story pages, articles, excerpts, claims, or API responses, so the application cannot present stale evidence as current reporting.

### Current media-diet history

Media-diet tracking is disabled by default. When the reader opts in locally, the browser stores only story IDs and timestamps, capped at 200 visits. The panel makes this boundary explicit and has a control that removes both the history and opt-in flag. The data is never sent to Veritas or used for ranking.

## Copyright and records

Record acquisition policy, source attribution, retention expiry, and link provenance with each article. Store bounded permitted excerpts by default and delete transient full-text analysis input. Build takedown/correction and retention operations before offering optional archives. A legal review is necessary before asserting fair-use, robots, or provider-term interpretations for public hosting.
