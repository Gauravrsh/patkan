# Prompt Architect — form-driven redesign

Replace the chat interview with a clean two-column builder: a structured form on the left, a live prompt that assembles itself on the right as you type.

## Layout

```text
+-------------------------------+------------------------------+
| BUILD YOUR PROMPT             |  LIVE PROMPT                 |
| Role & Persona        *       |  [ROLE & PERSONA]            |
|  [ domain/role      ]         |  You are ...                 |
|  [ traits           ]         |                              |
| Context & Background  *       |  [CONTEXT & BACKGROUND]      |
|  [ scenario         ]         |  ...                         |
|  [ target users     ] optional|                              |
|  [ stack            ] optional|  [PRIMARY OBJECTIVE]         |
|  [ core problem     ]         |  ...                         |
| Primary Objective     *       |                              |
| Constraints (chips)  optional |  Copy · .md · .txt · Reset   |
| Output Format (list) optional |                              |
| Reference Data       optional |                              |
+-------------------------------+------------------------------+
```

- Left column scrolls independently; right column is sticky on desktop and collapses below the form on mobile.
- Sections are grouped with quiet dividers and a small numeric index — no heavy cards.
- Every field is labelled with either a red asterisk (`Required`) or a muted `Optional` tag, plus a one-line hint of what good input looks like.
- A slim completeness meter at the top of the form shows how many required fields are done; the right panel shows `DRAFT` until all required fields are filled, then `READY`.

## Field behaviour

- Required: role/domain, scenario, primary objective. Everything else is optional and renders as a bracketed placeholder in the preview until filled.
- Constraints: repeatable line items with add/remove; the three fixed guardrails are always shown as locked, non-deletable entries so the user sees them in the output.
- Output format: repeatable numbered items, pre-seeded with the three defaults, editable and removable.
- Reference data: textarea; the `<reference_data>` block only appears in the output when non-empty.
- Unfilled optional parts appear dimmed in the preview so it is obvious what is still a placeholder.

## Right panel

- Monospace rendering of the exact seven-section format, updating on every keystroke.
- Actions: Copy, download `.md`, download `.txt`, and Reset form.
- Form state persists to `localStorage` so a refresh does not lose work.

## Technical notes

- `src/routes/index.tsx` becomes the form builder; the chat UI (`useChat`, AI Elements conversation/message/prompt-input) is removed from this route.
- `src/lib/prompt-draft.ts` is reused as-is for `renderPrompt` and the section metadata; add a `required` flag per field for the labels and the meter.
- New `src/components/PromptForm.tsx` holds the form; `PromptDraftPanel.tsx` is kept and simplified (progress based on required fields).
- `src/routes/api/chat.ts` and the AI gateway stay in the repo but are no longer used by the index route. No AI call is needed for the form flow.
- Design tokens in `src/styles.css` stay; tighten spacing and typography for the denser form layout.

## Delivery

The app is delivered as a live URL — the preview link now, and a public published link once you hit Publish.
