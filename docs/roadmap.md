# Product roadmap

| Phase | Outcome | Include | Defer |
| --- | --- | --- | --- |
| 0: technical vertical slice | Prove the loop from discovery to readable story. | RSS + GDELT, permitted metadata, normalization, dedupe, conservative clusters, tiny source registry, public feed/story with original links. | accounts, BYOK, AI summaries, claims, PWA/offline. |
| 1: useful public product | A polished, self-hostable daily reader. | Responsive/PWA shell, topic/region feeds, source profiles, canonical summaries where justified, basic perspectives, explicit preferences/saves, Settings and secure BYOK. | verdicts, blindspots, ownership/chain metrics shown as authoritative, notifications, chat. |
| 2: evidence intelligence | Evidence-first comparisons that earn trust. | atomic claims, cited statuses, primary sources, cautious timeline, reporting-chain/ownership diversity, conservative blindspots. | public API, MCP, community voting/governance platform, media-diet analytics. |
| 3: platform and community | Mature capabilities on trusted data. | grounded Ask This Story, opt-in media-diet analytics, follows/digests, localization, reviewed registry contributions, public API/MCP. | native wrappers unless PWA evidence demands them. |

## Dependencies

Phase 1 requires stable story/source identity from Phase 0. Phase 2 requires labelled evaluation sets, provenance, source/ownership foundations, and methodology review; it must not be accelerated merely because an LLM can generate text. Phase 3 requires a defensible user data/privacy model and contributor governance.

## Community path

Invite data contributions as reviewable changes with citations, jurisdiction/context, confidence, methodology, and date—not hard-coded ratings. Maintainers review source identity/ownership claims and regional-methodology proposals; disputed changes preserve discussion/evidence and a correction trail. Establish a code of conduct, contributor licence agreement/developer certificate process, and data-governance policy before accepting high-stakes source assessments at scale.

## Internationalization

Schema already preserves original language, locale, source-country/region, multilingual entities, and UTC timestamps. V1 can be English-first but must avoid English-only slug/text assumptions. Start translations after canonical source provenance and display date/time localization are solid. Political orientation remains contextual; “Left/Centre/Right” is a display projection only where meaningful.
