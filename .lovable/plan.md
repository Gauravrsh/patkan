# Patkan LinkedIn page assets and high-resolution logo refresh

## Confirmed setup

- **LinkedIn industry:** Technology & Internet
- **Company size:** 1 employee
- **Website:** https://www.patkan.in
- **Brand treatment:** preserve the current cream, ink, and orange Patkan identity
- **Logo refresh scope:** website, browser-tab icon, extension icons, and social-sharing image
- **Deliverables:** downloadable master assets plus exact LinkedIn-ready exports

## Banner text wireframes — choose one before artwork is produced

All three use the required **1128 × 191 px** canvas and keep LinkedIn’s profile-photo overlap area visually quiet.

### A — Product statement (recommended)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  [quiet / overlap-safe]     PATKAN                                           │
│                             turn a rough thought into a surgically           │
│                             crafted prompt, instantly.        patkan.in      │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Cream background, black wordmark, orange trigger accent.
- Clearest explanation for someone discovering Patkan for the first time.
- The short height is used for one strong idea rather than decorative detail.

### B — Brand minimal

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  [quiet / overlap-safe]            PATKAN                  /पट्कन/           │
│                                    speak. polish. post.         patkan.in     │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Most elegant and spacious.
- Strongest for brand recognition, but explains less about what the product does.

### C — Rough thought → surgical prompt

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [quiet / overlap-safe]   rough thought      [ PATKAN ]      surgical prompt  │
│                          “write an ad…”          →          role · task ·     │
│                                                               guardrails     │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Demonstrates the product transformation visually.
- Most product-led, but denser and less legible at LinkedIn’s compact banner height.

**Recommendation:** A. It communicates the product immediately, remains readable on mobile, and matches the current homepage/share-card story.

## LinkedIn copy

### Tagline — 83 characters

> Turn a rough thought into a surgically crafted prompt, instantly—inside your AI chat.

### Overview

> Patkan is a browser extension that turns a rough thought into a clear, surgically crafted prompt—right inside the AI tools you already use. Type what you need in everyday language and Patkan structures the context, task, guardrails, questions, and desired output so your AI conversation starts on the right track.
>
> Built for professionals who want stronger AI results without learning prompt engineering, Patkan works across leading browser-based AI assistants.
>
> Website: https://www.patkan.in

### LinkedIn fields

- **Industry:** Technology & Internet
- **Company size:** 1 employee
- **Website:** https://www.patkan.in

## Assets to create

### Vector master and profile logo

- Rebuild the current square Patkan mark as a crisp vector master, preserving its existing geometry and appearance rather than redesigning it.
- Export:
  - `patkan-logo-master.svg`
  - `patkan-linkedin-profile-300x300.png`
  - `patkan-logo-2048x2048.png` for future reuse
- Keep transparent outer corners and verify the mark at both full size and favicon size.

### LinkedIn banner

- Create the selected wireframe at exactly `1128 × 191 px`.
- Export PNG plus a high-resolution 2× working copy (`2256 × 382 px`).
- Respect LinkedIn’s left-side profile-photo overlap and test legibility at mobile display size.

### Website and product replacements

- Replace bitmap logo appearances on the website with the vector master.
- Generate purpose-sized browser icons instead of shrinking one bitmap at runtime.
- Replace the extension icon source and rebuild both Chrome-family and Firefox packages.
- Regenerate the `1200 × 630 px` social-sharing image using the sharp mark while retaining the existing message and brand direction.
- Do not alter homepage copy, layout, product behavior, or the carousel artwork.

## Downloadable files

Place the reusable package in the Files section:

```text
patkan-brand-assets/
├── patkan-logo-master.svg
├── patkan-logo-2048x2048.png
├── patkan-linkedin-profile-300x300.png
├── patkan-linkedin-banner-1128x191.png
├── patkan-linkedin-banner-2x.png
├── patkan-social-share-1200x630.jpg
├── patkan-linkedin-page-copy.md
└── patkan-brand-assets.zip
```

## Verification

- Inspect every exported image at native dimensions and at expected display size.
- Check for blur, halos, clipped corners, text overflow, and LinkedIn profile-photo overlap.
- Verify the website header, small inline marks, browser tab, social preview source, and rebuilt extension packages.
- Verify desktop and mobile pages remain unchanged apart from sharper logo rendering.
