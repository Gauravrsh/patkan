# Scrap the build — reset to a blank slate

Delete the entire Prompt Architect app so we can start fresh on Patkan as a browser extension.

## What gets deleted

- All app UI: the two-column prompt builder, form, live prompt panel, suggestion input, AI chat components.
- All app logic: prompt rendering/draft library, suggestion server functions, AI gateway server module, chat API route.
- The generated logo mark and favicon art tied to Prompt Architect.
- All backend usage from the app code: the shared suggestions corpus tables and the usage-recording routine are dropped, and no app code will call the backend.
- Archived plan documents from the previous direction.

## What stays

- The project scaffolding required for the app to boot: routing root, styles entry, server error wrapper, build config, package manifest, tooling configs.
- Backend integration files that are auto-generated and cannot be hand-edited (they simply go unused).

## Resulting state

- A single blank home route with neutral placeholder text and clean page metadata — no branding, no features.
- Styles reset to the default token set (Prompt Architect's Archivo/cobalt theme removed).
- Typecheck and dev server run clean with zero leftover imports.

## Technical notes

Files removed: `src/components/PromptForm.tsx`, `src/components/PromptDraftPanel.tsx`, `src/components/SuggestInput.tsx`, `src/components/ai-elements/*`, `src/lib/prompt-draft.ts`, `src/lib/suggestions.functions.ts`, `src/lib/ai-gateway.server.ts`, `src/routes/api/chat.ts`, `src/assets/prompt-architect-mark.png`, `.lovable/plan/*`.

`src/routes/index.tsx` is rewritten as an empty page. `src/styles.css` reverts to the stock theme. Unused packages (`ai`, `@ai-sdk/react`, `@ai-sdk/openai-compatible`, `streamdown`, `motion` if unused) are removed. A migration drops `field_suggestions`, `field_ngrams`, and `record_field_usage`.

Nothing extension-related is scaffolded yet — that waits for your fresh instructions.
