# Patkan speed & cost: what it takes to land under 5s, and under 2s

Forensic study of the transform path, the engine choices, and the money. All numbers below are
measured — production telemetry from `transform_events`, plus live streaming runs against the Nous
inference API this morning and its published price list.

## 1. Where the time actually goes today

Measured over all successful transforms on record:

| Path | Runs | First word (p50) | Total (p50) | Total (p95) | Output size |
| --- | --- | --- | --- | --- | --- |
| Preferred engine, fresh | 11 | 3.58 s | 6.94 s | 10.04 s | ~1,610 chars |
| Cache replay | 7 | — | 0.73 s | 1.40 s | ~1,655 chars |
| Slow backup | 1 | 4.93 s | 11.40 s | 11.40 s | 1,396 chars |

Breakdown of a fresh 6.9 s run:

```text
 0.0s  request in, origin check, cache key
 0.1s  database: cache + counter read (now parallel)   ~0.15s
 0.3s  database: two allowance claims (now parallel)   ~0.20s
 0.5s  engine call opens
 3.6s  first word arrives            <-- 3.1s of pure waiting on the model
 6.9s  last word arrives             <-- 3.3s of writing ~420 tokens
```

Two facts dominate everything else:

1. **The preferred model is the slow one, and it is rate-limited.** Live runs today: it answered at
   1.65 s to first word on the first call and returned "at capacity" (HTTP 429) on the very next
   call. Every 429 pushes the run onto a slower engine, which is how the 3.6 s median and the 11 s
   worst case happen.
2. **We ask for a ~420-token answer.** Even at a perfect 0.5 s start, writing 420 tokens takes
   ~3 s. **No engine choice can put a 1,600-character output under 2 seconds.** Sub-2s is an output
   -length decision first and a model decision second.

Database work is now ~0.35 s and is no longer the story.

## 2. Live engine measurements (same realistic prompt, twice each)

| Engine | First word | Total | Output | Verdict |
| --- | --- | --- | --- | --- |
| poolside/laguna-xs-2.1 | 0.47 s / 0.48 s | 1.71 s / 1.79 s | ~245 tok | Fastest, very consistent |
| ibm-granite/granite-4.2-8b | 0.46 s / 0.41 s | 1.81 s / 1.40 s | ~190 tok | Fast, small model |
| z-ai/glm-4.7-flash | 0.63 s / 0.61 s | 2.29 s / 1.91 s | ~210 tok | Fast and dependable |
| qwen/qwen3.7-flash (current preferred) | 1.65 s / **429** | 4.98 s | 327 tok | Slowest healthy start, and refuses traffic |
| upstage/solar-pro4 | 2.29 s / 1.01 s | 5.14 s / 2.61 s | ~205 tok | Erratic start |
| nex-agi/nex-n2-mini | never | 4.7 s | 500 tok, all hidden thinking | Unusable — forces chain-of-thought |

The current preferred engine is the worst performer of the healthy set on both measures.

## 3. Cost, in transforms per ₹100

Assumes ₹88 to the dollar, ~1,900 tokens in, and the output length shown. Cache replays are free
and today are ~39% of all successful transforms, which multiplies every figure below.

**At today's output length (~420 tokens, ~1,600 characters):**

| Engine | Transforms per ₹100 |
| --- | --- |
| upstage/solar-pro4 | ~13,200 |
| qwen/qwen3.7-flash | ~12,700 |
| poolside/laguna-xs-2.1 | ~8,600 |
| ibm-granite/granite-4.2-8b | ~6,500 |
| z-ai/glm-4.7-flash | ~5,000 |

**At a trimmed output (~200 tokens, ~800 characters):**

| Engine | Transforms per ₹100 |
| --- | --- |
| qwen/qwen3.7-flash | ~17,100 |
| poolside/laguna-xs-2.1 | ~10,300 |
| ibm-granite/granite-4.2-8b | ~8,700 |
| z-ai/glm-4.7-flash | ~7,300 |

**With prompt caching switched on** (our instruction block is identical on every call and the
provider charges 1/5th for a cached read): the fast engine's per-₹100 count roughly doubles again —
laguna lands near **~19,000 per ₹100**, qwen near **~38,000**. This is the single largest cost lever
available and it costs nothing in quality.

## 4. The two slabs

### Slab A — under 5 seconds, full-depth output (recommended default)

Achievable now, with no loss of output quality.

- Make **laguna-xs-2.1** the preferred engine and **glm-4.7-flash** the second; demote today's qwen
  to third and keep the Lovable gateway as last resort.
- Turn on prompt caching for the instruction block.
- Expected: first word ~0.5 s, total ~3.0–4.0 s at today's 1,600-character output.
- Cost: **~8,600 per ₹100**, or **~19,000 per ₹100** once caching lands.
- Quality: unchanged output contract. Needs the side-by-side check in step 6 before switching.

### Slab B — under 2 seconds, tightened output

Requires an output-length decision, not just an engine swap.

- Same engine order as Slab A, plus:
- **Cap the compiled prompt at ~800 characters** for standard intensity (surgical stays long). This
  is the only way to reach 2 s; at 1,600 characters the writing alone exceeds it.
- **Trim the instruction block** from ~1,500 tokens to ~700 by moving the persona and dialect rules
  into short per-mode variants instead of shipping all of them every time. Saves ~0.2 s and a third
  of the input cost.
- Expected: first word ~0.45 s, total ~1.6–2.0 s.
- Cost: **~10,300 per ₹100**, or **~22,000 per ₹100** with caching.
- Quality trade: shorter prompts. For questions, rewrites and short asks this is an improvement —
  the current output over-specifies small requests. For "build me X" and deep analysis it will cost
  real detail, which is why surgical intensity should stay on Slab A behaviour.

**Recommended shape:** Slab B automatically for light/standard intensity and short inputs; Slab A for
surgical intensity and long inputs. Same engines, different length contract — the user gets speed
where speed is what they want and depth where depth is what they asked for.

## 5. Build order

1. Reorder engines: laguna primary, glm secondary, qwen third, gateway last. Keep the existing
   cooldown and first-word deadline behaviour.
2. Add prompt caching on the instruction block for every engine that supports it.
3. Split the instruction block into short per-dialect/per-intensity variants; drop unused persona
   text from the request.
4. Add a length contract to the compiler instruction: a hard target of ~800 characters for
   light/standard, unbounded for surgical.
5. Record which engine served each run and its first-word time (already in place) and add a
   per-engine 429 counter, so a repeat of the qwen capacity problem is visible the day it starts.
6. Quality gate before any of this ships to visitors: run the same 12 real inputs (spanning
   question, build, write, analyse; short and long) through today's engine and each candidate, and
   compare side by side. No engine change ships on latency alone.

## 6. Technical notes

- `src/lib/patkan-engines.server.ts` — attempt order, model constants, prompt-cache flag on the
  request body, per-engine 429 counter.
- `src/lib/patkan-core.ts` — `buildMetaSystemPrompt` split into per-dialect variants; length target
  added to the OUTPUT section; `buildMetaUserMessage` drops persona constraint text when the persona
  is `auto`.
- `src/routes/api/public/transform.ts` — unchanged apart from passing the intensity-derived length
  mode; quota, cache and telemetry behaviour stay exactly as they are.
- `src/routes/_authenticated/admin.index.tsx` and `api/public/cron/health.ts` — surface the 429
  counter per engine.
- No change to quota limits, privacy behaviour, or what is stored.

## Out of scope

The shared-network 50-a-day ceiling issue stays tracked separately; it affects who gets served, not
how fast.
