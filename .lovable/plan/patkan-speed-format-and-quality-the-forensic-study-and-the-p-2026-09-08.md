# Patkan: speed, format and quality — the forensic study and the plan

Three layers: where the time and money actually go, the everyday prompt format Patkan should always
produce, and which engine can make that output feel magical. All numbers are measured — production
telemetry plus live streaming runs against the Nous inference API today, priced off its live catalogue.

---

# Layer 1 — Speed and cost

## 1.1 Where the time goes today

| Path | Runs | First word (p50) | Total (p50) | Total (p95) | Output |
| --- | --- | --- | --- | --- | --- |
| Preferred engine, fresh | 11 | 3.58 s | 6.94 s | 10.04 s | ~1,610 chars |
| Cache replay | 7 | — | 0.73 s | 1.40 s | ~1,655 chars |
| Slow backup | 1 | 4.93 s | 11.40 s | 11.40 s | 1,396 chars |

```text
 0.0s  request in, origin check, cache key
 0.1s  database: cache + counter read (already parallel)   ~0.15s
 0.3s  database: two allowance claims (already parallel)   ~0.20s
 0.5s  engine call opens
 3.6s  first word arrives        <-- 3.1s of pure waiting on the model
 6.9s  last word arrives         <-- 3.3s of writing ~420 tokens
```

Two facts dominate:

1. **The current preferred model is the slow one, and it refuses traffic.** Live today: 1.65 s to
   first word on the first call, then HTTP 429 "at capacity" on the very next call. Every refusal
   pushes the run onto a slower engine — that is the 3.6 s median and the 11 s worst case.
2. **Length sets the floor.** ~420 tokens of output takes ~3 s to write even with a perfect 0.5 s
   start. Under-2 s is a length decision first, a model decision second.

Database work is ~0.35 s and is no longer the story.

## 1.2 Fast-tier engine measurements (identical realistic prompt, twice each)

| Engine | First word | Total | Output | Verdict |
| --- | --- | --- | --- | --- |
| poolside/laguna-xs-2.1 | 0.47 / 0.48 s | 1.71 / 1.79 s | ~245 tok | Fastest, very consistent |
| ibm-granite/granite-4.2-8b | 0.46 / 0.41 s | 1.81 / 1.40 s | ~190 tok | Fast, small |
| z-ai/glm-4.7-flash | 0.63 / 0.61 s | 2.29 / 1.91 s | ~210 tok | Fast, dependable |
| qwen3.7-flash (today's preferred) | 1.65 s / **429** | 4.98 s | 327 tok | Slowest healthy start, rate-limited |
| upstage/solar-pro4 | 2.29 / 1.01 s | 5.14 / 2.61 s | ~205 tok | Erratic |
| nex-agi/nex-n2-mini | never | 4.7 s | all hidden thinking | Unusable — forces chain-of-thought |

---

# Layer 2 — The universal everyday prompt format

Patkan's output should always land in one shape, readable by a designer, a lawyer, a bakery owner or
a PM with no technical background. Seven plain-English blocks, in this order, with the questions
block mandatory:

```text
WHO YOU ARE
You are a <specific expert>, experienced in <the exact situation>.

WHAT'S GOING ON
<2-4 sentences of the situation, carrying over every concrete detail the user gave —
names, dates, amounts, platforms. Nothing invented.>

WHAT I NEED
<the actual ask, in one or two sentences>

ASK ME FIRST
Before you start, ask me these questions, one message, numbered. Wait for my answers.
If I skip a question, state the assumption you are making and continue.
1. <question that would genuinely change the answer>
2. <second>
3. <third — at most three>

HOW THE ANSWER SHOULD LOOK
<exact shape: a letter / a table / 5 bullets / 3 options; and roughly how long>

DO NOT
- <what to leave out>
- <what not to assume or invent>

GOOD LOOKS LIKE
<one measurable sentence: "done when ...">
```

Design rules behind it:

- **Everyday words, not jargon.** "WHO YOU ARE" beats "ROLE"; "DO NOT" beats "CONSTRAINTS". The
  headings themselves teach the user what a good prompt contains.
- **ASK ME FIRST is never dropped.** This is the single block that turns a one-shot prompt into a
  consultation, and it is what non-technical users never think to write. Cap at three questions —
  more and people abandon. Always include the "if I skip, assume and continue" escape hatch so a
  user in a hurry is never blocked.
- **Questions must be decision-changing**, not admin. "What's your budget?" only if budget changes
  the answer. This is a judgement instruction in the compiler spec, not a template slot.
- **Blocks the task doesn't need are omitted** — a one-line factual question still shouldn't become
  a spec. The only always-present blocks are WHAT I NEED and ASK ME FIRST.
- The current XML / Markdown / Sectioned dialect switch stays: same seven blocks, dressed as tags
  for Claude, headings for GPT, plain caps elsewhere.
- The hidden metadata line (assumptions and clarifier chips) stays exactly as it is today.

This replaces the current section names (Role / Context / Task / Success criteria / Output format /
Constraints / Before answering) in `buildMetaSystemPrompt`, and adds the questions block, which does
not exist today.

---

# Layer 3 — Quality: which model, at your ₹100-per-2,000 budget

Your ceiling of ₹100 per 2,000 transforms is ₹0.05 (~$0.00057) per transform — roughly **5x** more
headroom than the fast-tier models were costing. That changes the answer completely: we are no
longer shopping in the cheap-and-fast bin, we can buy a genuinely strong model and still land inside
budget.

**89 of the ~390 chat models on the catalogue fit inside that ceiling.** Five of the strongest were
tested live, three runs each, on real non-technical inputs (a landlord complaint letter, a bakery
logo brief, a churn analysis), against the seven-block format above:

| Model | Cost/transform | Transforms per ₹100 | First word | Total | Quality /10 | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| **qwen3-next-80b-a3b-instruct** | $0.000506 | **~2,245** | 0.76 s | 4.25 s | **9** | none observed |
| llama-4-maverick | $0.000538 | ~2,115 | 0.51 s | 3.57 s | 8 | slightly blunter questions |
| glm-4.5-air | $0.000483 | ~2,356 | 1.80 s | 7.40 s | 7.5 | mildly verbose |
| qwen3-235b-a22b | — | — | 0.88 s | 13.94 s | 7.5 | far too slow |
| deepseek-v3.2 | — | — | 2.85 s | 18.46 s | 7 | slowest, high variance, no quality gain |

All 15 calls returned cleanly: no rate limits, no leaked chain-of-thought, no code fences, no format
drift, and every run produced the metadata line correctly. Quality was judged on whether the seven
blocks appeared exactly, whether the questions were genuinely useful to a non-expert, whether every
concrete detail survived, and whether anything was padded.

## Scenarios we had not considered, and what they change

1. **Rate-limit exposure is a model property, not bad luck.** Today's preferred model refused the
   second consecutive call. The new candidates did not refuse once across 15 calls — but this must be
   monitored per engine, not assumed.
2. **Latency variance matters more than median.** deepseek and qwen-235b were fine on quality and
   fine on cost, and still unusable: 14–18 s totals. Ranking by median alone would have picked one.
3. **Forced chain-of-thought silently eats the budget.** One candidate spent an entire 500-token
   budget on hidden thinking and emitted nothing. Any model must be verified to honour
   reasoning-off before it enters the rotation.
4. **Longer output is the price of the new format.** The seven-block format with a questions section
   runs ~2,000–2,600 characters, up from ~1,600. Cost figures above already include this.
5. **Prompt caching is free money.** The instruction block is identical on every call and the
   provider bills a cached read at roughly a fifth. Not yet switched on. Turning it on lifts the
   primary from ~2,245 to roughly **~3,000 transforms per ₹100** with zero quality cost.
6. **The exact-match cache is already carrying ~39% of successful transforms at zero cost** — the
   effective spend today is well under the per-call figure, and improves as usage grows.
7. **Model ids rotate.** Every id must be re-read from the live catalogue at build time, not typed
   from this document.
8. **Quality is currently unmeasured in production.** There is no acceptance signal on a transform,
   so a quality regression would be invisible. That gap should close alongside this change.

## The recommendation

- **Primary: qwen3-next-80b-a3b-instruct** — best quality of everything tested, 0.76 s to first word,
  4.25 s total, ~2,245 transforms per ₹100 (about ~3,000 with caching). Inside your budget.
- **Second: llama-4-maverick** — fastest (3.57 s total), effectively the same cost, one quality point
  behind. Takes over when the primary is at capacity.
- **Third: glm-4.5-air** — cheapest of the three, slower; a safety net, not a default.
- **Fourth: glm-4.7-flash** (fast tier, ~2 s) — for the sub-2 s mode below.
- **Last: the Lovable gateway**, unchanged.
- **Retire qwen3.7-flash as primary.** It is the slowest healthy starter and the only one that
  refused traffic.

## The two speed slabs, restated with the new format and budget

**Slab A — under 5 seconds, full seven-block output. Recommended default.**
Primary engine above, prompt caching on. Measured 0.76 s to first word, 4.25 s total. Cost ~2,245 per
₹100 (~3,000 cached). Full ASK ME FIRST block, full detail. This is the "magical" setting.

**Slab B — under 2 seconds, condensed output.** Not reachable with the full format: 2,000+ characters
cannot be written in 2 s at any price. To hit it, the output must shrink to ~800 characters — WHAT I
NEED, ASK ME FIRST (two questions), HOW THE ANSWER SHOULD LOOK, DO NOT — served by glm-4.7-flash.
Expected ~0.6 s first word, ~1.9 s total, ~7,300 per ₹100. Cheaper and faster, visibly thinner.

**Recommended shape:** Slab A everywhere by default — it is inside budget and it is the product's
whole promise. Offer Slab B only as an explicit "quick" mode, and keep the local instant scaffold
painting the box in the first 50 ms so the wait never reads as a stall.

---

# Build order

1. Rewrite `buildMetaSystemPrompt` in `src/lib/patkan-core.ts` to the seven-block everyday format,
   including the mandatory ASK ME FIRST rules (max three, decision-changing only, skip-and-assume
   escape hatch), for all three dialects. Mirror into `extension/patkan-core.js`.
2. Re-read the live model catalogue and copy exact ids; reorder engines in
   `src/lib/patkan-engines.server.ts`: qwen3-next primary, llama-4-maverick second, glm-4.5-air
   third, glm-4.7-flash fourth, gateway last. Keep the existing cooldown and first-word deadline.
3. Turn on prompt caching for the instruction block on every engine that supports it.
4. Add a per-engine 429 and first-word counter to the health check and the usage screen, so a repeat
   of the capacity problem shows up the day it starts.
5. Add the quick-mode length contract (Slab B) behind the existing light intensity, not as a new
   control.
6. Quality gate before anything reaches visitors: run 12 real inputs across the professions this
   format targets (letter, brief, analysis, spec, contract review, social post) through the current
   engine and the new primary, side by side. No switch ships on latency alone.
7. Add a simple thumbs signal on a completed transform so output quality stops being unmeasured.

## Technical notes

- `src/lib/patkan-core.ts` — new section names and the questions block in `buildMetaSystemPrompt`;
  per-dialect variants kept; `buildMetaUserMessage` unchanged apart from the intensity rule wording.
- `src/lib/patkan-engines.server.ts` — attempt order, model constants, prompt-cache flag, 429 counter.
- `src/routes/api/public/transform.ts` — unchanged except passing the length mode; quota, cache and
  telemetry behaviour stay exactly as they are.
- `src/routes/_authenticated/admin.index.tsx`, `api/public/cron/health.ts` — per-engine 429 and
  first-word medians.
- No change to quota limits, privacy behaviour, or what is stored.

## Out of scope

The shared-network 50-a-day ceiling stays tracked separately; it affects who gets served, not how
fast or how good.
