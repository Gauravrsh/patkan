# Patkan /v2 — craft pass

Refine the existing `/v2` page only. Zero copy changes: every visible word, punctuation mark and capitalisation stays exactly as it is today. Only typography, spacing, hierarchy, iconography, and small interaction details change. `/` stays untouched.

## 1. Brand mark

Create a proper Patkan mark: `//` set in the mono face inside a rounded square, with a few small sparkle glints around it, in the warm orange-on-ink palette. Use it in:

- the top header, next to the wordmark
- the Patkan card inside the browser mockup in the install guide
- (Grammarly card keeps a neutral placeholder mark, not the Patkan one)

Replace the generic sparkle icon everywhere it currently stands in for Patkan.

## 2. Mobile and desktop coherence

The page currently reads as a desktop layout squeezed down. Rework the responsive scale so mobile feels designed, not shrunk:

- One shared type scale that steps down cleanly on small screens; headings stop wrapping awkwardly, body copy gets a comfortable measure.
- Consistent section rhythm: same horizontal gutters and vertical spacing rules on every section instead of the current per-section values.
- Header: mark + wordmark + phonetic badge shrink gracefully; the button becomes compact on narrow widths without clipping.
- Hero: dictionary card and the monologue column get mobile-appropriate padding and ordering.
- Playground: two panels stack with a clear divider, chips wrap in tidy rows, the compiled-prompt panel keeps a sensible height instead of a tall empty block.

## 3. The three pillar cards (screenshot feedback)

On mobile they are currently full-height blocks with a huge empty gap between the number row and the heading. Fix: cards size to content on mobile, number and icon sit in a tight top rail, heading follows at a controlled distance, and the equal-height rail returns only at desktop. Add subtle top-border accents and hairline separators so the trio reads as one editorial band on both widths.

## 4. Install guide

Bring in the nuances from the reference:

- Real toggle switches (track + knob) instead of the word "ON"; Developer mode uses the same real toggle.
- Browser mockup: proper chrome with traffic lights, address pill, and a page surface with real card structure; Patkan card visibly selected with a ring; Details / Remove rendered as actual small buttons.
- Buttons row (Load unpacked / Pack extension / Update) styled as real buttons, with "Load unpacked" as the emphasised one.
- Mobile: the mockup becomes a narrow single-column device frame that mirrors the reference phone rendering, and the numbered steps get a connected vertical rail with clearer step typography.
- Browser tabs become a scrollable pill row on mobile with an edge fade, rather than a clipped underline strip.

## 5. Privacy section

- Remove the standalone "Hardcoded manifest.json Matches" box.
- "these approved URLs ↗" becomes a real inline trigger; clicking it opens a small popover/sheet containing the same URL list and the same explanatory line, verbatim.
- The four guarantee blocks get numbered rails, better icon placement, and a single-column stack with hairlines on mobile.

## 6. Section below the install guide

That band currently feels blank. Without adding copy, give it presence: tighter heading-to-body pairing, an accent rule, balanced two-column proportions on desktop, and proper stacking on mobile so the whitespace looks intentional.

## 7. Lovable badge

Turn off the "Edit with Lovable" badge via publish settings.

## Technical notes

- All work in `src/routes/v2.tsx` plus one new mark component and (if needed) small local subcomponents; no changes to `/`, the extension, or backend.
- Colours strictly through existing semantic tokens in `src/styles.css`; no hardcoded colour utilities.
- The popover uses the existing shadcn primitive already in the project.
- Route metadata and single H1 stay as they are.

## Verification

- Diff the rendered text of `/v2` before and after to prove not one word changed.
- Screenshot at 393px and 1440px; check no horizontal overflow, no clipped chips, no console errors.
- Confirm `/` renders unchanged.