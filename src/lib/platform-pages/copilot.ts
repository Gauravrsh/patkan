import type { PlatformPageContent } from "@/components/PlatformGeneratorPage";

export const TITLE = "Copilot Prompt Generator — Patkan";
export const DESCRIPTION =
  "Turn a rough request into a structured Microsoft Copilot prompt inside Copilot. End your sentence with // and review the result before you send it.";

export const content: PlatformPageContent = {
  eyebrow: "For Microsoft Copilot",
  h1: "A Copilot prompt generator that works inside Microsoft Copilot",
  intro: [
    "Patkan turns a rough request into a structured prompt inside Microsoft Copilot.",
    "End your sentence with //. Review the result. Then send it.",
  ],
  sectionH2: "Write the request. Keep the structure.",
  platformName: "Copilot",
  before: "Turn these meeting notes into a decision summary for leadership//",
  after: `## Role
Executive communications analyst.

## Context
Raw meeting notes need to be shared with leadership.

## Task
Turn the notes into a decision summary.

## Output format
- Decisions made
- Owners and dates
- Open questions

## Constraints
- Under 200 words
- Use only facts from the notes`,
  steps: [
    ["Type your request", "Write what you need in plain words inside Copilot."],
    ["End it with //", "Patkan does nothing until you type two slashes."],
    ["Review and send", "Your text becomes a structured prompt. Edit it, then send."],
  ],
  faqs: [
    {
      q: "What is a Copilot prompt generator?",
      a: "A tool that turns a rough request into a clear prompt with a role, context, task, output format and constraints, so Microsoft Copilot knows exactly what to return.",
    },
    {
      q: "Does Patkan work inside Microsoft Copilot?",
      a: "Yes. Patkan is a browser extension. Type in the Copilot chat box, end with //, and your text is rewritten in place.",
    },
    {
      q: "What prompt format does Patkan use for Copilot?",
      a: "Markdown headings: Role, Context, Task, Output format and Constraints.",
    },
    {
      q: "Can I edit the prompt before sending it?",
      a: "Yes. Nothing is sent to Copilot until you press send. You can read and change every line first.",
    },
  ],
};
