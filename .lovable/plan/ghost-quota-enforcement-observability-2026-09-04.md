# Ghost quota enforcement + observability

## 1. How the 10/day ghost limit works today

Patkan is a browser extension (not an .exe) — a content script plus a background worker. The limit is **not** enforced in the extension; it is enforced server-side, which is the only place it can be trusted.

Flow today:

- On first run the background worker generates a random `deviceId` and stores it in `chrome.storage.local`.
- Every transform sends it as the `x-patkan-device` header plus in the body.
- `/api/public/transform` builds a subject key: `user:<uuid>` if a valid signed-in bearer token is present, otherwise `device:<deviceId>`.
- It reads `usage_counters` for that subject + today's UTC date. At 10 it returns HTTP 429 with `limitReached: true` and `requiresSignIn: true` for ghosts.
- Cache hits replay without touching the counter, so repeat inputs are free.

Honest limits of this: a user can clear extension storage or reinstall to get a fresh `deviceId`. That is acceptable for a friction-not-fortress free tier; hard-proofing it would need fingerprinting or forced sign-up, both worse for the product.-----noted, we will park it for later, basis usage. 

### Gaps to close

- **Counter is bumped only on success**, but nothing caps burst parallel calls — two simultaneous requests can both read `used = 9`. Fix with an atomic Postgres RPC (`increment_usage(subject_key, day)`) that does an `INSERT ... ON CONFLICT DO UPDATE SET count = count + 1 RETURNING count`, and reject when the returned count exceeds the limit.-----okay
- **The 429 has no upgrade path in the UI.** The extension currently shows the error text only. Add a proper limit state: pill turns into "Daily limit reached — sign in to continue", clicking opens `/connect` in a new tab; the side panel shows the same CTA. In-place, the user's original text is left untouched so nothing is lost.-------agree, lets do this.
- **No remaining-count feedback.** The API already returns `used`/`limit`; surface "3 left today" in the side panel and options page so the wall isn't a surprise.------okay
- **Signed-in users get the same 10.** Decide the signed-in allowance (proposal: 50/day) so signing up is actually worth it — otherwise the CTA is hollow.
- **Device→user merge**: when a ghost signs in, carry that day's device count onto the user key so the limit can't be doubled by signing in mid-day.

## 2. Observability — usage and performance

Nothing is instrumented today beyond `console.error` in the engine layer. Proposal: one event table plus a small read-only dashboard, no third-party vendor.

### Event capture

New service-role-only table `transform_events`, written fire-and-forget at the end of each transform:


| column                                                 | purpose                              |
| ------------------------------------------------------ | ------------------------------------ |
| `id`, `created_at`                                     | timeline                             |
| `subject_kind` (`user`/`device`), `subject_hash`       | who, without storing raw device ids  |
| `host`                                                 | which AI site the transform targeted |
| `persona`, `dialect`, `intensity`, `intent`            | what kind of job                     |
| `engine` (`primary`/`fallback`/`local`), `cached`      | which engine paid for it             |
| `input_chars`, `output_chars`                          | rough token proxy for cost           |
| `latency_ms`, `ttfb_ms`                                | performance, first-token vs total    |
| `outcome` (`ok`/`empty`/`error`/`limited`)             | reliability                          |
| `surface` (`extension-inline`/`extension-panel`/`web`) | where it came from                   |


Explicitly **not** stored: prompt text or output text. The existing `prompt_cache` already holds text for cache purposes; events stay text-free so analytics never becomes a privacy liability.

Client-side signals the extension sends along with the transform: `host`, `surface`, and whether the user ultimately **accepted** the result (kept it and submitted) or discarded it — acceptance rate is the single most useful quality metric and can't be measured server-side.

### Dashboard

An `/admin` route behind an admin role (new `user_roles` table + `has_role` function, checked server-side) showing:-----stitch it strictly behind the auth wall. Give access only to the users I tell you later.

- Transforms per day, split ghost vs signed-in.
- Cache hit rate and engine mix (how often the primary engine is actually serving).
- p50/p95 latency and time-to-first-token, per engine.
- Error and empty-output rate.
- Acceptance rate, and top hosts / personas / dialects.
- Ghost→sign-in conversion: how many devices hit the wall vs how many signed in within 7 days.
- Estimated spend: character counts × per-model rates.

### Operational alerting

A daily cron (pg_cron → `/api/public/cron/health`) that checks yesterday's error rate, p95 latency, and primary-engine share, and emails a digest when any breaches threshold. Nous/gateway failures currently fail silently into the fallback — this makes that visible.

## Technical notes

- Atomic quota via a `SECURITY DEFINER` SQL function; `EXECUTE` revoked from `public`/`anon`, called with the service-role client only.
- `transform_events` insert is `void`-awaited so it never adds latency to the user's response.
- `subject_hash` = SHA-256 of the subject key, so a device can be counted over time without being identifiable.
- Roles live in a separate `user_roles` table with a `has_role` security-definer function — never on `profiles`.
- Dashboard reads go through `createServerFn` with `requireSupabaseAuth` + admin role check; no admin data reachable from a public route.
- Extension bump: send `host`/`surface`, report acceptance, render the limit-reached CTA; archive rebuilt.

## Build order

1. Atomic quota RPC + signed-in allowance + device→user merge.
2. Limit-reached CTA and "N left today" in extension and web.
3. `transform_events` table + instrumentation in the transform route.
4. Acceptance reporting from the extension.
5. `user_roles` + `/admin` dashboard.
6. Cron health digest.