# Ready-to-paste Lovable prompts: Adobe Express brand kits for findoom.in and vecto.fit

## What you'll get

Two precise, copy-paste prompts — one for the **findoom.in** Lovable project, one for the **vecto.fit** Lovable project. Each prompt tells that project's Lovable agent to produce the same Adobe Express Premium brand command centre kit that was built for Patkan, adapted to that brand's own assets and design tokens.

Each prompt instructs the agent to:

1. **Mine its own project for brand truth** — logo files (SVG/PNG), colour tokens from global CSS / Tailwind theme, font families and weights actually in use, tagline and description copy from the homepage metadata and landing copy.
2. **Enforce the wordmark rule if one exists** (Patkan's was "always patkan.in, never patkan alone") — the prompt asks the agent to detect and state the brand's logo usage rule, or flag it for you to decide.
3. **Produce the kit in Files** (`/mnt/documents/<brand>-adobe-brand-kit/` + zip):
   - **Cheat sheet (PDF)** — brand name, tagline, overview copy, hex codes with names and usage, font list with Adobe-library fallback names, and a step-by-step walkthrough of Adobe Express's Add menu (Logo / Color palette / Font / Graphic) matching the screenshots you'll upload.
   - **Logos** — square mark, horizontal lockup, wordmark-only, each in light + dark variants, as transparent PNG (2048px) + SVG, with text converted to paths so no font is needed downstream.
   - **Colour palette** — hex list to type into Adobe's palette creator + a swatch PNG.
   - **Fonts** — the actual font files ready for Adobe's Upload button (variable fonts instantiated to the static weights in use), plus fallback names.
   - **Graphics** — the brand's recurring visual elements (rules, ribbons, badges, icon marks) as transparent PNG/SVG.
4. **Verify every exported file visually** before delivery, and change nothing in the app itself.

## Deliverable

A markdown file in Files with both prompts, clearly labelled, so you can paste each into the right project along with your Adobe Express screenshots.

## Technical details

- Output: `/mnt/documents/brand-kit-prompts-findoom-vecto.md` — one document, two prompts.
- Prompts are written to be self-contained: they reference the Patkan kit structure as the spec, so the other projects don't need access to this project's files.
- No changes to any project code.
