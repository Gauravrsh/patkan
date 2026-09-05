# Pillar section — adaptive middle column width

## Problem

On desktop the three pillar cards currently share equal width (`md:grid-cols-3`). The middle card, "100X your AI.", contains the longest body copy, so it renders noticeably taller and thinner than the other two columns. The user wants the middle column to receive more width so all three cards end up with similar vertical length.

## Goal

Make the desktop pillar grid adaptively wider in the middle column so the three cards feel proportionally balanced, without changing any copy.

## Changes

1. In `src/routes/index.tsx`, replace the pillar grid container's equal-column class with an adaptive fractional width set, e.g. `md:grid-cols-[1fr_1.35fr_1fr]` or similar, tuned so the three cards end up at roughly equal visual height.
2. Keep the existing mobile behaviour: single-column stacked cards with the current numbered rail and hairline separators.
3. Preserve all existing copy, spacing tokens, hover states, and the top orange rule.

## Tuning approach

- Start with `1fr 1.35fr 1fr` for the desktop grid.
- If visual check shows column 2 is still too tall, increase its fraction (e.g. `1fr 1.5fr 1fr`); if it becomes shorter than the others, reduce it.
- The divider lines (`md:divide-x`) must remain continuous across the row, so the container keeps `md:divide-x md:divide-border`.

## Verification

- `bunx tsgo --noEmit` passes.
- Screenshot the pillar section at 1440 px and 850 px desktop widths; confirm the three cards have similar vertical extent and no horizontal overflow.
- Screenshot at 393 px mobile width; confirm single-column stack is unchanged.
- Confirm no copy or punctuation changed anywhere in the section.
