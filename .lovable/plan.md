# Playground V2 copy and hierarchy pass

## Goal

Apply the four approved copy/typography corrections to the `/playgroundv2` review page only. The live homepage (`/`) stays untouched.

## Changes (exact copy shown for approval)

### 1. Hero headline treatment — "Your Personal Prompt Engineer"

Promoted from the micro eyebrow to a bold orange stand-alone line above the H1:

- `Your Personal Prompt Engineer` — text-xl sm:text-2xl, font-semibold, text-primary (orange), its own line.
- H1 `Stop writing prompts. Just end your sentence with //` — unchanged.
- Subhead paragraph — unchanged.

### 2. New eyebrow directly above the playground box

Small orange line between the hero text and the card:

> `Try Patkan in action. Just type anything and end it with //`

### 3. Professions section — straight text swap

Replace the single line `Built for 30 professions` with:

> `Built for all professionals - not just software engineers`

The heading below it (`Whatever you do, Patkan speaks your language.`) and the profession ticker stay unchanged.

### 4. "How it works" section — keyword-rich heading + SEO/AEO steps

- Eyebrow: `How it works` (unchanged).
- Heading (replaces `Three steps. No new tab.`): `How to turn any sentence into a prompt inside your AI`

Three steps — new titles and crisp, query-answering descriptions:

| # | Title | Description |
|---|-------|-------------|
| 01 | Add to Desktop Browser | Install the free Patkan prompt generator extension for Chrome, Edge, Firefox, Brave, Arc, and Opera. It takes under 60 seconds — no sign-up. |
| 02 | Open your AI in browser | Open ChatGPT, Claude, Gemini, Microsoft Copilot, Perplexity, or any supported AI chat. Patkan sits inside the chat box you already use — no new tab. |
| 03 | Type anything and end with // | Write your task in plain words and end it with //. Patkan turns the sentence into a structured expert prompt instantly — no tab switching, no copy-paste. |

## Scope

- Only `src/routes/playgroundv2.tsx` is edited.
- No API, behavior, or homepage changes; the page stays the static UI-review mock.
- Page head metadata (title/description/og, noindex) is unchanged.

## Verification

- Check the build log after the edit for errors.
- Render `/playgroundv2` in the browser and confirm: the orange hero line, the new playground eyebrow, the swapped professions line, and the new steps read exactly as approved.
- Screenshot at desktop and mobile widths to confirm no overflow or broken hierarchy.
