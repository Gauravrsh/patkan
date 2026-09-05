# Carousel preview inside the app, with a shareable link

Goal: see the 18-slide carousel in the preview window, get a public URL you can share, and be able to ask for slide-by-slide edits.

## What you'll get

- A new page at `/carousel` on your site (works in preview immediately, and at `https://patkan.in/carousel` once published).
- The same 18 slides, same Patkan look (cream/ink/orange, Fraunces + Inter), arrow-key and swipe navigation, slide counter.
- The page is hidden from search engines and not linked anywhere on the homepage, so visitors only reach it if you send them the link.
- Slide text lives in one clearly labelled list, so you can say "slide 7, change the line to X" and I make exactly that change.

## What changes

- New page file for the carousel route, holding the slide list and the layout styles.
- Slide copy kept exactly as you supplied it, split on the `----` separators, no grouping, no rewording.
- Search-engine instruction added to the page so it stays out of results; not added to the sitemap.
- The standalone downloadable file stays where it is; the page becomes the working copy we edit.

## After approval

1. Build the page and check every slide renders cleanly at desktop and phone sizes.
2. Send you the preview link and the public link.
3. Once you lock the slides, export to PDF for LinkedIn.

## Technical notes

- New route `src/routes/carousel.tsx` (TanStack file route), slides defined as a typed array of `{ layout, kicker?, headline, body? }` rendered by one component.
- Styles scoped to the page via a local `<style>` block reusing the existing brand tokens; no changes to `src/styles.css` or the homepage.
- `head()` sets a page-specific title/description plus `robots: noindex, nofollow`; route intentionally omitted from `src/routes/sitemap[.]xml.ts`.
- Keyboard (left/right), pointer swipe, dot indicators, and responsive scaling ported from the standalone HTML.
