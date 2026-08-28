// Shared Patkan logic. Mirrors src/lib/patkan-core.ts on the web side.

export const PERSONAS = [
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

export function getPersona(id) {
  return PERSONAS.find((p) => p.id === id) || PERSONAS[PERSONAS.length - 1];
}

export function localScaffold(rawInput, personaId) {
  const persona = getPersona(personaId);
  const text = String(rawInput || "").replace(/\/\/\s*$/, "").trim();
  return [
    "<role>",
    "  You are " + persona.role + ".",
    "</role>",
    "",
    "<context>",
    "  The user gave a brief instruction; infer the surrounding situation from it and state any assumption you make.",
    "</context>",
    "",
    "<task>",
    "  " + (text || "Complete the user's request."),
    "</task>",
    "",
    "<constraints>",
    persona.constraints.map((c) => "  - " + c).join("\n"),
    "</constraints>",
  ].join("\n");
}

export const DEFAULT_API_BASE = "https://patkan.lovable.app";
export const DAILY_FREE_LIMIT = 10;
