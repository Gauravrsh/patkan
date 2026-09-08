# Patkan: 30 Non-Tech Professions and Their Browser Tools

## Goal
Produce one reference document listing the top 30 white-collar, non-technical professions who use AI daily and are a strong fit for the Patkan browser extension — and, for each, the browser-based tools they work in every day where Patkan could plausibly trigger.

## Deliverable
A single editable text file saved to your files area:
`patkan-professions-and-tools.md`

## Structure of the document
1. **How to read this** — one short paragraph on what "Patkan fit" means (a text box in a browser where a person types an instruction to an AI, or writes prose that an AI will act on).
2. **The 30 professions**, each as its own block:
   - Profession name and a one-line description of the AI-heavy part of their day
   - Why Patkan fits (the specific rough-thought-to-prompt moment)
   - Patkan fit rating: High / Medium
   - **Tools table** — 5 to 20 browser-based tools they live in, each with:
     - Tool name and the web address people use
     - What they use it for
     - Whether it has an AI text box today (Yes / No / Partial)
     - Patkan relevance: Direct (extension can act in the text box) / Indirect (they copy a prompt out of Patkan into it)
3. **Cross-cutting summary** — the tools that appear across the most professions, ranked. This is the shortlist worth supporting first.
4. **Gaps and judgement calls** — professions considered and left out, and any place where the tool list is thinner because the profession works mostly outside a browser.

## Selection rules
- Non-technical only: no software engineers, data scientists, DevOps, security analysts.
- Professions are grouped so they do not overlap (a "marketer" and a "content writer" are distinct roles with distinct tools, not the same person twice).
- Tools must be primarily used in a web browser. Desktop-only or mobile-only products are excluded, and where a tool is mostly desktop this is stated rather than silently included.
- Tool counts vary by profession — 5 where the working set is genuinely small, up to 20 where it is broad. No padding to hit a number.

## How it will be built
Research is done with web searches per profession cluster (roughly six clusters of five professions), run in parallel, covering the actual daily software stack rather than vendor marketing lists. Findings are consolidated into the single file, then read back end to end to check for duplicate tools, wrong categories, and dead product names.

## Not in scope
No code changes, no product changes, no changes to the extension's supported-site list. This is a research artifact for future product decisions.
