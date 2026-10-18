# Patkan master SEO/AEO + product checklist (merge, dedupe, re-verify)

## What you get

One new file in Files: `patkan-seo-aeo-product-checklist.md`. The original files stay exactly as they are. No site or extension changes.

## Source files merged (7)

1. `marketing/plan.md` (search traffic plan, 2026-10-15)
2. `marketing/research.md`
3. `patkan-grammarly-grade-roadmap-p0-p1-p2.md`
4. `grammarly-vs-patkan-ui-ux-analysis.md`
5. `patkan-seo-aeo-agent-approach.txt`
6. `cws-store-listing-seo-aeo-overhaul.md`
7. `patkan-seo-aeo-audit.pdf`

## Rules for the merge

- Keep every finding, reason, source link, copy draft and open question from all 7 files. Nothing is shortened or dropped.
- Only action items are deduplicated. When the same task appears in more than one file, it becomes one line item, with a "Came from" note listing every file (and section) it appeared in, and any differing wording kept side by side.
- Every line item gets a fixed ID (for example `SEO-03`, `UX-P1-02`, `CWS-05`, `AGENT-04`) so we can say exactly which one we're working on.

## Status check (live site + current code)

Each item gets one status, with the proof written next to it:

- **Done** — live on patkan.in, or in the extension package you uploaded (v1.0.5).
- **Built, not published** — in the code but not yet live.
- **Partly done** — with what's missing.
- **Open** — not started.
- **Waiting on you** — needs your approval, wording, or an outside step.
- **Waiting on CWS review** — all store listing copy and image changes (you'll do them after review).

Items that were open in the originals and are now done are marked **Done (was open)** with the date and proof. Checks used: the live pages on patkan.in, the current code and extension source, the v1.0.5 package contents, Search Console, and a fresh SEO scan. Anything I can't verify is labelled "unverified", never assumed.

## File layout

1. How to use this file (IDs, status labels)
2. Where Patkan stands today (traffic, installs, ratings, search position, with dates and sources)
3. Research, in one flow: how search engines and AI assistants find and quote sites; search demand and competitors; audience needs and doubts; Grammarly benchmark and UX findings; customer feedback (the pill covering text); SEO/AEO agent approach and costs
4. Decisions already locked (approved copy, brand rules, P0 decisions)
5. Master checklist, grouped:
   - A. Website SEO/AEO fixes
   - B. New pages and content
   - C. Off-site listings and outreach
   - D. Chrome Web Store listing (waiting on review)
   - E. Extension product — P0, P1, P2
   - F. Profile section
   - G. SEO/AEO agent
   - H. Release and testing
   Each item: ID, task, detail bullets, status, proof, came from, blocker.
6. Open questions for you, gathered from all files
7. All source links, from all files

## Technical details

- Read all 7 files in full (PDF parsed), map every action item, merge duplicates by meaning.
- Re-verify against `src/routes/*`, `extension/*`, `public/` ZIP contents, live HTML via curl, Search Console, and the SEO scanner.
- Check the final file: every original item ID traced into the new file (a coverage table at the end lists each original item and where it now lives).
