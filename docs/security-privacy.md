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

## Untrusted content and AI

Feed/page/article text, HTML, embedded metadata, PDF text, external fact checks, and user prompts are data—not instructions. Sanitize/strip active content before rendering; never execute fetched scripts. Separate trusted system policy, tool policy, untrusted retrieved evidence, and user input in model messages. Article-analysis workers get no browser automation, filesystem access, credential access, or arbitrary networking. Models cannot call secret-bearing providers. Schema validation, citation checks, output limits, injection fixtures, and human correction paths are mandatory.

## Application protections

Use secure, HttpOnly, same-site cookies; CSRF protection for cookie-authenticated mutations; authorization checks per user/tenant; rate limits on secret tests and costly analysis; validated schemas at every trust boundary; CSP and output escaping; dependency updates and vulnerability review. Never leak whether another user owns a credential or bookmark. Use least-privilege database roles when deployment demands it.

## Privacy

News interests and reading behavior can reveal sensitive political beliefs. Default to public anonymous reading, collect only the data needed for an explicit feature, make personalization/history/media-diet analytics opt-in and understandable, offer account data deletion, and plan portable export only after data provenance is mature. Do not sell behavioral profiles or add invasive engagement telemetry. Saved story/offline PWA data must have an obvious local clear control and staleness disclosure.

## Copyright and records

Record acquisition policy, source attribution, retention expiry, and link provenance with each article. Store bounded permitted excerpts by default and delete transient full-text analysis input. Build takedown/correction and retention operations before offering optional archives. A legal review is necessary before asserting fair-use, robots, or provider-term interpretations for public hosting.
