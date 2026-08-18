# Design research

Research was limited to current public product material; references inform interaction patterns, not visual copying.

| Reference | What works | Adapt for Veritas | Do not copy |
| --- | --- | --- | --- |
| [Ground News](https://ground.news/product) | Story-level grouping, source comparison, a dedicated blindspot path, and a distinction between common top stories and preference feed. | A finite comparison-oriented story surface and transparent coverage-distribution disclosure. | Its branding, proprietary rating presentation/formula, visual system, or a simplistic universal political scale. |
| [Particle](https://particle.news/blog/introducing-particle-the-news-organized) | “Story, not article” organization, configurable interests, and presenting perspective as a route to full context. | Compact story cards that lead to source evidence; reader control over topic relevance. | Mobile-app styling, AI-summary centrality, or treating a spectrum indicator as sufficient explanation. |
| [Semafor Signals](https://www.semafor.com/article/02/05/2024/introducing-semafor-signals) | Explicitly distinguishing facts, analysis, and diverse global views; organized multi-source briefing. | Clear labels separating supported facts, uncertainty, comparison, and analysis. | Its editorial voice/formats or implying human editorial verification where Veritas uses a different process. |
| [Reuters](https://www.reuters.com/) | Restrained hierarchy, direct headline-to-source reading, and professional information density. | Calm typography, compact metadata, strong reading width, and subdued chrome. | Trade dress, page layout, logo/device cues, or publisher styling. |
| [Google News](https://news.google.com/) | Fast topical navigation and multi-source clustering at broad scale. | Familiar topic/region discovery and source lists. | Algorithmic feed opacity, dense link grids, or material design identity. |
| [Perplexity](https://www.perplexity.ai/) | Inline citation/provenance interaction makes assertions inspectable. | Evidence anchors and expandable source trails attached to findings. | Search/chat-first product framing or citations used as visual decoration without evidence quality. |

## Resulting choices

Veritas’s distinctive move is not another “bias dashboard”: it is an evidence margin that lets an ordinary reader move from a concise, neutral story to the exact articles, source attributes, and uncertainty behind it. This combines Semafor’s explicit content separation with Perplexity-style inspectability, but uses a quieter editorial reading surface and avoids a chat-first interface.

The product intentionally avoids generic AI visual tropes: an oversized gradient hero, purple accent, glass panels, card nesting, and a dashboard full of gauges. It also avoids cloning the broadsheet default: its cool paper/slate palette, field-note evidence margin, serif used only for the story voice, and narrow semantic colour system are specific to a live evidence product rather than an imitation newspaper.

Before implementation, use the available `frontend-design` skill to carry this direction through actual screens. Use the installed official MIT-licensed [Vercel web-design-guidelines](https://github.com/vercel-labs/agent-skills) as a code-review gate for interaction/accessibility/performance. The current environment includes `frontend-design` (its upstream skill is Apache-2.0 licensed), Ponytail, and `web-design-guidelines`.
