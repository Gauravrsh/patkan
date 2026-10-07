#  Patkan SEO/AEO agent: research and approach document (brainstorm only)

## Hermes check, from the code

Patkan's prompt rewriting does not use Hermes or the Hermes Agent. It uses the Nous Research service with these models:-------i also want a separate deep research and recommendation on what is the difference between using these models on nous research service vs using Hermes Agent. My original intent was to use Hermes Agent only, which is claimed to be never sleeping, self learning, always improving etc, but clearly I am on a different track only with the integration that I have done 

- Qwen3-Next 80B (first choice)
- Llama 4 Maverick (second)
- GLM-4.5 Air (third)
- GLM-4.7 Flash (quick mode)
- Gemini through Lovable AI, used only when Nous fails

Settings stored on the server can switch these models. I can't read those values, so they're unconfirmed. Hermes is not in the list either way, and nothing in Patkan is agent software.

## What you get

One text file in your Files: `patkan-seo-aeo-agent-approach.txt`. No code, no site changes, no connections.

## Answers already locked in

- Keywords: the agent proposes a list from real data, and you approve it.
- Role: watch and recommend only. It never publishes or edits the site.
- Inputs: Search Console, Google Analytics, and a weekly test of AI answers (ChatGPT, Gemini, Perplexity).
- Output: a weekly report in your admin area.

## Research before writing

- Primary sources only: research papers (for example "GEO: Generative Engine Optimization", Princeton/KDD 2024, and papers on LLM agents for search and web tasks), plus Google Search Central, Search Console API, GA4 API, Bing/IndexNow, and OpenAI/Perplexity crawler docs.
- Every claim gets a source URL. Anything I can't source is labelled "unverified".

## Contents of the file

1. Plain-English summary: what the agent does, and what it can't promise.
2. What the research actually says works for search and AI citations, and what's hype.
3. The agent's weekly loop:
  - Pull Search Console and Analytics data.
  - Ask the same set of AI questions and record who gets named.
  - Find changes.
  - Rank recommendations by evidence, effort and expected impact.
4. How the keyword list is built, and how you approve it.
5. How it avoids "AI slop": every recommendation cites the data behind it. It never claims a traffic gain it can't measure. It never suggests filler pages.
6. A sample weekly report, as text.
7. Costs, limits and risks: AI answers change from run to run, Semrush needs your own paid connection if added later, and there are API quotas.
8. Where it would run (inside Patkan's own backend, scheduled weekly) and the build steps in order. The build happens only after you approve it.
9. Open questions for you.
10. All source URLs.

## Open questions (also listed in the file)

- Countries to track: India only, or India plus the US? ---india, for now. Will keep global geography later.
- AI answer tests: how many questions a week, given each run costs money? -----give me how many questions would be needed weekly and how much cost will it incur
- Do you want weekly emails on top of the admin report?-----not now