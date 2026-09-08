# Fix the 2 open Project monitoring findings

These two findings are **new** — they were raised against the very changes we just made to model choice and orchestration, not leftovers from before. So they are still showing because they are still in the code.

## Finding 1 (high): slow answers can fail instead of finishing

What happens now: if an AI engine takes longer than 6 seconds to say its first word, we cancel it and park it for 2 minutes. On a long or heavy request, every engine in the chain can get cancelled the same way, and the person sees "The AI returned an empty prompt. Try again." even though nothing was actually broken.

Fix:
- Raise the first-word wait to a safer window (10s for the first engine tried, 8s for later ones) so normal "thinking" time is not treated as failure.
- Only park an engine when it actually refuses (rate limit / error), not when it was merely slow. A slow-but-working engine gets one soft strike, not a 2-minute blackout.
- Last engine in the chain gets no first-word deadline at all — better a slow answer than no answer.
- If every engine still produces nothing, keep the existing refund but show a clearer message ("The AI is busy right now. Try again in a moment.").

## Finding 2 (medium): a refused request still eats a daily transform

What happens now: the personal daily counter and the shared network counter are claimed at the same time (for speed). If the shared network cap blocks the request, the person is refused but their personal count was already increased — repeat tries can silently burn their whole day.

Fix:
- Keep the two claims running together (we keep the speed gain), but refund the personal counter whenever we then return a refusal or an error — the shared-network block and the counter-error path both refund.
- Move the refund helper above these branches so it is available there.

## Technical notes

- `src/lib/patkan-engines.server.ts`: make `FIRST_TOKEN_TIMEOUT_MS` position-aware, skip the deadline for the final attempt, and separate "timed out" from "cooldown-worthy" outcomes in `startCooldown`.
- `src/routes/api/public/transform.ts`: hoist `refund()` above the `Promise.all` allowance block; call it in the `!ipAllowed` and `quotaError` branches.
- Verify: typecheck, one live transform through the playground, plus a forced-timeout check that the chain still returns a result.
- After verification, mark both findings resolved.

Out of scope: changing model order, prompt format, quota numbers, or the shared-IP ceiling design.
