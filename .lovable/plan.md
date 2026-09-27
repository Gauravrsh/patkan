# Privacy Policy v2.0 — forensic audit and redline recommendations

Scope: the 12-section draft policy (27 Sep 2026) checked against the extension, the web app, the server endpoints, all 9 database migrations, LICENSE and TRADEMARK.md. No code changes. Following your instruction, the policy changes to match the code.

## A. Factual errors (the policy says something the code contradicts)

| # | Policy says | Code does | Severity |
|---|---|---|---|
| A1 | "Ghost mode only" makes processing anonymous | The toggle is saved but never read. `background.js` attaches the sign-in token whether it is on or off. It does nothing. | Critical (misleading a user about their privacy is deceptive under GDPR Art. 5(1)(a), DPDP s.5 and CWS policy) |
| A2 | Raw IPs are "never written to database disk storage" | Correct for the raw IP. But a 32-character hash of the IP, `ip:<hash>`, is written to `usage_counters` and never deleted. IPv4 addresses are easy to brute-force from an unsalted hash, so under GDPR this is **pseudonymised personal data**, not anonymous data. | High |
| A3 | "rolling 24-hour" ceiling | The limit resets per calendar day (UTC). It is not a rolling window. The number (50) can also be changed by the server operator. | Low |
| A4 | Extension sends an "anonymous" acceptance signal | It sends the device id and the sign-in token if one exists. It is not anonymous. | Medium |
| A5 | Telemetry is limited to `transform_events` | Two more tracking tables are missing from the policy. `page_events` (web visitor id kept in the browser, session id, page, section, device type, referring site) and `extension_events` (device hash, host, event, version). The extension also sends an `extension_initialized` event on install, before any user action. | High (undisclosed processing) |
| A6 | Cache is keyed on "input_text" and is harmless | `prompt_cache` stores your **full prompt text and output in plain text**, with no expiry and no deletion. An identical input from another person gets back the stored output. | High |
| A7 | "Nous Research / OpenRouter" | The code calls Nous's own API and the Lovable AI gateway, which routes to Google Gemini. OpenRouter is not called. Google is the real sub-processor and is not named. | Medium |
| A8 | TLS 1.3, "enterprise endpoints", "not used for training" | None of this can be verified from the code. The TLS version is set by the hosting provider, and each provider's training terms are their own promise, not Patkan's. | Medium (claims that can't be backed up) |
| A9 | Account stores "email and UUID" | `profiles` also stores display name, tier and a `zero_data_mode` flag. Google sign-in also passes your name and photo to the sign-in provider. | Low |
| A10 | "Sync preferences / future library" | The library (`prompt_templates`) already exists and stores saved prompt text against your account. It should be disclosed as a current feature, not a future one. | Medium |
| A11 | Only listed AI sites are read | Correct for page text. But the manifest also puts a script on patkan.in (`web-connect.js`) that passes your sign-in session to the extension. This is not disclosed. | Low |

## B. Inconsistencies inside the documents

- The contact email is contact@patkan.in in the policy but gaurav.rsh@gmail.com in TRADEMARK.md.
- The repository link is a placeholder: `https://github.com/...`.
- The "Entity: Patkan" line names no legal person. Patkan is a brand, not a registered company.
- The Summary says "never monitors browsing", yet referring site and section views are recorded on patkan.in.
- "Version 2.0" appears with no Version 1.0 and no change log.

## C. Non-compliance: GDPR (EU/UK)

1. No legal basis given for each purpose (Art. 6). Suggested mapping: contract for transforms, legitimate interest for rate limiting, security and service telemetry, consent for analytics.
2. No named controller with a postal address (Art. 13(1)(a)).
3. No retention periods (Art. 13(2)(a)). None exist in the code, so the honest wording is "kept until deleted on request". That wording is itself a data-minimisation weakness.
4. No disclosure of international transfers (Art. 44–49). Nous (US), Google (US/global), and a database region that is not stated.
5. Rights are incomplete. Missing: rectification, restriction, objection, withdrawing consent, and the right to complain to a supervisory authority.
6. The browser identifier kept for web analytics needs consent under ePrivacy Art. 5(3). There is no consent banner.
7. There is no age statement.

## D. Non-compliance: DPDP Act 2023 and DPDP Rules 2025 (India)

1. The notice must be standalone and itemised: what personal data, for what purpose, and how to withdraw consent or complain (s.5, Rule 3). The draft does not itemise.
2. No grievance-redressal contact or response timeline (s.8(10), s.13). Also no mention of the right to escalate to the Data Protection Board.
3. The right to **nominate** someone to act for you (s.14) is missing.
4. Children: users under 18 need verifiable parental consent (s.9). The policy is silent. Minimum fix: "not intended for users under 18".
5. The notice should be available in English and, on request, in the Eighth Schedule languages (s.5(3)).
6. Erasure when the purpose ends (s.8(7)). Cache and counters that never expire conflict with this.
7. Breach notification to the Board and affected users (s.8(6)) should be committed to.
8. Remove the stray "DPDA" wording and cite the "Digital Personal Data Protection Act, 2023".

## E. Chrome Web Store specific

- The CWS privacy form must declare **"website content"** (prompt text) and **"user activity"** (events). The policy must match that form word for word.
- The Limited Use statement must use Google's required affirmation sentence verbatim.
- The ghost-mode toggle (A1) is the biggest rejection or takedown risk. The policy must say plainly that it does not currently stop account linking.

## F. AGPL-3.0: what it means for privacy

Good:
- Anyone can check the privacy claims against the published code. That transparency makes the policy more believable.
- Forks that run a modified copy as a service must publish their changes (s.13), which keeps privacy regressions visible.
- TRADEMARK.md already separates the brand from the code.

Bad or risky:
- Every inaccurate policy statement (A1–A11) can be publicly proven wrong. The policy should name the exact commit or version it describes.
- AGPL provides the code "as is" with no warranty (s.15–16). That covers the code only. It does **not** limit Patkan's liability as data controller. The policy must not suggest that it does.
- Self-hosted forks are their own data controllers. The policy should say it covers only patkan.in and the official extension.
- Enterprise users often block AGPL software, which can slow business adoption. This is a commercial issue, not a privacy one.

## G. Recommended changes to the policy text

1. Section 2: state plainly that "Ghost mode only is a saved preference that currently does not prevent account linking", or drop any mention of it.
2. Section 6: describe the hashed IP as pseudonymised personal data kept in the usage counter store with no automatic expiry, and describe the calendar-day UTC reset.
3. New section "Website and extension analytics" listing the `page_events` and `extension_events` fields, the browser identifier, and the install ping.
4. Section 4: say plainly that full prompt and output text is stored unencrypted at rest, is not linked to your account, has no expiry, and may be returned to anyone who submits identical text. Advise users not to enter sensitive personal data.
5. Section 8: name Nous Research and Google (through the Lovable AI gateway). Replace the training claim with "subject to each provider's API terms". Remove OpenRouter.
6. Section 10: replace "TLS 1.3" with "encrypted in transit (HTTPS)". Keep row-level security, which is verifiable.
7. Add a legal-basis table (GDPR) and an itemised notice (DPDP).
8. Add a retention table, honestly stating "no automatic deletion" where that is the case.
9. Add international transfers, a children/age clause, a grievance officer with a 30-day response commitment, DPB and supervisory-authority complaint routes, nomination rights, and breach notification.
10. Section 12: a named individual or entity with a postal address, one contact email, the real repository URL, and the policy version tied to a release.
11. Add a scope line: covers patkan.in and the official extension only, not self-hosted forks.
12. Add a change-log section and a "last updated" date.

## Technical notes (for reference only, no code changes)

Findings came from `extension/background.js` (no zeroDataMode check), `patkan-access.server.ts` (IP hash truncated to 32 characters, stored through `consume_quota`), `transform.ts` (`prompt_cache` upsert of raw text), `events.ts` (`page_events` and `extension_events` inserts), migrations (no retention jobs; `profiles` and `prompt_templates` columns), and `manifest.json` (`web-connect.js` on patkan.in). `field_ngrams` and `field_suggestions` exist but nothing in the app references them. Confirm whether they hold data before deciding to disclose them.

## Next step once approved

I redraft the full policy with every change in section G applied and share it for sign-off, then build the page (route, footer links, `#privacy` redirect) as agreed earlier.
