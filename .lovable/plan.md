# Why yesterday evening's transforms are invisible

## What the data actually shows (verified)

- `usage_counters` for 6 Sep: `device:a7b5fd71…` count **4**, updated **17:49 UTC**; another device count 1 at 09:51; another count 2 at 05:00.
- `transform_events` for 6 Sep: **last row 07:52 UTC** — and those two rows are my own audit calls (`telemetry-audit-001/002`), which were non-streaming.
- So the allowance was charged four times in the evening while zero performance rows were written. The transforms happened. The recording did not.
- `page_events` are arriving (page views, sections, scroll, exits — latest 03:32 today), but there is **not a single `playground_compiled` / `download_clicked` row ever**, including the 17:49 session.

## Root cause

In `src/routes/api/public/transform.ts` every telemetry write is `void recordEvent(...)` — fired without being awaited. On the serverless worker the request is considered finished the moment the response (or the streamed response) closes, and any promise still in flight is dropped. Sequence in the streaming branch:

```text
… stream last delta → telemetry(ok) starts → send done → controller.close()
                                   ↑ insert never completes; worker torn down
```

Quota survives because `consume_quota` is awaited before the response; telemetry does not because it is deliberately fire-and-forget. Non-streaming calls sometimes win the race — which is exactly why my audit rows exist and real user rows don't. The website and the extension both stream by default, so **real usage is the traffic we systematically fail to record**.

Second, smaller gap: the playground's own `playground_compiled` event has never landed once, so the client-side funnel is missing the moment that matters most. Cause to confirm: the transform stream keeps the tab busy and the event queue only flushes on a 5 s idle / 10-event / page-hide trigger, so a compile followed by a quick tab close can be lost, and the ingest route's origin allowlist may be rejecting some origins outright.

Third, and the reason you had to ask me instead of the dashboard telling you: nothing compares "transforms charged" against "transforms recorded", and nothing raises a flag when performance rows stop arriving. A silent instrumentation outage looks identical to a quiet day.

## The fix

1. **Make telemetry survive the response.** Await the transform-event insert before the response is returned on the non-streaming path, and on the streaming path write the row *before* `send(done)` / `controller.close()`, keeping the failure path (`empty`, `error`, `limited`) on the same rule. Where the platform exposes it, also register the write with the request's keep-alive hook so a slow insert is not cut off. Telemetry failures stay swallowed — they must never break a transform.
2. **Backfill guard, not backfill.** Yesterday's four transforms cannot be reconstructed (no latency/engine data exists). Record that gap explicitly in `Bug.md` so the dashboard's history is honest rather than silently short.
3. **Close the playground funnel gap.** Flush the event queue immediately on `playground_compiled`, `playground_copied` and `download_clicked` instead of waiting for the idle timer, and log rejected batches at the ingest route so an allowlist or validation rejection is visible instead of silent.
4. **A reconciliation tile on `/admin`.** One number: transforms charged (`usage_counters` daily deltas) vs transforms recorded (`transform_events`). Anything other than parity turns orange and reads "instrumentation gap", so this class of blindness announces itself.
5. **Silence alarm.** Extend the existing health cron so "no transform event for N hours during a day where the quota counters moved" is an Oxygen breach, not an absence of news.

## Verification before I call it done

- Run a real streamed transform through the allowed origin, then query `transform_events` and confirm one matching row with engine, TTFB and latency populated.
- Run a limited/error path and confirm those rows land too.
- Compile once in the playground and confirm `playground_compiled` appears in `page_events`.
- Confirm the reconciliation tile reads parity for today.

## Scope note

This is a recording fix only — no change to the transform behaviour, the quota rules, or the prompt engine.
