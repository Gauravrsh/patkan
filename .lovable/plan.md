# Patkan V2 — the prompt engine, not the template

## The honest answer on formatting

Structure helps, but the four fixed XML blocks Patkan ships today are the *elementary* version. What's actually
evidence-backed:

- **XML tags are Anthropic's own documented recommendation** — Claude is trained on them and reliably respects
  tag boundaries. They are the right choice for Claude, not universally.
- **OpenAI's guidance leans on Markdown headings** plus a system/developer vs user split. Heavy XML on GPT models
  adds tokens without a matching gain.
- **Gemini responds best to clear section headers plus an explicit output contract** (schema, length, format).
- **`**`, `***`, `[]`, `//` carry no model-side meaning.** They are visual decoration for humans. `[ROLE]`-style
  bracket headers work only because they read as a heading — Markdown does the same job more cleanly.

So the format is not the moat. What separates an expert prompt from a padded one:

1. **Intent classification** — a factual question, a creative task, and a spec request need different scaffolds.
   Wrapping "what's the capital of Peru" in role/context/task/constraints makes it *worse*.
2. **A measurable success criterion** — "done means X" is the single highest-leverage line most prompts lack.
3. **An output contract** — exact shape, length, and format of the answer, not a vague "be concise".
4. **Negative space** — what to exclude, what not to assume, what to do when information is missing.
5. **Reasoning instruction** — when to think step by step, when to skip it (reasoning models degrade if told to).
6. **A self-check clause** — "before answering, verify X" measurably cuts hallucinated specifics.
7. **Compression** — an expert prompt is *dense*, not long. Today's template inflates a 6-word input into 20 lines
   of boilerplate the user never asked for.

## What we build

### 1. Adaptive engine, not a template

Replace the single fixed scaffold with a compiler that makes three decisions before writing anything:

```text
raw input
   ↓
classify  → intent (question / build / write / analyse / transform / decide)
          → complexity (trivial / standard / deep)
          → target model (auto-detected from host, or user-chosen)
   ↓
select    → format dialect: XML (Claude) | Markdown (GPT) | Sectioned (Gemini)
          → block set: only the blocks this intent actually needs
   ↓
compile   → dense prompt + success criterion + output contract + self-check
```

Trivial inputs get a one-line sharpened prompt, not a spec. That restraint is what will read as expert.

### 2. Format dialects

One internal representation, three renderers. The extension auto-picks by host (claude.ai → XML,
chatgpt.com → Markdown, gemini → Sectioned); the side panel and web app expose an override.

### 3. Magic in the interaction

- **Streaming rewrite** — the prompt materialises token by token in place instead of a spinner then a dump.
- **Progressive disclosure** — the local scaffold appears instantly, the AI version morphs into it with a diff
  highlight on the lines that changed.
- **Clarify chips** — when the model detects a decisive missing fact (audience? platform? length?), it emits
  up to three one-tap chips above the box. Tapping one refines the prompt in place. No modal, no interview.
- **Intensity dial** — Light / Standard / Surgical. Light sharpens wording only; Surgical adds examples,
  self-check and full output contract.
- **Confidence line** — one short line under the result naming what it inferred, e.g. "Assumed B2B SaaS audience,
  Markdown output, no length limit given." Makes the magic legible instead of opaque.

### 4. Quality bar

A fixed eval set of ~30 real lazy inputs across intents. Every engine change gets scored against it for:
no fabricated requirements, every concrete detail preserved, correct dialect, length proportional to input.
This is what stops V2 quietly regressing into a fancier template.

## Technical notes

- `src/lib/patkan-core.ts` splits into: `personas.ts`, `dialects.ts` (three renderers over one block model),
  `classifier.ts` (local heuristic scaffold + intent guess), `meta-prompt.ts` (the system prompt that drives
  the compiler). The extension keeps a byte-identical mirror, as it does now.
- `/api/public/transform` gains `dialect`, `intensity`, and `targetModel` inputs, and returns
  `{ prompt, dialect, assumptions[], clarifiers[] }`. It switches to a streaming SSE response so the rewrite
  can render progressively; the extension and web app consume the stream. Quota logic and the 10/day cap are
  unchanged.
- Clarifier chips come from the same single AI call as structured fields — no second round-trip, no extra cost.
- Content-script injection stays as-is (execCommand/beforeinput per host adapter); streaming writes append into
  the composer in chunks with the same undo snapshot behaviour.
- Landing page demo is rebuilt around the dialect switcher and intensity dial so the differentiation is visible
  in the first ten seconds.

## Not doing

- No multi-turn chat interview. Clarify chips cover the same ground without the friction that killed the last build.
- No `**` / `[]` decoration. If a dialect needs emphasis, it's Markdown, rendered for a reason.
