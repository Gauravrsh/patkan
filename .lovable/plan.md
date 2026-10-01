# Patkan hero video — frame-first approval

## Outcome
Replace the dictionary card in the homepage hero with a silent, looping product demonstration **only after the frames are individually approved**. The first deliverable is a reviewable set of lossless PNG keyframes; no video, homepage replacement, or publish happens at the first gate.

## Phase 1 — create the frame deck
- Produce one consistent 16:10 composition (1280 × 800) in `/mnt/documents/hero-video-frames/`, with timestamped, sequential PNGs for: empty chat and scrolling platform ribbon (0–3s); partially and fully typed cold-email request (3–8s); the pause and orange `//` trigger (8–10s); transformation and fully readable structured output (10–13s). Include intermediate keyframes where needed to judge layout and text fidelity, rather than implying that six still images alone constitute smooth motion.
- Show the 14 platforms named in the brief, matching the 14 host integrations visible in `extension/content.js`: ChatGPT, Claude, Gemini, AI Studio, Perplexity, Copilot, Grok, DeepSeek, Meta AI, Mistral Le Chat, Poe, Notion AI, Kimi, Qwen. Check the provenance and display rights of every platform mark; where a faithful official mark is unavailable, use a labelled neutral treatment rather than inventing a logo.
- Use the saved Patkan brand kit as the visual authority: cream `#F3EFE4`, ink `#1C1917`, orange `#D96C2C`, muted text `#4B4643`, hairline `#D5CFC2`; Fraunces for display, Inter for interface text, JetBrains Mono for `//`. This supersedes the alternative hex values in the pasted brief, as agreed.
- Preserve the exact user-supplied on-screen script, including the raw sentence, “Transforming...”, and each of the five structured-prompt lines; do not silently edit or add words. This is an **illustrative scripted demonstration**, not a recorded real transform or a claim that the engine generated those exact assumptions.
- Inspect every PNG for typography, logo accuracy, clipping and consistency; present each with its timestamp and description for individual sign-off. Do not generate the final video or change the website yet.

## Phase 2 — approval gate
Pause for explicit approval or requested revisions on **every frame**. Rework rejected frames and show them again. The pasted message stops at `[OUTPUT FORMAT]: Subject line + 3-paragraph plain-text body`, so the remaining 13–16s resolution/loop cannot be finalized until the user supplies the rest of the intended ending; do not invent an outro or approve one implicitly.

## Phase 3 — only after all frames and ending are approved
- Build deterministic in-between motion (typing cadence, horizontal icon ribbon, trigger pulse, prompt rearrangement), not a static-image slideshow. Export a compact silent MP4 at `public/patkan-hero-brand.mp4`; provide an additional WebM only if it meaningfully reduces size and browser support is verified. Validate duration, legibility, loop seam and compression on desktop and mobile.
- Replace only the homepage dictionary media area with the approved video and a representative poster. Preserve the existing hero actions, playground and homepage metadata. Move the existing H1 out of the deleted dictionary card so the homepage retains its accessible primary heading; review its visible treatment before applying any new copy. Keep video muted, autoplaying, looped, inline and respecting reduced-motion preference; expose an accessible nonmoving alternative.
- Check the rendered homepage at desktop and mobile sizes, including the first viewport, video framing, poster fallback, no clipping, and functioning existing calls to action. Do not publish without a separate request.

## Technical notes
The current hero in `src/routes/index.tsx` is a two-column layout on desktop, with the dictionary card first on mobile (`order-1`), and its only H1 sits inside that card. The homepage currently has no video element. Build the review frames and motion off-app; use the project only for the approved final asset and integration. The brand kit's palette differs from the site's current semantic tokens, so the final integration must align the artwork with the existing page without introducing hardcoded component colours.
