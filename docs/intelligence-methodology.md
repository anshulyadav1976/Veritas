# Intelligence methodology

## What the product means

| Concept | Meaning | It is not |
| --- | --- | --- |
| Source orientation | Historical/contextual description of a publisher’s editorial position, potentially across economic, social, establishment, internationalist, and government-critical axes. A simple Left/Centre/Right label is optional and context-specific. | An article’s stance or truthfulness. |
| Source reliability | Transparent historical characteristics such as corrections practice, transparency, cited evidence, retractions, and independently licensed assessments. | A political label or a verdict on every report. |
| Article framing | How a particular article selects, emphasizes, orders, and describes facts. | Proof of motive, bad faith, or a source-wide trait. |
| Claim verification | Evidence-backed status for one atomic factual proposition. | A model probability or universal truth score. |

## Evidence hierarchy and claim statuses

Prefer primary documents, official datasets, legislation, court records, filings, transcripts, academic work, official reports, independent corroboration, then recognized fact-check databases. Sources can conflict and primary sources can be incomplete or self-serving; explain the reason for weighting.

Use: **Confirmed**, **Well supported**, **Contested**, **Unverified**, **Contradicted**, or **Opinion / prediction / not fact-checkable**. Every non-opinion state requires linked support and/or contradictory evidence, a scope/time statement, provenance, and a confidence *band about the assessment process*. Do not display a pseudo-precise truth percentage or treat model knowledge as evidence.

Claims are atomic: “Policy X took effect on date Y,” “the measure changed by Z in period P,” and “policy X caused the change” are different assertions. Supporting and contradicting evidence remain distinct.

### Current implementation boundary

The first implemented claim workflow is operator-authored, not automated. An owner records one bounded claim, a discrete status, one story report, its relationship (`supports`, `contradicts`, or `context`), and an attributed evidence note. The UI labels the record with its workflow version and preserves the link to the publisher. It does **not** infer truth from repeated articles, synthesize claims from model memory, or show a missing record as a negative result.

## Cross-source findings

Compare a story’s evidence set rather than asking a model to label every article biased. A shared fact needs corroboration across genuinely independent chains or primary evidence. A disputed claim needs a clear conflict between credible evidence/interpretations. A framing finding names the compared sample, source/article criteria, observed differences, cited passages/headlines, unknown/unclassified share, and confidence.

“Omitted context” is only an observed coverage difference: material present across a defined comparison set and absent in another, stated with sample and time-window caveats. It is never proof of intentional suppression.

## Blindspots and diversity

A blindspot is a carefully qualified lopsided-coverage signal, not proof that a constituency hid a story. Calculate distributions from **deduplicated reporting chains** in an explicit monitored source pool and window. Show the denominator, source-pool composition, unclassified share, owner/wire concentration, region/sector dimension, and sample minimum. Do not show one when coverage is sparse, dominated by unclassified sources, or source pool imbalance makes comparison misleading.

Political, geographic, and sector/community blindspots are separate dimensions. Exposure and media-diet analytics are opt-in and describe reading patterns, never a moral score.

## Ownership and provenance

Ownership is a documented, dated assertion with confidence and evidence; incomplete records remain incomplete. Each reader-facing analysis exposes source articles/primary documents, the workflow/method/model version, and correction history. “Why does Veritas think this?” must be answerable.

## AI limitations and safeguards

LLMs synthesize structured summaries, claim candidates, comparisons, and explanations; deterministic code handles URLs, counts, filters, timestamps, hashes, and database joins. Validate every structured response against a schema; attach citations; use quality/evaluation thresholds; retry/fallback safely; and allow no-output/uncertain status. Models can hallucinate, misattribute, make false equivalences, overclassify ideology, miss changing facts, and confuse repeated wire copy for corroboration. A model cannot establish truth by assertion.

Scraped content is hostile data, never instruction. Isolate system instruction, retrieved article text, user input, tool policy, and secrets. Model workers receive minimum permissions and never credential values. See [security/privacy](security-privacy.md).
