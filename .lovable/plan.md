# Patkan /v2 — Playground enhancement

Rework only the Playground section of `/v2` per the approved wireframes. `/`, the rest of `/v2`, and all existing copy stay untouched. Controls remain visual-only. Decisions locked: real static compiled-prompt preview, `//` mark as the connector motif, horizontal-scrolling chips on mobile.

## Desktop layout

- Keep one bordered card with a 1px split; change panel ratio from 1:1 to 5:6 so the compiled-prompt panel is the hero.
- Input panel:
  - Replace the faint "I want to.." line with the approved rough-thought sample ("I want to.. write a PRD for redesigning the checkout flow" — reuse existing approved playground sample copy verbatim), styled with a dotted underline and caret to read as rough/human input.
  - TARGET AI and PERSONA chip groups keep their approved labels and explainer lines.
  - Custom persona field and full-width "Patkan it" button stay; button aligns with the bottom of the output panel's assumptions block.
- Output panel:
  - Replace skeleton bars with a static compiled-prompt preview in mono font: tag lines tinted in the accent color, body in ink, truncated with a soft bottom fade (no scrollbar).
  - Preview text is drawn only from the original supplied markdown's playground output structure — verbatim, no invented copy. If a needed line has no approved source, it is left out.
  - Add a "compiled for" strip at the top of the panel mirroring the selected chip state (e.g. "compiled for Claude · Engineering · Standard"), assembled from existing approved chip labels only.
  - Assumptions block gets a 2px accent left rail; clarifier chips keep dashed borders + "+" prefix.

## Mobile layout (393px)

- Split into two stacked self-contained cards (input card, output card) with 16px gutters, matching the page's radius/spacing rhythm.
- Between the cards: a vertical connector — short line with the `//` brand mark as the divider glyph — signifying the transformation.
- TARGET AI and PERSONA chip rows scroll horizontally with an edge fade instead of wrapping.
- Chip explainer lines collapse to a single truncated line on mobile; full text remains on desktop.
- Output preview capped at ~9 lines with a bottom fade; assumptions block and clarifier chips stay visible without scrolling.
- "Patkan it" closes the input card (not sticky): think → choose → transform → result.

## Technical notes

- All work confined to the `Playground` component (and small local subcomponents) in `src/routes/v2.tsx`; the `//` mark reuses the existing generated patkan-mark asset rendered inline as the connector glyph.
- Colors strictly via existing semantic tokens; no hardcoded color utilities.
- Everything stays visual-only: no state, no downloads, no transforms, no clipboard.
- Chip scroll rows use `overflow-x-auto` with a CSS mask/edge fade; truncation uses `truncate` with `min-w-0` guards per responsive patterns.

## Verification

- Diff rendered text of `/v2` before/after: only the approved playground sample lines may appear as new; nothing existing changes.
- Screenshots at 393px and 1440px: no horizontal overflow (page-level), chips scroll cleanly, connector renders, no clipped text.
- No console errors; `/` unchanged.
