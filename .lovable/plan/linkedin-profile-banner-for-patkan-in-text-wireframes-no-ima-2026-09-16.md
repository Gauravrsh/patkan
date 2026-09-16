# LinkedIn profile banner for patkan.in — text wireframes (no image generation yet)

## Task

Three text-based wireframe options for the 1128 × 191 px LinkedIn profile banner. Only the
approved option proceeds to artwork. The banner must carry:

- the patkan.in wordmark (always `patkan.in`, never `patkan` alone)
- the square logo tile: orange slashes on the dark rounded square
- the supplied line: **Prompt engineer for everyone**
- overall tone in the Patkan light orange/cream family

## LinkedIn banner safe-space constraints (applied to every option)

- Canvas: exactly 1128 × 191 px, cream `#F3EFE4` background.
- **Left overlap zone:** the profile photo covers roughly the leftmost ~300 px on desktop and
  more on mobile. Nothing essential sits in x 0–300; that area stays quiet cream.
- **Mobile crop:** phones crop the outer edges, so all words and the logo tile live within the
  central band x ≈ 320–1050, vertically centred in y ≈ 30–160.
- No text or tile touches any edge; minimum ~40 px clear on top/bottom.

## Palette and type

- Background: cream `#F3EFE4`; body text: ink `#1C1917`; accent: orange `#D96C2C`.
- Wordmark and tagline: Inter (matches the site wordmark treatment); logo tile rasterized from
  the current vector master.
- Lowercase narration per brand voice, except the wordmark itself.

---

## Option A — Product statement (recommended)

Logo tile and wordmark lead, tagline reads as one clean line to the right. The most
instantly legible at banner height.

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│ ░░ quiet overlap-safe ░░   [TILE] patkan.in      prompt engineer for everyone   │
└────────────────────────────────────────────────────────────────────────────────┘
```

- Logo tile (~64 px) at x ≈ 340, vertically centred; `patkan.in` wordmark beside it
  (Inter SemiBold, ~34 px, ink).
- Tagline `prompt engineer for everyone` right-aligned (Inter Regular, ~26 px, ink),
  with `prompt engineer` in orange as the accent.
- Single optical baseline across all three elements.

## Option B — Centered brand stack

The most spacious and elegant; brand elements centred, tagline whispered beneath.

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│ ░░ quiet ░░          [TILE]  patkan.in                                          │
│ ░░ quiet ░░        prompt engineer for everyone                                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

- Line 1: tile + wordmark centred as one lockup (wordmark ~30 px).
- Line 2: tagline centred, ~22 px, muted `#4B4643`, wide tracking, lowercase.
- Slightly smaller scale; strongest for pure brand recognition.

## Option C — Statement-first split

The tagline is the hero, the brand lockup anchors the right edge. Most product-led.

```text
┌────────────────────────────────────────────────────────────────────────────────┐
│ ░░ quiet ░░      prompt engineer                    [TILE] patkan.in            │
│ ░░ quiet ░░      for everyone                                                   │
└────────────────────────────────────────────────────────────────────────────────┘
```

- Tagline left (after the safe zone), set large on two lines (Fraunces italic, ~30 px,
  "engineer" in orange).
- Logo tile + wordmark lockup right-aligned, vertically centred.
- Boldest hierarchy; denser than A at 191 px height.

## Recommendation

Option A — one idea, one baseline, reads at a glance on desktop and mobile, and matches the
homepage/share-card story.

## After approval

1. Render the approved wireframe at exactly 1128 × 191 px plus a 2× working copy (2256 × 382 px).
2. QA at native size and LinkedIn mobile feed size: overlap clearance, crop safety, contrast,
   wordmark legibility, no clipping.
3. Deliver PNGs in Files.
