# Patkan — Change trigger from `//` to `///`

Switch the end-of-line trigger to three slashes everywhere. This avoids false positives on
URLs, file paths, and code snippets that legitimately end in `//`.

## Changes

### Engine (trigger regex + stripping)
- `src/lib/patkan-core.ts` — `stripTrigger()`: `/\/\/\s*$/` → `/\/\/\/\s*$/` (2 occurrences of the regex pattern across the file's helpers).
- `extension/patkan-core.js` — same `stripTrigger()` update (kept in sync with the TS core).

### Content script (detection + rewrite)
- `extension/content.js`:
  - Trigger detection: `/\/\/\s*$/.test(text)` → `/\/\/\/\s*$/` (line ~298).
  - Pre-send strip before enrichment: `.replace(/\/\/\s*$/, "")` → `.replace(/\/\/\/\s*$/, "")` (line ~192).

### User-facing copy
- `src/routes/index.tsx`:
  - Hero/demo hint chip: `//` → `///` (line ~167).
  - Install instructions: "end it with //" → "end it with ///" (line ~337).
- Check `extension/sidepanel.html/js` and `extension/options.html/js` for any `//` mention in help text and update to `///`.

### Packaging
- Re-zip `public/patkan-extension.zip` with the updated extension files.

## Notes
- Order of regex matters: matching `///` at end-of-line still works if a user types `////` (extra slashes are stripped as part of the trigger).
- No changes to the background script, API, or quota logic — the trigger is purely client-side.

## Verification
- `tsgo` typecheck passes.
- Playwright: landing page shows `///` in the hint and install steps.
- Manual content-script check: simulate typing ending in `///` in a composer and confirm the pill appears; typing ending in `//` does nothing.
