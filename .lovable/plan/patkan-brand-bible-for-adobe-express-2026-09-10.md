# Patkan Brand Bible (for Adobe Express)

## Goal

One PDF that a designer — or Adobe Express — can follow to produce on-brand social posts for the Patkan content calendar, derived from two existing sources of truth: the 18-slide admin carousel and the homepage copy.

## What you get

1. `patkan-brand-bible.pdf` — the full document.
2. Reference images bundled alongside it (colour chips, type samples, layout examples) so you can upload them into Adobe Express as visual guides.

## Contents of the bible

1. **Brand in one page** — what Patkan is, the one-line promise, who it is for, and the single idea every post must carry.
2. **Voice and tone** — pulled from the real homepage and carousel lines: lowercase narration, sentence case for spoken lines, Hinglish allowed, dry humour, short punchy lines, no corporate marketing speak. With a do/don't list and rewrite examples (bad line → Patkan line).
3. **Copy patterns that work** — the exact structures already proven in the carousel: the frustrated opener, the "OR" pivot, the one-word payoff ("intelligent!!"), "bas ek.", the question-then-answer, the dictionary card, the closing sign-off. Each with a fill-in-the-blank template.
4. **Colour system** — cream paper, ink, orange accent, muted text, rule lines; hex values, usage ratios, what may never be coloured orange, contrast rules.
5. **Typography** — Fraunces for headlines, Inter for body, mono for the `//` token; weights, case rules, line-height, size ladder expressed as percentages of canvas width so it scales to any format.
6. **Layout grid** — margins, the numbered section label with rule, the swipe hint, the footer line, the orange progress ribbon, and where the logo tile is allowed to sit.
7. **Format specs** — per-format canvas sizes with safe areas, headline size, max words, and which layout patterns suit each:
   - LinkedIn: carousel 1080x1350, single image 1200x627, square 1080x1080, cover 1128x191
   - Instagram: square 1080x1080, portrait 1080x1350, story/reel 1080x1920
   - Facebook: post 1200x630, square 1080x1080, story 1080x1920, cover 1640x856
8. **Slide/post archetypes** — the reusable page types abstracted from the 18 slides: hook, pivot, statement, list, definition, payoff, sign-off. Each with word limits and an ASCII wireframe.
9. **The 18 slides as a worked example** — every slide shown as archetype + copy, so the pattern is visible.
10. **Logo and mark rules** — clear space, minimum size, allowed backgrounds, the `/पट्कन/` badge, what never to do.
11. **Ready-to-use content-calendar starters** — a table of post themes mapped to archetypes and formats.
12. **Adobe Express handover notes** — a short section written as instructions the tool can act on: exact hex codes, font names with fallbacks, and a per-format recipe.

## Reference images (delivered with the PDF)

- Colour swatch sheet with hex values.
- Type specimen: Fraunces and Inter at each role.
- Three layout examples rendered at 1080x1350, 1080x1080 and 1080x1920 using real Patkan copy.

## Technical notes

- Copy and colour values are read from `src/routes/_authenticated/admin.carousel.tsx` and `src/routes/index.tsx`; no source files change.
- PDF built with reportlab using Fraunces and Inter registered as TTFs so the specimen pages render in the real brand faces; layout examples rendered as images and embedded.
- Every page converted to an image and visually inspected for clipping, overlap and font failures before delivery.
- Output written to `/mnt/documents/patkan-brand-bible/`.
