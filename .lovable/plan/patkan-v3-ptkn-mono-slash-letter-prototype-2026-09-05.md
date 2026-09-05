# Patkan /v3 — ptkn mono slash-letter prototype

## Goal

Create a new isolated route at `/v3` that is a pixel-for-pixel copy of the current `/v2` page, then apply the `ptkn` mono slash-letter brand direction to the header mast and any surfaces where the Patkan mark currently appears. Every visible word from `/v2` must remain identical. `/` and `/v2` are strictly read-only.

## Source-of-truth rules

- `/v2` is the copy source; duplicate its structure, sections, spacing, and every rendered string verbatim.
- The only permitted changes on `/v3` are brand-mark treatments: `Patkan` → `ptkn`, the `//` mark → mono slash-letter mark, and associated metadata/favicon references.
- No functionality changes: all controls stay visual-only.

## Brand direction

**Option 4 — mono slash-letter**

- Set the mast wordmark as `ptkn` in the existing mono face (`JetBrains Mono`).
- Redraw one letterform to embed the product’s `//` trigger naturally:
  - Preferred: the `k` becomes a single-stroke `/<` glyph, so the word reads `pt</n` but resolves as `ptkn`.
  - Alternative: the `t` crossbar extends as `//`, so the top of the `t` performs the trigger.
- Keep the mark compact, monochrome in default state, and tint it with the primary orange only on hover/focus.
- The full name, pronunciation, and meaning remain in the dictionary card below, exactly as on `/v2`.

## Scope of changes

1. **New route file**: `src/routes/v3.tsx` copied from `src/routes/v2.tsx`.
2. **New mark component**: `src/components/ptkn-mark.tsx` (inline SVG) so the slash-letter scales cleanly at 16px, 32px, and 48px without raster blur.
3. **Header mast**: replace the PNG mark + "Patkan" wordmark with the `ptkn` SVG mark and wordmark; keep the `/पट्कन/` phonetic badge.
4. **Browser mockup extension card**: replace the Patkan PNG mark with the `ptkn` SVG mark inside the selected extension card.
5. **Mobile connector / bridge**: replace the PNG mark with the `ptkn` SVG mark if it appears between playground panels.
6. **Footer**: keep the "✦ Patkan — quickly." line unchanged (copy must not change).-----change the icon to 
7. **Route metadata**: update title, description, og:url, and canonical to `/v3`.

## Files to create / modify

- `src/routes/v3.tsx` — new route, copy of `/v2` with mark swaps and metadata updates.
- `src/components/ptkn-mark.tsx` — new inline SVG mark component.
- `src/routeTree.gen.ts` — auto-generated; no manual edits.

## Files that must stay untouched

- `src/routes/index.tsx`
- `src/routes/v2.tsx`
- `src/assets/patkan-mark.png`
- `src/styles.css`

## Verification

- `bunx tsgo --noEmit` passes.
- `/v3` renders without console errors and without horizontal overflow at 393px and 1440px.
- Diff the rendered text of `/v2` and `/v3`; only the brand mark strings and route metadata differ.
- `/` and `/v2` render identically to before.
- The `ptkn` mark is legible at 16px, 32px, and 48px.