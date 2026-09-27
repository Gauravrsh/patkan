# /privacy — final policy text and page build

Build the dedicated /privacy page from the approved 16-section redraft, with two updates from your latest instructions. No code changes anywhere else — the policy reflects the build, the build is untouched.

## Update 1 — Controller identity

- "Who we are" names **Gaurav Sharma**, operating Patkan as a sole proprietorship, responsible for your personal data.
- Contact: contact@patkan.in (the only contact email; TRADEMARK.md's gmail address stays out of the policy).
- Postal address: "available on request" (as drafted).

## Update 2 — Point 14 (Children): keep one sentence, justify it

The legal need is real, and it is the same reason ChatGPT and Grammarly each carry an age line:

- **DPDP Act 2023, s.9** — a Data Fiduciary must not process a child's (under 18) personal data without verifiable parental consent. Patkan's sign-in and extension do process personal data (email, account id, prompt text), so a 17-year-old signing up through Google puts you inside s.9 with no notice and no consent mechanism.
- **GDPR Art. 8** — same idea for EU users under 16 (or 13 by country).

The fix is NOT an age cap or a ban — it is a one-sentence declaration, which is what every mainstream product uses. Replace the current point 14 with:

> Patkan is not directed at children under 18, and we do not knowingly collect their personal data. If we learn that we have, we delete it.

No restriction is imposed on users; the burden stays on us. Full removal would leave a known DPDP s.9 gap that a CWS reviewer or DPB complaint could point to. If you still want it deleted entirely, say so and it goes.

## Other locked values carried into the final text

- Version **1.0**, "Last updated: 27 September 2026", with the note that this is the first published version.
- Repository: https://github.com/Gauravrsh/patkan (AGPL-3.0 section links here).
- AI providers stay generic: "third-party AI model providers".
- Analytics in plain prose, not field tables.
- Ghost mode: dropped from the policy per your call (noted residual risk: the checkbox still exists in the extension settings).

## Page build

1. **Route** — `src/routes/privacy.tsx`. Single clean page in the site's existing typographic style: wordmark header, 16 numbered sections, AGPL link, contact line, version + date at the bottom. Noindex is NOT set — this page should be indexed.
2. **Head metadata** — title "Privacy Policy · Patkan", description and og tags set on the route (og:image omitted; no hosted hero image on this page).
3. **Footer links** — add "Privacy Policy" to the footer on `index.tsx`, `chatgpt-prompt-generator.tsx`, and `claude-prompt-generator.tsx`, pointing to /privacy.
4. **#privacy answer** — no redirect needed. The homepage keeps its existing privacy section with the #privacy anchor (old CWS links to patkan.in/#privacy land there, and it will link onward to /privacy). Add one "Read the full privacy policy →" link inside that homepage section pointing to /privacy so both paths converge.
5. Nothing else on the homepage or any other page changes.

## Verification

- /privacy returns 200 and renders all 16 sections.
- Footer links visible on all three pages; homepage #privacy section links to /privacy.
- Build clean, no console errors.
