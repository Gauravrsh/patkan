# Mobile masthead: missing links and missing /पट्कन/

## What's happening

Both symptoms are deliberate hiding rules in the header, not a rendering fault:

- The three links (Playground, Install Guide, Sign in) sit in a block hidden below the large desktop breakpoint (1024px). Phones, tablets, and the Lovable preview at 834px all fall below it, so nothing shows.
- The Hindi pronunciation badge `/पट्कन/` is hidden below 640px, so it disappears on phones. In the 834px preview it should appear — if it is missing there too, it is being pushed out by the tight header row, which the fix below also addresses.

## The fix

1. Add a compact menu button on small screens: tapping it opens a sheet with Playground, Install Guide, Sign in, and Get Extension. Links close the sheet and scroll to the right section under the sticky header.
2. Keep the desktop row exactly as it is today; only screens under 1024px get the menu button.
3. Show `/पट्कन/` at every width. On phones it renders slightly smaller so the row stays on one line, with the name truncating before the badge does.
4. Verify at 393px, 834px, and 1440px: all links reachable, badge visible, no overflow, no console errors.

## Bug log

Create `Bug.md` at the project root with a short protocol header (how entries are written) and the first two entries for these issues:

- Serial, date, title, symptom as reported
- Root cause with the exact file and line
- Fix shipped in the same entry
- Verification step that proves it (viewport screenshot check)
- Status

Rules recorded in the file: append only, never renumber, never edit an old entry (supersede with a new one referencing it), and never mark fixed without a verification line.

## Technical details

- File: `src/routes/index.tsx` header block (lines ~427-467).
- `hidden ... lg:flex` on the nav container and `hidden ... sm:inline` on the phonetic badge are the two causes.
- Mobile menu uses the existing shadcn `sheet` component and existing semantic tokens; no new dependencies, no copy changes.
- New file: `Bug.md` (root).
