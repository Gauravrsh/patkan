# Patkan Observability: Oxygen & Water

## What already exists (verified in code)

- `transform_events` table, written by the transform API. Fields: subject kind/hash, host, surface, persona, dialect, intensity, intent, engine, cached, input/output chars, latency_ms, ttfb_ms, outcome (ok/empty/error/limited), accepted.
- `usage_counters` for the daily quota; `outcome = 'limited'` records wall hits.
- Feedback API sets `accepted` on the last event (extension reports keep vs discard).
- `/admin` dashboard: per-day ghost vs signed-in, cache hit rate, engine mix with p50/p95/TTFB, error rate, empty rate, wall hits, unique ghosts at wall, acceptance, estimated spend, top hosts/personas/dialects/surfaces, accounts, active users, returning, saved frameworks.

**Nothing on the landing page is instrumented.** No page views, no scroll/section engagement, no playground usage, no download clicks. Same for extension install and first-run. That is the whole gap.

---

## The metric set, deduplicated and sorted

### A. Product performance

**Oxygen (fails → product is dead in under a minute)**

| Metric | Source |
|---|---|
| Transform success rate (`ok` share) | have |
| Transform error rate | have |
| Empty output rate | have |
| Engine availability — primary vs fallback share | have |
| End-to-end latency p50/p95 and time-to-first-token | have |
| API reachability / 5xx on `/api/public/transform` | build |
| `//` trigger interception rate (detected vs typed) | build |
| Host DOM injection failure rate (per host) | build |
| Extension init success after install | build |

**Water (no immediate death, signals decay)**

| Metric | Source |
|---|---|
| Acceptance rate (kept vs discarded) | have |
| Cache hit rate | have |
| Host / persona / dialect / intent / surface mix | have |
| Average raw input length | derivable from `input_chars` |
| Rejection-by-undo rate, separate from silent discard | build |
| Latency drift week over week | build (rollup) |

### B. Business performance

**Oxygen**

| Metric | Source |
|---|---|
| Landing page uptime + `/patkan-extension.zip` HTTP 200 | build |
| Daily active triggers — unique subjects transforming today | have |
| New installs per day | build |
| Free quota exhaustion rate (share of DAU hitting 10) | partly — needs DAU denominator |
| Zero-transform day alarm | build (cron) |

**Water**

| Metric | Source |
|---|---|
| Playground engagement rate (compiles / visitors) | build |
| Playground → download conversion | build |
| Install friction drop-off (init / download clicks) | build |
| Activation: first transform within 60 min of init | build |
| W1/W2/W4 retention | build (from existing events) |
| Ghost → sign-in conversion after wall | partly |
| Accounts, saved frameworks | have |
| **Section engagement on the landing page** | build |

---

## Landing-page storytelling instrumentation

The point: know deterministically which parts of the story hold attention and which get scrolled past, so copy and layout decisions are evidence-led.

New table `page_events` (text-free, no IP stored, hashed visitor id in a first-party cookie):

- `session_id`, `visitor_hash`, `created_at`, `path`, `event`, `section`, `value_int`, `meta` (small json), `device` (mobile/desktop), `referrer_host`.

Events to emit from the homepage:

1. `page_viewed` — once per session.
2. `section_seen` — IntersectionObserver, fires once per section at 50% visible.
3. `section_dwell` — ms of visible time per section, flushed on scroll-away and on unload via `sendBeacon`.
4. `scroll_depth` — 25/50/75/100 markers.
5. `playground_input_started`, `playground_compiled`, `playground_copied`.
6. `download_clicked` (browser target + which CTA on the page).
7. `privacy_modal_viewed`, `share_clicked`, `nav_clicked`.
8. `exit_section` — last section seen before leaving.

Extension side (anonymous, zero prompt text): `extension_initialized`, `trigger_detected`, `injection_failed` (host + reason), `transform_rejected`, `quota_limit_reached`, `account_connect_viewed`, `account_connect_success`.

Derived storytelling view per section: **reach** (share of sessions that saw it), **hold** (median dwell), **drop** (share whose last section it was), **assist** (download rate among those who saw it vs didn't). That gives a per-section verdict: keep / rewrite / move up / cut.

---

## Dashboard layout (text wireframe)

Two tabs, one screen each, no charts junk. Calm, mono labels, big numbers, single orange accent for anything breaching threshold.

```text
┌──────────────────────────────────────────────────────────────┐
│  Usage   Story   Carousel                    7d 14d 30d   ⏻  │
├──────────────────────────────────────────────────────────────┤
│  ● all systems normal        last event 2 min ago            │
│                                                              │
│  OXYGEN                                                      │
│  ┌──────────┬──────────┬──────────┬──────────┐               │
│  │ success  │ p95      │ primary  │ download │               │
│  │  98.6%   │ 4.1 s    │  91%     │  200 ok  │               │
│  └──────────┴──────────┴──────────┴──────────┘               │
│  ┌──────────┬──────────┬──────────┬──────────┐               │
│  │ active   │ installs │ at limit │ triggers │               │
│  │   142    │   19     │   6%     │   410    │               │
│  └──────────┴──────────┴──────────┴──────────┘               │
│                                                              │
│  WATER                                                       │
│  acceptance 74%   cache 31%   activation 58%   W1 34%        │
│  playground→download 12%   install→init 61%   spend $2.14    │
│                                                              │
│  ▁▂▅▇▆▅▇  transforms per day  (solid signed-in / muted ghost)│
│                                                              │
│  engines            hosts          personas      surfaces    │
│  primary 91% 3.2s   chatgpt 58%    auto 61%      inline 72%  │
│  fallback 8% 6.9s   claude 27%     engineer 21%  panel 19%   │
└──────────────────────────────────────────────────────────────┘
```

```text
STORY tab
┌──────────────────────────────────────────────────────────────┐
│ 1 240 sessions · 12% reach the playground · 4% download      │
│                                                              │
│ section          reach   hold    drop   assist               │
│ hero             100%    9 s      18%   —                    │
│ how it works      74%    22 s      9%   +6 pts               │
│ playground        41%    54 s      6%   +19 pts   ← the win  │
│ install guide     26%    31 s     12%   +28 pts              │
│ privacy           19%    11 s     22%   +2 pts               │
│ faq                9%     6 s     31%   -1 pt    ← cut/move  │
│                                                              │
│ funnel  view 1240 → play 512 → compile 218 → dl 61 → init 37 │
│         ▇▇▇▇▇▇▇▇▇▇  ▇▇▇▇▇   ▇▇     ▇      ▇                  │
└──────────────────────────────────────────────────────────────┘
```

Rules for the page: one accent colour, numbers only turn orange when a threshold breaks, no legends longer than a line, nothing below the fold on desktop except the story table.

---

## Technical notes

- New tables `page_events` and `extension_events`, service-role writes only, no anon select, GRANTs with the migration.
- Ingest via one public route `POST /api/public/events` — batched array, zod-validated, origin-allowlisted like the existing transform route, rate-limited by hashed IP, hard cap on payload size. No text fields accepted.
- Client emitter `src/lib/telemetry.ts`: queues events, flushes on 5 s idle / 10 events / `visibilitychange` via `sendBeacon`. Respects `navigator.doNotTrack`.
- Sections tagged with `data-section="hero"` etc. in `src/routes/index.tsx`; one shared IntersectionObserver hook, no per-section state churn.
- Rollup: nightly cron aggregates into `metric_daily` so the dashboard reads small tables, not raw events.
- Dashboard extends `getAdminStats` plus a new `getStoryStats`, both admin-gated as today.
- Uptime/download checks piggyback the existing `/api/public/cron/health` route and write a synthetic event.

## Build order

1. `page_events` + ingest route + client emitter + section tagging → Story tab.
2. Extension events (init, trigger detected, injection failed, quota reached) → fills product Oxygen gaps.
3. Activation, retention, funnel derivations + nightly rollup.
4. Dashboard restructure into Oxygen / Water with thresholds and the health strip.
5. Alerting on Oxygen breaches through the existing daily digest.
