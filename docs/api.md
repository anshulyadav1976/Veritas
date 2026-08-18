# Read-only API

The initial public API is intentionally narrow and has no API-key, mutation, provider, or credential endpoints.

## `GET /api/v1/stories`

Returns the same public story previews as the home page.

| Query parameter | Meaning |
| --- | --- |
| `limit` | Optional integer from 1–100; defaults to 30. |

The response is JSON with `data` and a `meta.count`. It deliberately contains only public story fields: stable ID, headline, summary, state, importance, article/publication counts, and update time. It uses `Cache-Control: no-store`; a future release can introduce explicit public cache semantics once freshness and deployment behavior are measured.

## Local MCP server

`pnpm mcp` starts a local stdio [MCP server](https://ts.sdk.modelcontextprotocol.io/v2/get-started/first-server) for a process-owning host. It uses the public database read model and exposes two schema-validated tools:

- `veritas_list_stories`: optional `limit` (1–30) and `region` (`US`, `GB`, or `IN`).
- `veritas_get_story`: required stable UUID `storyId`.

Both return public reading data only. The server registers no write, ingestion, provider, secret, filesystem, or outbound-network capability. Stdio is deliberately chosen for this first self-hosted integration: it has no HTTP listener, CORS configuration, browser surface, or remote authorization model. A future remote MCP transport requires a dedicated authorization and host/origin review before implementation.

The protocol owns stdout, so startup diagnostics are written only to stderr. Verify a host integration by listing the two tools and calling `veritas_list_stories`; this repository also performs that raw JSON-RPC smoke check during implementation.

Invalid query input receives a generic `400` JSON error. The API does not enable cross-origin access by default. Operator and credential routes are not part of this surface.
