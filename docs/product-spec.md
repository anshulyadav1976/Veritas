# Product specification

## Product statement

Veritas is an open-source evidence layer for the news. Its primary unit is a real-world **story**, not an individual article. It helps readers understand what happened, what evidence supports it, how coverage differs, and where to inspect original reporting—without claiming AI can determine truth unaided.

## Principles

1. Evidence, provenance, and uncertainty are product features.
2. Historical source orientation, historical source reliability, article framing/evidence, and claim verification are separate concepts.
3. A count of URLs is not independent corroboration. Preserve wire/reprint and ownership relationships.
4. Primary documents and independently corroborated reporting outrank model priors.
5. Global intelligence is calculated once, versioned, and shared; user personalization is a cheap, understandable layer on top.
6. International political context cannot be reduced to one US left/right line.
7. Public webpages are not automatically licensable to republish.

## Users and jobs

| User | Job |
| --- | --- |
| Everyday reader | Get a calm, concise account of an important developing story and inspect the reporting. |
| Curious reader | Compare coverage, framing, reporting chains, ownership, and primary evidence without being told what to believe. |
| Contributor/researcher | Improve open source metadata/methodology with evidence and traceable review. |
| Self-hoster | Run a modest instance with curated feeds and optional own credentials. |

## V1 product boundary

V1 is English-first, public reading with topic/region feeds, canonical stories, source links, a basic transparent source registry, explainable clustering, optional personalized interests/saves, and carefully scoped global story summaries. It must make clear that early stories can be incomplete.

It does not ship claims verdicts, blindspots, full-content archives, user media-diet scores, “Ask this story,” notifications, public API/MCP, or native apps. Those need mature data, evaluations, and governance.

## Core surfaces

- **Home:** finite editorial feed: For you (if opted in), Top stories, topic/region sections, and one carefully qualified coverage-difference module when defensible.
- **Story:** What happened; well-supported facts; uncertainty; coverage; sources and primary material. Reveal more evidence progressively.
- **Source profile:** identity, country/language/type, ownership assertions, historical assessments and their evidence/methodology; never use it as a verdict on an article.
- **Settings (later V1):** interests, intelligibility/display choices, credentials, appearance, and privacy—not a maze of technical controls.

## Success criteria

- A reader can reach original reporting and tell the difference between source metadata, derived analysis, and verified claim evidence.
- A contributor can see why an article belongs to a story and why a source assertion exists.
- A self-hoster can start a small instance without a mandatory paid provider.
- The interface rewards understanding, not infinite engagement.

## Licensing direction

Recommend **AGPL-3.0-or-later** for application code if protecting source availability for hosted derivatives is a core goal. The GNU describes AGPL as copyleft designed for network-server cooperation ([GNU AGPL overview](https://www.gnu.org/licenses/why-affero-gpl.html)). Its reciprocal requirements may reduce adoption by businesses that cannot release modifications. Keep original registry data in a separate directory and choose its licence only after maintainers decide contribution/governance terms; no third-party ratings data is redistributed unless its licence expressly permits it.
