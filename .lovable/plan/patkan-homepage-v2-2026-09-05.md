# Patkan homepage v2

## Goal

Create a separate public page at `/v2` that preserves the current Patkan homepage’s clean Paper & Ink design language while following the supplied screenshots’ content flow and sectional layout. The existing `/` homepage and its behavior remain untouched.

## Source-of-truth rules

- Use the user-supplied markdown as the first and authoritative source for every visible word, punctuation mark, capitalization choice, label, placeholder, and state.
- Use the screenshots to map that copy to the intended hierarchy, order, grouping, and visual composition.
- Do not rewrite, shorten, correct, paraphrase, or add marketing copy—even where grammar appears unusual.
- If a screenshot and markdown differ, the markdown wins.

## Page structure

1. Header navigation with Patkan identity, phonetic badge, links, and extension CTA.
2. Dictionary-style lexical introduction for “patkan,” including pronunciation states, definition, citation, and synonyms.
3. Relatable monologue and product value proposition with the supplied calls to action and free-tier note.
4. Two-column playground presentation using the complete supplied labels, controls, sample content, and output structure.
5. Three-part value section: “Invisible Execution,” “100X your AI.,” and “A tool, not a toll.”
6. “60 sec Installation Guide” with browser tabs, numbered instructions, and browser-extension mockup.
7. Privacy section with approved-URL drawer and four guarantee blocks.
8. Supplied footer copy.

## Visual and interaction treatment

- Reuse the current homepage’s warm neutral palette, orange accent, crisp typography, thin borders, compact radii, and restrained editorial feel through the shared semantic design tokens.
- Recreate the screenshots’ spacing, density, section rhythm, responsive stacking, and hierarchy without copying unrelated styling.
- All controls are visual-only on `/v2`: they may show designed static/default states, but will not download, navigate, transform text, play audio, switch browsers, or open drawers.
- Preserve accessibility semantics, visible focus treatment, readable contrast, and mobile-safe text wrapping despite the visual-only behavior.

## Technical details

- Add a dedicated TanStack route for `/v2` with page-specific title, description, Open Graph metadata, and a single H1.--------my fundamental objective behind the current exercise is to brainstorm and arrive on a new version of landing page PURELY from UI and Copy perspective. I am not looking for functionality right now. Is this Point needed? I don't want a single line of code to be written which is not needed.
- Keep implementation isolated so no copy, styling, behavior, or imports on `/` are altered.
- Use existing design-system controls where interactive-looking elements are needed and semantic tokens for all color roles.
- Build the browser/extension imagery as styled interface composition rather than introducing unapproved words into generated artwork.

## Verification

- Audit every rendered string against the supplied markdown, section by section.
- Confirm `/` is visually and functionally unchanged.
- Check `/v2` at desktop and mobile widths for ordering, overflow, overlap, and legibility.
- Confirm visual-only controls do not trigger downloads, navigation, transformations, audio, drawers, or tab changes.
- Confirm the page renders without console errors and has the required route metadata.