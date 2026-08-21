# Prompt Architect — expert prompt generator

A single-purpose chat app: you describe a task in plain language, an AI interviewer asks only the follow-ups it actually needs, and it assembles a surgically structured prompt in the fixed 7-section format.

## Core experience

Two-pane layout on desktop, stacked on mobile:

```text
+---------------------------+---------------------------+
|  CHAT (adaptive interview)|  PROMPT DRAFT (live)      |
|  - you: "help me write..."|  [ROLE & PERSONA]         |
|  - AI: one focused Q      |  [CONTEXT & BACKGROUND]   |
|  - you: answer            |  [PRIMARY OBJECTIVE]      |
|  - AI: next gap only      |  [CONSTRAINTS]            |
|                           |  [OUTPUT FORMAT]          |
|  [ composer ]             |  [INPUT DATA]             |
|                           |  Copy  ·  .md  ·  .txt    |
+---------------------------+---------------------------+
```

- The AI reads your first free-form description, extracts whatever it can, and asks about gaps **one question at a time** — never a form, never a fixed 7-step march.
- The draft panel fills in progressively; sections not yet known show as dimmed placeholders so you always see what's still missing.
- When the AI has enough, it says so and the draft is marked complete. You can keep chatting to refine ("make the persona more skeptical", "add a constraint about no external libs") and the draft updates.
- Copy to clipboard, and download as `.md` or `.txt`.
- Everything is session-only: no login, no database. Refreshing starts a new session.

## Output format (fixed)

Every generated prompt uses exactly the seven bracketed sections you specified, in order, with the guardrail block always present (no filler, no assumed requirements, dense practical explanations) and merged with any constraints you add. `<reference_data>` is included only when you supply reference material.

## Visual direction

Clean and crisp — clarity and confidence. Light neutral canvas with a deep ink foreground, one confident accent for actions and the completion state, generous whitespace, a crisp geometric sans for UI, and a monospace face for the prompt draft so it reads like an artifact rather than chat text. Subtle dividers instead of heavy cards. Dark mode supported through the same tokens. No gradients, no purple, no sparkle iconography.

## Technical approach

- **Frontend:** TanStack Start. The app is the index route (`src/routes/index.tsx`); a placeholder home page is replaced.
- **Chat UI:** AI Elements primitives (`conversation`, `message`, `prompt-input`, `shimmer`) installed via the shadcn registry, styled to the design system.
- **Model call:** streaming server route at `src/routes/api/chat.ts` using the AI SDK against the Lovable AI Gateway. `LOVABLE_API_KEY` stays server-side.
- **Structured draft:** the model runs with a single `update_prompt_draft` tool it calls as it learns each section; the UI renders the accumulated draft from those tool calls, so the panel and chat never disagree. Tool activity stays collapsed by default.
- **System prompt:** locks the interviewer role, the 7-section template, one-question-at-a-time behavior, and a "stop asking once sufficient" rule so it never interrogates endlessly.
- **State:** React state only, per session. No Lovable Cloud, no local storage.
- **Errors:** gateway failures (rate limit, credits) surface as visible inline chat errors, not silent assistant replies.
- **SEO:** unique title/description/OG tags on the index route.

## Out of scope

Accounts, saved prompt library, cross-device history, prompt templates gallery, team sharing. Easy to add later if you want them.
