# RCA: a single "/" now fires Patkan

## What the monitoring finding says

Typing any sentence of 4+ words that ends in a single `/` (for example `please review src/utils/`) instantly deletes that slash and starts a rewrite the user never asked for.

## Verified facts

Current line in `extension/content.js`:

```text
const TRIGGER_AT_END = /(?<![:\\])\/[ \t]*$/;
```

Live test of that exact expression:

```text
"please review src/utils/"   -> true   (should be false)
"write a launch email/"      -> true   (should be false)
"go to https://"             -> true   (should be false)
"write a launch email//"     -> true   (correct)
```

The strip helper is `text.replace(/\/[ \t]*$/, "")` — also one slash — and the input handler rewrites the field the moment `shouldTrigger` is true, so the character is removed on the keystroke itself.

## Last-mile root cause

It did not appear on its own. It was introduced by my own previous change (the `word//` trigger fix, base `9c93df9` → head `6f07bd9`).

The original rule was `/(?:^|[\s\n])\/\/[ \t]*$/` — two slashes, preceded by whitespace. The intent of the fix was only to drop the "must be preceded by whitespace" part. While rewriting the expression, the leading `(?:^|[\s\n])` was replaced with the lookbehind `(?<![:\\])` and, in the same edit, **one of the two `\/` escapes was lost**. So the rule went from "two slashes at end" to "one slash at end, not preceded by `:` or `\`".

Three compounding reasons this slipped through:

1. **The lookbehind gave false confidence on URLs.** `https://` was expected to be blocked by the `:` guard, but by the time the string ends the character before the final slash is another `/`, not `:` — so the guard never applies. My test set checked `https://example.com` (ends in a letter) rather than a string ending at the slash.
2. **The test suite only asserted the positive cases and a few negatives.** Every `//` case passes under the broken single-slash rule too, so the suite went green while the rule was wrong. No test asserted that a single trailing `/` must not trigger.
3. **Immediate stripping amplified a soft bug into a critical one.** Under the old 400 ms design a wrong match was merely a stray rewrite; with the new "strip the trigger the instant it matches" behaviour, the user loses the character they just typed, and typing `//` itself has its first slash eaten before the second arrives.

Secondary defect from the same edit: while `pendingCleanText` is set, Enter is `preventDefault`ed and runs a rewrite instead of sending the message.

## Bug log entry to append to `Bug.md`

```text
## BUG-005 — Single "/" fires Patkan and deletes the character
Date: 2026-09-12
Severity: Critical
Surface: Browser extension (all supported hosts)
Symptom: Any sentence of 4+ words ending in a single "/" (paths, URLs, "and/or")
  loses the slash and triggers an unwanted rewrite. Typing "//" loses its first
  slash. Enter submits a rewrite instead of sending the message.
Root cause: Regression introduced by the "word//" trigger fix (9c93df9 -> 6f07bd9).
  TRIGGER_AT_END was rewritten from /(?:^|[\s\n])\/\/[ \t]*$/ to
  /(?<![:\\])\/[ \t]*$/ — one of the two slash escapes was dropped. stripTrigger
  has the same single-slash pattern. The ":" lookbehind does not protect
  "https://" because the char before the final slash is "/", not ":".
Why undetected: tests asserted only "//" positives; every "//" case also passes
  under a single-slash rule, so the suite stayed green.
Status: Open — fix not yet applied.
```

## Decision needed from you

No code fix is applied yet, per your instruction. When you want it, the fix is: restore the two-slash match plus strip (`/\/\/[ \t]*$/`), add negative tests for a single trailing `/`, `https://`, `and/or`, and `src/utils/`, decide whether Enter should still be intercepted, and rebuild both extension packages.
