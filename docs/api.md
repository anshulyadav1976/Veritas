# Read-only API

The initial public API is intentionally narrow and has no API-key, mutation, provider, or credential endpoints.

## `GET /api/v1/stories`

Returns the same public story previews as the home page.

| Query parameter | Meaning |
| --- | --- |
| `limit` | Optional integer from 1–100; defaults to 30. |

The response is JSON with `data` and a `meta.count`. It deliberately contains only public story fields: stable ID, headline, summary, state, importance, article/publication counts, and update time. It uses `Cache-Control: no-store`; a future release can introduce explicit public cache semantics once freshness and deployment behavior are measured.

Invalid query input receives a generic `400` JSON error. The API does not enable cross-origin access by default. Operator and credential routes are not part of this surface.
