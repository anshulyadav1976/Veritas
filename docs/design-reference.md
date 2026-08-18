# Approved design reference

The user-approved visual reference is the bundled Claude Design prototype originally supplied as `Veritas design.html`. It is a reference artifact—not production source code and not a requirement to reproduce its generated implementation.

## Retain

- The cool off-white (`#F7F8F6`), ink, slate, teal, evidence-green, caution-amber, and dispute-red palette.
- **Newsreader** for editorial headlines and **IBM Plex Mono** for counts, timestamps, chain labels, and evidence references. Use a restrained sans-serif for body/interface copy.
- The distinct three-view approach: Desktop Brief, Desktop Story, and Mobile Story—not a single desktop design squeezed into a phone.
- Compact left navigation on desktop; four-item bottom navigation on mobile.
- The story hierarchy: concise summary → source/owner/reporting-chain counts → supported facts → uncertainty → coverage differences → evidence trail and original reporting.
- Expandable evidence sections and compact, numbered source rows that disclose reporting-chain status.
- A desktop evidence margin and a mobile inline Evidence Trail; this is the product’s signature interaction.
- Plain-language uncertainty states such as “estimates conflict” and “document pending.”

## Adapt before production

- Replace fictional content with live data only when the relevant citations and methodology exist.
- Treat all bars and counts as data visualizations: state the denominator, label meaning without colour, include unknown/unclassified share, and provide text equivalents.
- Preserve the overall compactness, but use semantic HTML, visible keyboard focus, labelled buttons, 44px touch targets, reduced motion, and responsive layouts.
- Do not copy the bundled artifact runtime or its generated components. Rebuild the visual system natively when implementation begins.

## Reference scope

Use the prototype as the authority for aesthetic direction and information hierarchy. The product, security, data, methodology, and accessibility documents remain authoritative when they conflict with a decorative or fictional prototype detail.
