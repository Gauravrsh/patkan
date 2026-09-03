# PRD — Patkan's prompt engine (originally scoped to Hermes)

> **Update (post-implementation):** Hermes is retired on Nous Research — the live catalogue
> contains no Hermes model id. The engine shipped as scoped, but the models behind it are
> `qwen/qwen3.7-flash` (primary) and `z-ai/glm-4.7-flash` (secondary) on the Nous endpoint,
> with the Lovable AI gateway as the last fallback. All UI strings are neutral (`Sharpening…`,
> `Ready`, `Ready — offline draft`) and engine ids are `primary` / `fallback` / `local`.
> Everywhere this document says "Hermes", read "the Patkan engine".

## 1. Why

Patkan's single job is turning lazy text into an expert prompt. That job currently runs on a general-purpose
model with a hand-written meta-prompt. Moving it to **Hermes (Nous Research)** makes the engine an explicit,
named, swappable component instead of an implementation detail — and Hermes' steerability on
instruction-following/meta-prompting is a better fit for prompt compilation than a generic chat model.

Scope: **web demo + browser extension**. The MCP `transform_prompt` tool stays on the current path this round. (DELETE EACH LINE OF CODE that was coded to build patkan as MCP)

## 2. Product principle

The user never waits at a blank screen, and never wonders whether it's done. Every second of the transform is
narrated. Quality is not traded for speed — the two are separated in time.

## 3. The three-beat experience

This is the core of the spec. One transform, three visible beats, no ambiguity at any point.

```text
beat 1  (0 ms)      Draft appears instantly, dimmed, tagged "Drafting…"
beat 2  (~200 ms)   Label flips to "Hermes is sharpening this…"; text rewrites live over the draft
beat 3  (on finish) Text goes solid, label becomes "Ready — Hermes"; Send/Copy unlocks
```

Rules that remove the confusion the user named:

- **One prompt, never two.** Hermes rewrites *in place* over the draft. The user never sees a second block
appear underneath. What was dim becomes sharp.
- **The draft is visibly provisional.** Dimmed text, a subtle shimmer on the edited region, and an explicit
`Drafting…` label. Nothing about it reads as finished.
- **Send is locked while sharpening.** In the extension, the host composer's own Send is out of our control,
so we guard it: while Hermes is running, the Patkan pill reads `Hermes is sharpening — one moment` and we
intercept `Enter` on the composer, showing `Almost there…` instead of submitting. First `Enter` after
completion sends normally. An explicit `Send anyway` escape exists on the pill for anyone who won't wait.
- **Completion is loud enough to feel, quiet enough not to annoy.** Text settles from dim to solid, a single
1-second `Ready` state on the pill, then it fades to the resting label.

Failure beat: if Hermes fails, the draft simply goes solid with `Ready — offline draft`. The user is never
blocked, never shown a raw error mid-typing.

## 4. Engine behaviour


| Layer                      | Role                                                             |
| -------------------------- | ---------------------------------------------------------------- |
| Local scaffold (on-device) | Instant beat-1 draft. No network, no cost, no quota.             |
| Hermes (Nous Research)     | The real transform. Streams token-by-token over the draft.       |
| Current Gemini path        | Silent fallback if Hermes errors, times out, or is rate limited. |
| Local scaffold (again)     | Final fallback. The user always ends with a usable prompt.       |


Fallbacks are silent to the user in the flow. The engine that produced the result is named in the small
confidence line under the prompt (`Ready — Hermes` / `Ready — fallback engine`), so it is honest without
being alarming.

Quota, personas, dialects, intensity and clarifier chips are unchanged. Hermes swaps in behind the same
contract.

## 5. Success criteria

- Time to first visible text: under 100 ms, always (it's local).
- No state in the flow where the screen is blank or the user can't tell what's happening.
- Zero accidental sends of a half-sharpened prompt.
- Hermes failure is invisible to task completion — the user still gets a prompt every time.

## 6. Non-goals this round

- MCP tool migration.-------delete everything to do with making patkan MCP from the code.
- Letting users pick a model. The engine is Patkan's opinion, not a setting.------Users never pick any model or anything. 
- Changing the `//` trigger, quota, Library, or auth.

## 7. Technical notes

- **Access**: Nous Research API (OpenAI-compatible chat completions). Needs a `NOUS_API_KEY` secret — I'll
request it via the secure secret form before wiring the call. The Hermes model id gets confirmed against
the live Nous model list at build time rather than assumed.
- `src/lib/patkan-engines.server.ts` (new): `runHermes()` and `runGemini()` behind one
`streamTransform()` signature returning an SSE-shaped async iterator. Ordered fallback lives here.
- `src/routes/api/public/transform.ts`: calls `streamTransform()` instead of fetching the gateway directly.
Adds `engine: "hermes" | "gemini" | "local"` to the `meta` and `done` SSE events. Quota logic untouched.
Streaming stays on; no client-side abort timers (an aborted call still bills).
- `src/routes/index.tsx`: draft rendered dimmed with a `Drafting…` badge; Hermes deltas replace it in place;
Copy/Export disabled until `done`; status line reads from the new `engine` field.
- `extension/content.js`: reuse the existing shadow-DOM pill for the three labels; add an `Enter` capture
guard during the sharpening window plus a `Send anyway` action.
- `extension/sidepanel.js`: same three beats in the panel output area.
- `extension/background.js`: non-streaming path returns the resolved `engine` so the panel can label it.
- No changes to `src/lib/patkan-core.ts` prompt contracts, `patkan-core.js`, MCP tools, or the schema.