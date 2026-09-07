# The Minion Land prompt: what took 11 seconds, and why

## The prompt that was run

Input (428 characters):

```text
Draw me a new image now of Minion Land. It should contain a minion playing guitar, another minion
eating ice cream, another minion sitting on a bench, and a poster saying "Welcome to Minion Land".
There should be a girl standing near the poster and wearing a minion printed dress. There should be
a pool beside one of the minions.

this is to show an 8YO girl the drawing. draw it in oil pastel style as an 8YO kid would draw
```

Patkan's output (recorded 7 Sep, 14:59 UTC):

```text
ROLE
You are a professional illustrator specializing in children's book art and custom character design.

CONTEXT
You are creating a visual guide for an 8-year-old girl. The drawing must use the visual style and
aesthetic of an 8-year-old child's work, specifically using oil pastel media.

TASK
Generate an image of "Minion Land" incorporating the following specific elements:
1.  **Minions:** A group of Minions, including:
    *   One minion playing the guitar.
    *   One minion eating ice cream.
    *   One minion sitting on a bench.
2.  **Background/Environment:** A pool positioned beside one of the minions.
3.  **Human Character:** A girl standing near the poster.
    *   **Outfit:** She must be wearing a dress printed with Minion patterns.
4.  **Signage:** A poster reading "Welcome to Minion Land" visible in the scene.

SUCCESS CRITERIA
The composition is lively and clear. The artist's style explicitly mimics the technique, texture,
and color choices of a 5th grader using oil pastels.

OUTPUT FORMAT
Direct image generation.

CONSTRAINTS
- Do not render realistic photo-realism or professional adult illustration styles.
- Do not exclude any of the listed characters or items.
- Ignore technical image specifications like resolution or aspect ratio unless specified.
```

Assumptions it declared: oil pastel visual style, children's illustration, literal character interpretation.

## The measured timing

Recorded for that run: **4.9 s to first word, 11.4 s total** — against the intended feel of first
words inside ~1.5 s. Every other recent run sat at 2.3–3.9 s first word. This one was the slowest
on record, and it was also the only one not served by the usual engine.

Live measurements taken just now, replaying the same prompt:

| Step | Time |
| --- | --- |
| Preferred engine (Qwen on Nous) | fails in ~0.7 s — HTTP 429, "temporarily at capacity upstream" |
| Second engine (GLM on Nous) | 0.7 s to first word, 2.5 s total |
| Last-resort engine (Gemini via Lovable) | 3.1 s to first word, 6.9 s total |

## Diagnosis — three separate causes, in order of damage

1. **The preferred engine was refusing traffic, and we retry it on every single request.**
   It answers 429 in under a second, but that whole second is dead time added to the front of the
   run, repeated for every user, for as long as the capacity problem lasts.

2. **The run fell all the way to the slowest engine.** The record says "fallback", which today
   covers *both* the second Nous engine and the Lovable Gemini one — so the log can't tell them
   apart. The 4.9 s first word and 11.4 s total match the Gemini profile almost exactly, and not the
   GLM one (0.7 s / 2.5 s). So both Nous attempts were refused and the run landed on the slowest
   path. That is a 4x slowdown versus the engine sitting right there and healthy.

3. **Roughly half a second of database work happens before any engine is even called** — cache
   lookup, usage counter read, shared-network quota claim and personal quota claim, four round trips
   one after another. Small on its own, but it is pure dead air at the front of every transform.

## The fix

### A. Tell the engines apart in the record (blind spot first)

Split the single `fallback` label into `primary`, `secondary` and `gateway`, so the usage screen and
the health check can show *which* engine served a run and how slow each is. Without this, every
future slowdown is guesswork again. The user-facing wording stays neutral ("Ready").

### B. Stop re-hitting an engine that just said "at capacity"

When an engine answers 429 (or a 5xx), remember that for a short cooldown — a couple of minutes —
and skip straight to the next engine for the duration. Honour a `Retry-After` header when present.
Effect on a run like this: the dead second disappears, and the run starts on a healthy engine
immediately.

### C. Prefer the fast engine over the slow one

Measured, the second Nous engine is ~2.7x faster to first word than the Lovable one. Keep the
Lovable engine strictly as the last resort it already is, and add a hard cap on how long we wait for
an engine to say its first word (about 6 s) before moving on — today a stalled engine can hold a run
open indefinitely.

### D. Remove the dead half-second before generation

Run the cache lookup and the counter read together instead of one after the other, and claim the
shared-network and personal allowances in parallel. No change to quota rules or their outcomes —
only the order in which the waiting happens.

### E. Watch it from now on

Add first-word time per engine to the usage screen, and raise the health-check alarm when the
preferred engine's share of runs drops below the existing 70% threshold — that is exactly the
signal this incident produced, and nothing surfaced it.

## Technical notes

- `src/lib/patkan-engines.server.ts`: widen `EngineId` to `"primary" | "secondary" | "gateway" |
  "local"`; add an in-memory cooldown map keyed by attempt id, set on 429/5xx, honouring
  `Retry-After`; add a first-token deadline per attempt (abort and fall through, no client-side
  abort of a stream already producing tokens).
- `src/lib/patkan-stream.ts`, `src/routes/index.tsx`, `extension/*`: accept the new engine ids;
  labels stay neutral.
- `src/routes/api/public/transform.ts`: `Promise.all` the cache + counter reads, and the two quota
  claims; refund path must release both claims on failure (already an open item from the shared-IP
  finding — not widened here).
- `src/routes/_authenticated/admin.index.tsx` and `api/public/cron/health.ts`: per-engine first-word
  medians and a primary-share breach.
- No change to the prompt contracts in `src/lib/patkan-core.ts`, to quota limits, or to output
  quality.

## Out of scope

The shared-network 50/day ceiling issue stays as it is; it is tracked separately and is not a cause
of this slowdown.
