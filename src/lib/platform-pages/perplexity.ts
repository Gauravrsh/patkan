import type { PlatformPageContent } from "@/components/PlatformGeneratorPage";

export const TITLE = "Perplexity Prompt Generator — Patkan";
export const DESCRIPTION =
  "Turn a rough question into a clear Perplexity research prompt inside Perplexity. End your sentence with // and review it before you search.";

export const content: PlatformPageContent = {
  eyebrow: "For Perplexity",
  h1: "A Perplexity prompt generator for clearer research questions",
  intro: [
    "Patkan turns a rough question into a clear research prompt inside Perplexity.",
    "End your sentence with //. Review the result. Then search.",
  ],
  sectionH2: "Make the question clear before you search.",
  platformName: "Perplexity",
  before: "compare the main reasons B2B SaaS companies lose customers and cite reliable sources//",
  after: `## Role
B2B SaaS research analyst.

## Task
Compare the main reasons B2B SaaS companies lose customers.

## Scope
- Group reasons by theme
- Note how common each reason is, where data exists

## Sources
- Cite a source for every claim
- Prefer recent industry research

## Output format
A short table, then a three-line summary.`,
  steps: [
    ["Type your question", "Write what you want to research in plain words inside Perplexity."],
    ["End it with //", "Patkan does nothing until you type two slashes."],
    ["Review and search", "Your question becomes a research brief. Edit it, then search."],
  ],
  faqs: [
    {
      q: "What is a Perplexity prompt generator?",
      a: "A tool that turns a rough question into a clear research brief with a task, scope, source rules and output format, so Perplexity returns a focused answer.",
    },
    {
      q: "Does Patkan work inside Perplexity?",
      a: "Yes. Patkan is a browser extension. Type in the Perplexity search box, end with //, and your text is rewritten in place.",
    },
    {
      q: "Can the prompt ask Perplexity to cite sources?",
      a: "Yes. When your request mentions sources, Patkan adds clear source rules to the prompt.",
    },
    {
      q: "Can I edit the prompt before searching?",
      a: "Yes. Nothing is searched until you press enter. You can read and change every line first.",
    },
  ],
};
