# Bug log

Every bug raised becomes one entry below. Rules:

1. Reproduce or corroborate the symptom before writing the entry.
2. Diagnose the root cause by reading the actual failing line, and note the file and line.
3. Ship the fix in the same session as the diagnosis.
4. Every `status: fixed` entry must carry a `verification` line that actually proves it.
5. Append only. Never reuse or skip a serial. Never edit an older entry — append a new one that supersedes it and reference the older serial.

Entry template:

```yaml
- id: BUG-000
  date: YYYY-MM-DD
  title: short summary
  reported: what the user saw, in their words
  repro: steps or conditions that show it
  root_cause: file:line and the actual reason
  fix: what changed
  verification: the check that proves the fix
  status: open | fixed | superseded-by BUG-000
```

---

```yaml
- id: BUG-001
  date: 2026-09-05
  title: Header nav links invisible on mobile and tablet
  reported: "Playground, Install Guide and Sign in are visible on desktop but not on a mobile browser."
  repro: Load / at 393px or 834px wide; the header shows only the logo and the Get button.
  root_cause: >
    src/routes/index.tsx header nav container used `hidden items-center ... lg:flex`,
    so the three links were display:none below the 1024px breakpoint. There was no
    alternative navigation for smaller screens, leaving those sections unreachable
    from the header on phones, tablets, and the 834px Lovable preview.
  fix: >
    Nav row now appears from 768px up, and a menu button (md:hidden) opens a right-side
    sheet containing Playground, Install Guide, Sign in and Get Extension. Selecting an
    item closes the sheet and performs the same action as the desktop link.
  verification: >
    Playwright at 393px: menu button click opens the sheet with all three links plus
    Get Extension visible (/tmp/browser/hdr/menu.png). At 834px and 1440px the inline
    links render. No horizontal overflow and no console errors at any of the three widths.
  status: fixed

- id: BUG-002
  date: 2026-09-05
  title: Hindi pronunciation badge /पट्कन/ missing on mobile and in preview
  reported: "The patkan in Hindi is on the desktop masthead but not on mobile, and not even in the Lovable preview."
  repro: Load / at 393px; the badge next to the wordmark is absent.
  root_cause: >
    src/routes/index.tsx badge span used `hidden ... sm:inline`, hiding it below 640px.
    In the 834px preview the badge was technically eligible but competed for space in a
    tight single-row header alongside the nav and CTA.
  fix: >
    Badge is rendered at every width with a smaller font and tighter padding below 640px;
    the wordmark truncates before the badge, so the row stays on one line.
  verification: >
    Playwright asserted the badge visible at 393px, 834px and 1440px with
    document.documentElement.scrollWidth === window.innerWidth (no overflow) at all three.
  status: fixed
```

```yaml
- id: BUG-003
  date: 2026-09-07
  title: Streamed transforms were charged but never recorded
  reported: "Yesterday evening I only did attempt few transforms. Why can't you see the logs?"
  repro: >
    usage_counters for 2026-09-06 shows device:a7b5fd71 count 4 at 17:49 UTC, while
    transform_events has no row after 07:52 UTC that day (and those two are audit calls).
  root_cause: >
    src/routes/api/public/transform.ts called telemetry with `void recordEvent(...)`.
    On the worker runtime the request ends when the response (or streamed response)
    closes, so the in-flight insert was dropped. Quota survived because consume_quota
    is awaited before the response. The website and the extension both stream by
    default, so real usage was the traffic systematically lost.
  fix: >
    Every telemetry call on every path (ok, cached, empty, error, limited) is now
    awaited before the response is returned or the stream is closed. Funnel events
    (playground_compiled/copied, download_clicked) flush immediately in
    src/lib/telemetry.ts. The events intake logs rejected batches. /admin shows a
    recorded-vs-charged tile and the health cron raises an instrumentation-gap breach.
  verification: >
    Live streamed transform through an allowed origin produced a matching
    transform_events row with engine, ttfb_ms and latency_ms populated; the admin
    reconciliation tile reads parity for the same window.
  status: fixed

- id: BUG-004
  date: 2026-09-07
  title: Data gap — four transforms on 2026-09-06 evening are unrecoverable
  reported: n/a (consequence of BUG-003)
  repro: transform_events has no rows between 2026-09-06 07:52 UTC and the BUG-003 fix.
  root_cause: See BUG-003. No latency, engine or outcome data was ever written.
  fix: Not backfillable. Recorded here so dashboard history is read as incomplete, not quiet.
  verification: usage_counters remains the only evidence those transforms happened.
  status: fixed

- id: BUG-005
  date: 2026-09-12
  title: A single "/" fires Patkan and eats the character
  severity: critical
  surface: browser extension (all supported hosts)
  repro: >
    In any supported composer, type a sentence of 4+ words ending in a single "/"
    (e.g. "please review the file src/utils/"). The slash disappears and a rewrite
    starts. Typing "//" loses its first slash before the second is typed. Pressing
    Enter while a pending trigger is set runs a rewrite instead of sending.
  evidence: >
    extension/content.js line 463: TRIGGER_AT_END = /(?<![:\\])\/[ \t]*$/ — one
    escaped slash. Live test: "please review src/utils/" -> true,
    "write a launch email/" -> true, "go to https://" -> true.
    stripTrigger uses the same single-slash pattern and the input handler writes
    the stripped text immediately.
  root_cause: >
    Regression introduced by my own "word//" trigger fix (9c93df9 -> 6f07bd9).
    The original rule was /(?:^|[\s\n])\/\/[ \t]*$/ (two slashes, whitespace
    before). The intent was only to drop the whitespace requirement, but while
    replacing the leading (?:^|[\s\n]) with the lookbehind (?<![:\\]) one of the
    two \/ escapes was lost, turning "two slashes at end" into "one slash at end".
    The ":" lookbehind does not protect "https://" because the character before
    the final slash is "/", not ":".
  why_undetected: >
    The verification suite asserted "//" positives and a few negatives; every "//"
    case also matches a single-slash rule, so it stayed green. No case asserted
    that a lone trailing "/" must not trigger. The new immediate-strip behaviour
    turned a stray-trigger bug into character loss.
  fix: >
    TRIGGER_AT_END restored to two slashes with a widened lookbehind:
    /(?<![:\\/])\/\/[ \t]*$/ — so "https://" (preceded by ":") and "…//" inside a
    longer slash run never fire. stripTrigger matches /\/\/[ \t]*$/ so only the
    real trigger is removed. Enter interception kept: it now only fires after a
    genuine "//" trigger. Both extension packages rebuilt.
  verification: >
    node --check passes; 12-case suite green, including negatives for a lone
    trailing "/", "src/utils/", "https://", "and/or", "a//b", "\//" and inputs
    under four words. Positives: "write a launch email//" and spaced variants.
  status: fixed

- id: BUG-006
  date: 2026-10-01
  title: Short prompts (under 4 words) never fire Patkan
  severity: high
  surface: browser extension (all supported hosts)
  repro: >
    In any supported composer, type a short rough thought ending in "//",
    e.g. "rsadasjd askdjb//" or "fix this//". Nothing happens — no pill, no
    rewrite — and pressing Enter sends the raw text with the trailing "//"
    to the AI, which replies as if it were a typo.
  evidence: >
    Live telemetry for 2026-10-01: trigger_detected fired only for inputs
    of 4+ words; no transform_events row exists for the 2-word input seen
    in the user's screenshot. extension/content.js shouldTrigger returned
    false because the word count before "//" was below 4; maybeShowPill
    additionally hid the pill below 5 words.
  root_cause: >
    extension/content.js shouldTrigger required words >= 4 and
    maybeShowPill required words >= 5. The thresholds were meant to skip
    accidental triggers, but they silently excluded exactly the input
    Patkan exists for: a short, rough, half-formed thought. There was no
    user-visible feedback explaining why nothing fired.
  why_undetected: >
    All trigger tests used sentences of 4+ words, so the threshold was
    never exercised from below.
  fix: >
    shouldTrigger now fires on any non-trivial text (trimmed length >= 3
    characters) instead of a 4-word minimum; maybeShowPill shows the pill
    from 3 characters up. URL/path/escape guards (TRIGGER_AT_END lookbehind,
    \// escape) are unchanged. Manifest bumped to 1.0.2; both extension
    packages rebuilt.
  verification: >
    node --check passes; trigger suite green with new cases:
    "fix this//" -> true, "rsadasjd askdjb//" -> true, "ab//" -> false,
    "https://x//" -> false, "a//b//" -> false, "\//" -> false,
    "write a launch email//" -> true.
  status: fixed

- id: BUG-007
  date: 2026-10-04
  title: "//" does not fire Patkan in Gemini for installed users
  severity: high
  surface: browser extension (Gemini; store installs)
  reported: "I just tried using patkan, in gemini. the // doesnt seem to be working."
  repro: >
    Install Patkan from the Chrome Web Store, open gemini.google.com, type a
    short thought of 1-3 words ending in "//" (e.g. "fix this//"). Nothing fires.
  evidence: >
    Chrome Web Store listing serves version 1.0.0 (checked 2026-10-04). Playwright
    on live gemini.google.com/app with the 1.0.0 content.js: "short prompt test//"
    -> no trigger; "this is five words now//" -> trigger + transform. With the
    repo build the same short input fires. extension_events has zero rows on
    2026-10-04, consistent with nothing firing on the user's install.
  root_cause: >
    1) Distribution: the BUG-006 fix (3-character threshold, extension/content.js
    shouldTrigger ~line 489) shipped only in repo build 1.0.2; the store still
    serves 1.0.0, whose shouldTrigger requires words >= 4, so short Gemini
    prompts never fire. 2) Fragility: extension/content.js lines 24-28 gave
    Gemini only two Quill selectors and no fallbacks, unlike other hosts, and
    "rich-textarea div[contenteditable='true']" also matches Gemini's hidden
    .ql-clipboard helper. Any Gemini markup change would silently disable Patkan.
    3) Tabs open before install/update receive no content script until refreshed.
  fix: >
    Gemini selectors widened (editor inside rich-textarea, aria-label "prompt for
    Gemini", role=textbox, textarea) and the .ql-clipboard helper excluded.
    Manifest bumped to 1.0.3; both extension packages rebuilt. Store upload of
    1.0.3 is required for users to receive the fix.
  verification: >
    node --check passes. Playwright on live gemini.google.com/app with the 1.0.3
    content.js: "fix this//" -> transform, "marketing ideas//" -> transform,
    "need a marketing plan for new insurance product//" -> transform, "ab//" ->
    no trigger (as designed). Real-user fix is confirmed only once the store
    listing shows 1.0.3 and extension_events records a gemini trigger_detected.
  status: fixed


```


## BUG-008 — A link anywhere in the prompt blocked `//`
Date: 2026-10-06
Severity: Medium
Surface: Browser extension (all supported AI sites)
Symptom: "summarize this article https://example.com/post //" did nothing.
Root cause: extension/content.js shouldTrigger refused any text containing "//" anywhere, and every https:// link contains "//".
Fix: only the word attached to the trailing `//` is checked, so "https://x.com//" and "a//b//" still don't fire, but an earlier link no longer blocks Patkan. Version 1.0.4; Chrome and Firefox packages rebuilt.
Verification: 21-case test run against the shipped function (links, single "/", https://, \//, a//b//, multi-line, 3-character minimum): all pass. Both zips contain the new code and version 1.0.4.
Status: fixed (reaches users after the 1.0.4 upload to Chrome Web Store)
