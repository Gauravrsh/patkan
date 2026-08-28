/**
 * Shared Patkan prompt logic.
 *
 * Kept dependency-free on purpose: the browser extension ships a byte-identical
 * copy of this file, so it must not import anything.
 */

export type PersonaId = "product-manager" | "ux-writer" | "marketer" | "engineer" | "analyst" | "generic";

export interface Persona {
  id: PersonaId;
  label: string;
  role: string;
  constraints: string[];
}

export const PERSONAS: Persona[] = [
  {
    id: "product-manager",
    label: "Product Manager",
    role: "a senior product manager who writes rigorous, decision-ready specs",
    constraints: [
      "State assumptions explicitly instead of inventing missing requirements.",
      "Include edge cases, failure states and out-of-scope items.",
      "Use tables for structured comparisons; no conversational filler.",
    ],
  },
  {
    id: "ux-writer",
    label: "UX Writer",
    role: "a senior UX writer who produces tight, on-brand product copy",
    constraints: [
      "Respect character limits; give 3 options per string.",
      "Plain language, active voice, no marketing adjectives.",
      "Never use exclamation marks or emoji unless asked.",
    ],
  },
  {
    id: "marketer",
    label: "B2B Marketer",
    role: "a B2B marketer who writes platform-native, high-conversion copy",
    constraints: [
      "Match the target platform's formatting conventions exactly.",
      "Lead with a hook in the first line; no emoji.",
      "Keep claims specific and evidence-backed.",
    ],
  },
  {
    id: "engineer",
    label: "Engineer",
    role: "a pragmatic staff engineer who gives implementation-grade answers",
    constraints: [
      "Show working code, not pseudocode; name versions and trade-offs.",
      "Call out failure modes and how to test them.",
      "No conversational filler or restating the question.",
    ],
  },
  {
    id: "analyst",
    label: "Analyst",
    role: "a data analyst who reasons quantitatively and shows the working",
    constraints: [
      "Show the method and formulas before the conclusion.",
      "Flag data you don't have rather than estimating silently.",
      "Present results as a table.",
    ],
  },
  {
    id: "generic",
    label: "General expert",
    role: "an expert in the domain implied by the task",
    constraints: [
      "Do not add conversational filler, meta-announcements or polite intros.",
      "State assumptions clearly when information is missing.",
      "Keep explanations dense, practical and implementation-focused.",
    ],
  },
];

export function getPersona(id: string | undefined | null): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[PERSONAS.length - 1]!;
}

export interface PatkanBlocks {
  role: string;
  context: string;
  task: string;
  constraints: string[];
}

export function renderPatkan(blocks: PatkanBlocks): string {
  const constraints = blocks.constraints.map((c) => `  - ${c}`).join("\n");
  return [
    `<role>`,
    `  You are ${blocks.role}.`,
    `</role>`,
    ``,
    `<context>`,
    `  ${blocks.context}`,
    `</context>`,
    ``,
    `<task>`,
    `  ${blocks.task}`,
    `</task>`,
    ``,
    `<constraints>`,
    constraints,
    `</constraints>`,
  ].join("\n");
}

/**
 * Deterministic, zero-network scaffold. Renders in under a millisecond so the
 * user never stares at an empty box while the model works.
 */
export function localScaffold(rawInput: string, personaId?: string): string {
  const persona = getPersona(personaId);
  const text = rawInput.replace(/\/\/\s*$/, "").trim();
  return renderPatkan({
    role: persona.role,
    context: "The user gave a brief instruction; infer the surrounding situation from it and state any assumption you make.",
    task: text || "Complete the user's request.",
    constraints: persona.constraints,
  });
}

export const META_SYSTEM_PROMPT = `You are 'Patkan', an expert prompt engineer.
Take the user's lazy, unstructured input and rewrite it into one highly structured prompt.

Rules:
- Output ONLY the rewritten prompt. No preamble, no explanation, no code fences.
- Use exactly these XML tags, in this order: <role>, <context>, <task>, <constraints>.
- <role> assigns a specific expert identity with 2-3 concrete traits.
- <context> infers the user's likely situation and states assumptions as assumptions.
- <task> is a single imperative deliverable, specific and measurable.
- <constraints> is a bullet list covering scope, format, edge cases and what to avoid.
- Never answer the user's request. You are rewriting it, not fulfilling it.
- Preserve every concrete detail from the input; never drop names, numbers or platforms.`;

export function buildMetaUserMessage(rawInput: string, persona: Persona, customInstruction?: string | null): string {
  const clean = rawInput.replace(/\/\/\s*$/, "").trim();
  const extra = customInstruction?.trim()
    ? `\n\nAdditional framework the user saved and wants applied:\n${customInstruction.trim()}`
    : "";
  return `Target persona: ${persona.label} — ${persona.role}.
Baseline constraints to fold in (rewrite them naturally, add more as needed):
${persona.constraints.map((c) => `- ${c}`).join("\n")}${extra}

User's raw input:
"""
${clean}
"""`;
}

export const DAILY_FREE_LIMIT = 10;
export const MAX_INPUT_CHARS = 4000;
