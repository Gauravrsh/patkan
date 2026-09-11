# Fix extension trigger so `word//` starts Patkan again

## Problem

The current extension trigger only fires when `//` is preceded by whitespace or the start of input. Typing `write a launch email//` does nothing, even though the pill says "Type // to Patkan". Worse, the 400 ms idle delay means a quick Enter press can submit the raw text with the trailing `//` still in it.

## Root cause

- `TRIGGER_AT_END = /(?:^|[\s\n])\/[ \t]*$/` excludes `word//`.
- `run()` is deferred behind a 400 ms `setTimeout`; the trailing `//` is only stripped inside `run()`, so Enter before the timer fires sends the untransformed text.
- The UI hint is unconditional, so users expect `word//` to work.

## Proposed fix

1. **Allow `//` immediately after a word, but keep URL/path/comment guards.**
   - Change the regex so `//` at end-of-input always qualifies, regardless of what precedes it.
   - Add a negative lookbehind/lookaround guard so `http://`, `https://`, `://`, `a//b`, and code comments (`// comment`) do not fire.
   - Keep the `\//` escape rule.

2. **Remove the trailing `//` from the composer as soon as the trigger is recognised, before the model call.**
   - On input, if `shouldTrigger(text)` is true, immediately strip the trailing `//` (with any trailing spaces) from the field and update `lastOriginal` to the cleaned text.
   - This prevents Enter from submitting raw text even if the user hits it before Patkan returns.

3. **Reduce the idle delay and make Enter behave predictably.**
   - Drop `IDLE_MS` to 150–200 ms for the inline trigger (enough to skip a URL mid-type, fast enough to feel instant).
   - While a rewrite is in flight, Enter is already blocked; keep that.
   - If Patkan is not busy and the field still ends in `//`, treat Enter as a trigger rather than a native submit.

4. **Update the hint copy only if needed.**
   - The current "Type // to Patkan" remains correct once `word//` works.

5. **Verify with real inputs.**
   - `write a launch email//` → triggers.
   - `https://example.com` → does not trigger.
   - `visit a//b path` → does not trigger.
   - `some text \//` → does not trigger.
   - Pressing Enter immediately after `//` → Patkan runs, raw text is not sent.

## Files to change

- `extension/content.js`: regex, immediate strip, idle delay, Enter handling.
- Rebuild `public/patkan-extension.zip` and `public/patkan-extension-firefox.zip` via `scripts/build-extension.mjs`.

## Out of scope

- Changing the brand trigger from `//` to something else.
- Changing quota, engine, or server-side logic.
