import type { PlatformPageContent } from "@/components/PlatformGeneratorPage";

export const TITLE = "DeepSeek Prompt Generator — Patkan";
export const DESCRIPTION =
  "Turn a rough idea into a clear DeepSeek prompt inside DeepSeek. End your sentence with // and review the result before you send it.";

export const content: PlatformPageContent = {
  eyebrow: "For DeepSeek",
  h1: "A DeepSeek prompt generator that keeps your request clear",
  intro: [
    "Patkan turns a rough idea into a clear, structured prompt inside DeepSeek.",
    "End your sentence with //. Review the result. Then send it.",
  ],
  sectionH2: "Start with the idea. Add structure only when you need it.",
  platformName: "DeepSeek",
  before: "help me plan a launch email sequence for a new consulting service//",
  after: `## Role
Email marketing strategist for professional services.

## Context
A new consulting service is launching.

## Task
Plan a launch email sequence.

## Output format
For each email: send day, subject line, goal, key message.

## Constraints
- 4 to 5 emails
- Plain, direct language
- One call to action per email`,
  steps: [
    ["Type your idea", "Write what you need in plain words inside DeepSeek."],
    ["End it with //", "Patkan does nothing until you type two slashes."],
    ["Review and send", "Your idea becomes a structured prompt. Edit it, then send."],
  ],
  faqs: [
    {
      q: "What is a DeepSeek prompt generator?",
      a: "A tool that turns a rough idea into a clear prompt with a role, context, task, output format and constraints, so DeepSeek knows exactly what to return.",
    },
    {
      q: "Does Patkan work inside DeepSeek?",
      a: "Yes. Patkan is a browser extension. Type in the DeepSeek chat box, end with //, and your text is rewritten in place.",
    },
    {
      q: "What prompt format does Patkan use for DeepSeek?",
      a: "Markdown headings: Role, Context, Task, Output format and Constraints.",
    },
    {
      q: "Do I need to know prompt engineering?",
      a: "No. Write in plain words. Patkan adds the structure.",
    },
  ],
};
