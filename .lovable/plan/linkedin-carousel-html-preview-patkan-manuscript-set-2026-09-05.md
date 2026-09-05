# LinkedIn Carousel HTML Preview — Patkan Manuscript Set

## Goal

Build a standalone HTML slideshow preview of the LinkedIn carousel using the user's exact copy and the approved "Manuscript" template set (Set 1). Each `----` separator in the supplied copy becomes one slide. Output is a single, self-contained HTML file saved to `/mnt/documents/` so it can be opened locally or shared without touching the live app.

## Resolved requirements

- **Slide mapping**: one fragment per `----` = 18 slides total. No grouping.
- **Execution**: recreate the three Manuscript layouts in HTML/CSS, not new image renders.
- **Delivery**: standalone `.html` file in `/mnt/documents/`, disconnected from the app.
- **Typography**: Fraunces (display/headlines) + Inter (body/labels), loaded from Google Fonts.
- **Palette**: cream paper `#F3EFE4`, ink `#1C1917`, orange accent `#D96C2C`; hairline rules; generous margins; lowercase display headlines.

## Slide inventory

1. "Kya ch***ya hai ye AI!!" (with an exhausted sigh!!)
2. OR
3. "This AI sucks!!" — if you are more Maya than Monisha (#IFKYK)
4. Is that you, more often than not? / I surely am.
5. Writing a good opening prompt is a game changer for any work with AI
6. It gives right context, guardrails, do's and don'ts, output format to AI.
7. It can ask you all the right questions before even getting started.
8. The outputs suddenly starts to get so much.. / how you always wanted it.. / How an AI should be
9. Intelligent!
10. So, what's the problem?
11. bas ek.
12. Itna type kaun karega!!
13. What if your rough first idea converts into a surgical prompt, even before it goes into your AI chat?
14. and sets your conversation on a totally different track.
15. The track that gets you 100X from your AI. Things that you had not thought of. Areas which you had overlooked. Scenarios you had not imagined.
16. Presenting patkan (dictionary screen)
17. Just type in your rough thought and end the sentence with a [//]. / See the magic for yourself.
18. website link

## Layout assignment

Use the three Manuscript templates in rotation, choosing the best fit per slide:

- **Cover layout** (1A): large centered Fraunces italic headline + subline + swipe hint. Used for high-impact opener and closer.
  - Slide 1 (cover opener)
  - Slide 9 ("Intelligent!")
  - Slide 16 ("Presenting patkan" — rendered as a dictionary-style cover variant)
  - Slide 18 (website link / closing)
- **Content layout** (1B): section label + headline + body paragraph + bullets/rules. Used for explanatory and problem slides.
  - Slides 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15
- **Closing layout** (1C): centered takeaway + orange rule + support copy + wordmark. Used for transition and CTA slides.
  - Slide 17 ("See the magic for yourself")

## File to create

`/mnt/documents/patkan-carousel-preview-v1.html`

## Implementation details

- Single self-contained HTML file with embedded `<style>` and `<script>`.
- Viewport: slides rendered at 1080×1350 CSS px inside a centered container, scaled down on smaller screens.
- Navigation: previous/next buttons, keyboard arrow keys, on-screen dots, swipe gestures on touch.
- Persistent slide counter (e.g., "03 / 18").
- Top/bottom hairline rules on every slide.
- Footer on every slide: "made with patkan · speak. polish. post."
- No external app routes, no sitemap entry, no navigation link.

## Copy fidelity rules

- Paste each fragment exactly as supplied, including punctuation, line breaks, asterisks, and `[//]`.
- Do not edit, sanitize, shorten, or reword any fragment. COPY SHALL NOT BE EDITED
- Preserve the user's line breaks within multi-line fragments.

## Verification

- Open the file in a headless browser at 1280×1800 and capture each of the 18 slides.
- Check for: text overflow, clipped edges, font loading, contrast, consistent margins, correct ordering, and navigation responsiveness.
- Fix any layout issues and re-verify before delivering.

## Out of scope for this plan

- PDF export (user requested this only after slides are locked).
- Publishing the preview to the live app or any public URL.
- Generating new PNG image renders.

## Next step after delivery

User reviews the 18-slide HTML preview, requests any copy/layout tweaks, and then approves the locked deck for PDF conversion.