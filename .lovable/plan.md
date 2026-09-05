# Make V2 the live homepage — migration checklist

V2 becomes `/`. Every V2 word and layout stays exactly as it is today; the only change is that the fake controls become real, wired to the engine already powering the current homepage.

## A. Route swap

- A1. Replace the contents of `src/routes/index.tsx` with the V2 page, keeping `createFileRoute("/")`.
- A2. Keep the existing homepage metadata approach but use V2's title/description; add `og:url` and canonical for `https://patkan.lovable.app/`.
- A3. Delete `src/routes/v2.tsx` so there is one homepage, not two. (Say the word if you'd rather keep `/v2` alive as a frozen reference.)
- A4. Old homepage code that no longer has a home (its playground, install list, privacy paragraph) is removed with it — nothing else imports it.

## B. Header — make the nav real

- B1. "Playground" and "Install Guide" become anchor links scrolling to those sections (`#playground`, `#install`), with scroll-margin so the sticky header doesn't cover the heading.
- B2. "Get Extension" becomes a real button that downloads `patkan-extension.zip` (same download logic as today's homepage, including the failure toast).
- B3. Add the Library / Sign in links the current homepage has, in the header, styled to V2's language. (Confirm: keep them, or leave the header exactly as V2 shows it and reach auth only via "Connect my account" lower down?)

## C. Hero

- C1. "Download the extension" → real download action (same as B2).
- C2. "Try it here first" → scrolls to the playground and focuses the input.
- C3. "10 transforms per day, free" stays; no change.
- C4. The "Listen" control on the dictionary card: make it speak `patkan` via the browser's built-in speech, or leave it decorative. (Confirm which — it is the one control with no backend behind it.)

## D. Playground — the real work

- D1. Replace the static "I want to.." line with a real auto-growing text input carrying that exact placeholder, seeded empty so the placeholder shows.
- D2. TARGET AI chips (Gemini / ChatGPT / Claude / Copilot) become the real selector: each maps to the engine's output dialect (Claude → XML, ChatGPT/Copilot → Markdown, Gemini → Sectioned). The explainer line under the row updates to the selected chip's existing text.
- D3. PERSONA chips become the real persona selector, mapped to the engine's existing persona ids; explainer line follows the selection. "Other" reveals nothing new — V2 has no custom field, so it maps to Auto unless you want the field back.
- D4. "Patkan it" (desktop bridge pill and mobile button) triggers the transform: instant local draft first, then the streamed sharpened result, exactly as today's homepage does.
- D5. Output panel shows the real compiled prompt in the same mono styling, with the accent tint applied to tag/heading lines. Bottom fade stays while text overflows; the panel scrolls once there is real content.
- D6. "compiled for Gemini · Auto" strip updates live from the two selections.
- D7. "Copy" becomes a real copy-to-clipboard with the tick confirmation.
- D8. The "Assumed:" rail fills from the engine's assumptions; when the engine returns none, the rail hides.
- D9. The dashed "+" chips become the real clarifier chips — clicking one re-runs the transform with that refinement.
- D10. "10/day free" in the input header becomes the live remaining count for the visitor (and the higher signed-in allowance when signed in).
- D11. Daily limit reached → inline message with a link to sign in and keep going, matching the extension's behaviour.
- D12. Busy state: button shows a spinner and is disabled; phase label wording follows today's homepage ("Drafting…", "Sharpening this…").
- D13. Errors surface as a toast, output falls back to the local draft. Requires the `Toaster` to be mounted (check root; add once if missing).

## E. Install guide

- E1. "Download Patkan v1.0" → real download.
- E2. Browser tabs become real tabs: selecting one switches the step wording where it differs (Edge/Opera use their own extensions URL; Firefox and Safari get an honest "not supported yet" note). (Confirm: do you want per-browser steps written, or should the tabs stay decorative until we have verified instructions for each? Writing them means new copy.)
- E3. Toggles, browser mockup, and extension card stay visual — they illustrate Chrome's UI, not ours.
- E4. Add a "Connect my account" action alongside download, as the current homepage has, so installed extensions can be linked to an account. (Confirm placement.)

## F. Privacy

- F1. No behaviour change; the approved-URL popover already works.
- F2. The listed URLs are read from the same source of truth as the extension's manifest so the page can't drift from reality. (Note: today V2 lists three URLs while the extension actually covers fourteen services — flag only; changing the list changes copy, so I won't touch it without your say-so.)

## G. Footer

- G1. Keep V2's footer as-is.

## H. Verification before I call it done

- H1. Typecheck passes.
- H2. `/` renders at 393 px and 1440 px with no overflow and no console errors.
- H3. End-to-end: type a rough sentence, switch target AI and persona, run it, see the streamed prompt, copy it, click a clarifier chip, watch the remaining count drop.
- H4. Download works from all three buttons.
- H5. Anchors scroll correctly under the sticky header.
- H6. Signed-out and signed-in both behave, including the limit message.
- H7. Every visible word matches V2 today, except anything you approve under E2.

## Open questions before I start

1. Keep `/v2` as a frozen copy, or delete it (A3)?
2. Header auth links — keep V2's header untouched, or add Library / Sign in (B3)?
3. "Listen" — real pronunciation or decorative (C4)?
4. Browser tabs — write per-browser steps (new copy) or keep decorative (E2)?
