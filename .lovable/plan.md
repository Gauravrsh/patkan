# Patkan — Auto-first controls

Fixes the two inconsistencies: dialect is advertised as auto but shown as a manual picker on the web,
and intensity is a three-way choice the user has no basis to make.

## Principle

Every engine decision is made automatically and shown as a **result**, not a question. Overrides exist,
but they live behind the result, not in front of it.

## 1. Dialect — auto everywhere, override behind the result

- Add `"auto"` as a real dialect value and make it the default on all three surfaces
  (web demo, side panel, content script).
- Resolution order: explicit user override → host detection (`dialectForHost`) → intent/persona default → Markdown.
- Web demo has no host, so it gets a **destination** selector instead of a format selector:
  "Where will you paste this? ChatGPT / Claude / Gemini / Somewhere else". That maps to a dialect internally.
  Users think in destinations, not in XML-vs-Markdown.
- The chips move out of the input area. Under the generated prompt, one line:
  `Markdown format — matched to ChatGPT. Change`. `Change` reveals the three chips inline.

## 2. Intensity — derived, with a single escape hatch

- Remove the Light/Standard/Surgical chip row from the primary flow.
- Intensity is derived from the classifier: `trivial → light`, `standard → standard`,
  `deep` or an explicit reusable/spec signal → `surgical`.
- Replace the dial with **one** action under the result: `Go deeper` (bumps one level and re-compiles) and,
  once bumped, `Simplify` to step back down. Two states the user can feel, instead of three labels they must
  interpret in advance.
- Power users keep the explicit default in extension Settings (`options.html`) — unchanged there.

## 3. Confidence line absorbs both

The existing `Assumed:` line becomes the single place all auto decisions surface:

```text
Markdown for ChatGPT · standard depth · assumed B2B SaaS audience    [Change] [Go deeper]
```

One line, legible, actionable. This is what makes the automation feel deliberate rather than opaque.

## Tradeoffs accepted

- Auto dialect will occasionally be wrong when someone drafts in the web app and pastes into a model we
  didn't detect. The destination selector plus the visible `Change` affordance covers this.
- Removing the intensity dial costs power users one click when they always want Surgical. The Settings
  default plus `Go deeper` covers it, and the median user gains a decision they never had to make.
- `Go deeper` re-compiles, so it costs a second transform against the 10/day quota. Acceptable: it is an
  explicit user action, and the quota already covers clarify-chip refinements the same way.

## Technical notes

- `src/lib/patkan-core.ts` and the byte-identical `extension/patkan-core.js`: add `"auto"` to `DIALECTS`,
  add `resolveDialect({ override, hostname, intent })` and `resolveIntensity({ override, complexity, intent })`.
  `localScaffold` takes the resolved values, so its signature is unchanged.
- `src/routes/api/public/transform.ts`: accepts `dialect: "auto"`, resolves server-side, and returns the
  resolved `dialect` and `intensity` in the response so the UI can label them. No quota logic changes.
- `src/routes/index.tsx`: chips replaced by the destination selector plus the post-result control line.
- `extension/sidepanel.js`: dialect/intensity chip rows removed from the top; the same control line renders
  under the output. Host detection already exists and stays.
- `extension/content.js`: unchanged behaviour, it already auto-picks by host.
- `extension/options.js`: keeps persona, dialect and intensity defaults, with `auto` as the default option.
