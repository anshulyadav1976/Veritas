# Design direction

## Editorial intelligence, not dashboard theatre

**Audience:** a reader who wants to get oriented quickly, then inspect the evidence. **Single job of the primary story page:** turn a noisy cluster into a legible evidence trail. The visual direction is *field notes for a live story*: quiet document surfaces, precise metadata, and one distinctive “evidence margin” that stays attached to claims and comparisons.

## Design system proposal

| Role | Token | Use |
| --- | --- | --- |
| Paper | `#F7F8F6` | Main reading surface; cool rather than nostalgic cream. |
| Ink | `#182126` | Headlines and primary text. |
| Slate | `#617078` | Metadata, rules, quiet UI. |
| Signal | `#0E7490` | Links, focus, selected navigation; never a generic gradient. |
| Evidence | `#356B4A` | Supported/evidence treatment, always with text/icon. |
| Caution | `#9A5B13` | Developing/uncertain treatment, always with text/icon. |
| Dispute | `#9D3F3B` | Contested/contradicted treatment, always with text/icon. |

Typography should use **Newsreader** (variable editorial serif) only for major headlines and story summaries, **Public Sans** for interface/body, and `ui-monospace` for timestamps, counts, source IDs, and evidence labels. Load subsets, use system fallbacks, and avoid decorative typography on dense content. This pairing avoids a generic SaaS sans-only voice while retaining compact legibility.

Layout uses a 12-column desktop grid, 68–74ch reading measure, 8px spacing rhythm, 1px `Slate` separators, and 4px radius only where grouping needs it. Cards are organizational, not the default container. A deliberate signature is the **evidence margin**: on desktop, a slim aligned right column shows evidence status, source count, and anchors for claims/perspectives; on mobile it becomes an inline “Evidence trail” disclosure. It expresses provenance without adding ornamental UI.

## Information architecture

```text
Desktop:   [compact nav] [story/feed reading column              ] [evidence margin]
Mobile:    [top bar]
           [story/feed]
           [fixed bottom nav: Home · Search · Saved · Settings]
```

Home is finite and editorial: Morning/Evening brief, Top Stories, followed topics/regions, and one well-qualified coverage-difference invitation. Desktop side rail appears only for story context; it is removed rather than squeezed on mobile. Search is later, not a permanent overpowered control in V1.

Story hierarchy is fixed by reader need:

1. category, time and current development state;
2. headline and two-sentence neutral summary;
3. diversity/counts and a small “coverage is still developing” qualifier if relevant;
4. what evidence strongly supports;
5. what is uncertain/contested;
6. how coverage differs (if method/sample supports it);
7. primary sources and representative original reporting.

Use segmented in-page navigation only once sections exist; never launch empty tabs. Source rows are compact, textual and link-rich. Claims show a discrete label, one-line proposition, evidence count, caveat, and expandable cited trail. Comparison uses labeled source groups/headlines and simple segmented bars—not heat-map spectacle.

## Accessibility, motion, and states

Never convey political orientation or reliability using colour alone. Orientation is blue/neutral/rust *with text labels and patterns*; reliability uses evidence/caution/dispute language and a different palette. Each visualization has a table/text equivalent and declares its denominator/unknown share. Aim for WCAG AA contrast, semantic headings/landmarks, logical source order, visible `:focus-visible`, keyboard-operable disclosures, 44px touch targets, and no hover-only meaning.

Motion is limited to a short section reveal and loading progress; respect `prefers-reduced-motion`. Loading uses structural skeletons without invented facts. Empty states give the next action (“Follow a topic to shape this section”). Errors state the failed action and a retry; unavailable analysis says why rather than pretending completeness.

## Anti-patterns

No gradient hero, glass surfaces, glowing cards, omnipresent rounded rectangles, badge storms, fake certainty gauges, political colours in general chrome, ticker noise, infinite-feed addiction mechanics, or an assistant/chat widget competing with evidence. Build CSS/SVG/native primitives for the first compact bars and timelines; add a chart library only after several visualizations prove it necessary.
