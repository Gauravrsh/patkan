# Patkan share card (og:image) — 3 options

## Goal

Create a proper 1200×630 share card so links to patkan.in render a clean, designed preview in WhatsApp, X, LinkedIn, iMessage, etc. — replacing the current auto-screenshot preview.

## Step 1 — Generate 3 candidate cards

All three in the existing Paper & Ink design language: warm cream background, ink text, orange accent, the `//` Patkan mark, Space Grotesk + JetBrains Mono. Clean and straightforward, no clutter, no fake UI screenshots.

**Option A — The dictionary card**
The hero's dictionary entry, scaled up: "patkan पटकण" with phonetic /ˈpʌt.kən/, the Marathi origin chip, and the definition "to perform, execute, or complete an action instantly, promptly, and without friction or delay, in a single swift motion." Plus the `//` mark and patkan.in.

**Option B — The everyday phrase**
"Good prompts work better. I know that, but its too much to type!" with the "— Is that you?" line, styled like the hero quote block. `//` mark and patkan.in below.

**Option C — The value proposition**
"Patkan — Turn a rough thought into a surgically crafted prompt, instantly." with the supporting line "works inside ChatGPT, Claude, Gemini, Microsoft Copilot, Perplexity, and more." `//` mark and patkan.in.

I generate all three as images and present them side by side for you to pick one.

## Step 2 — Wire in the winner

- Save the chosen card as a real file at `public/og-image.png` (1200×630, kept under ~300 KB so WhatsApp/X/LinkedIn previews render reliably).
- Add `og:image` and `twitter:image` meta tags pointing to `https://patkan.in/og-image.png` on the homepage route head (`src/routes/index.tsx`). Other routes keep inheriting behavior as-is.
- No copy, layout, or visual changes to the page itself — metadata only.

## Step 3 — Verify

- Confirm the image loads at `/og-image.png` in the preview.
- Confirm the meta tags appear in the rendered page head.
- Note: the card appears on the live site only after the next publish; WhatsApp/X may also cache their last scrape and need their link-preview debugger to refresh.

## Technical details

- Image generation via the built-in image tool, premium tier for legible typography.
- Exact card copy finalized with you if any wording needs adjusting before generation.
- The two losing candidates are discarded unless you want them kept.
