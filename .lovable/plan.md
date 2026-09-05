# Restore the per-slide swipe hint on /admin/carousel

## What happened (verified from git history)

- Commit `b76b3d8` added a per-slide `cover-hint` (orange dot + "swipe →").
- Commit `1400b63` (the manuscript-2-content layout rewrite) deleted that block and did not re-add it in the new structure.
- A later attempt to restore it was reported as done but never persisted: no commit in history contains the element, and the current file has no per-slide swipe hint.

## Fix

In `src/routes/_authenticated/admin.carousel.tsx`:

1. Add a `.slide-swipe` element inside every slide, placed after `.slide-body` and immediately before `.slide-footer` (bottom-right, above the footer rule):
   - orange dot (same arrow-marker orange `#D96C2C` / `var(--orange)`)
   - lowercase gray "swipe" text in Inter, `var(--muted)`
   - right arrow "→"
2. Style it at `font-size: 2.6cqw` — matching the top-left orange slide number — right-aligned, sitting just above the footer hairline.
3. Because it is rendered inside the shared slide template, it appears on all 18 slides automatically.

## Verification (this time, with proof)

1. `rg "slide-swipe" src/routes/_authenticated/admin.carousel.tsx` shows the element and its CSS.
2. Authenticated Playwright run on `/admin/carousel`: screenshot slide 1 and slide 18, confirm the hint renders bottom-right above the footer on both.
3. Typecheck passes.
4. Confirm the element is present in the saved file before reporting done.
