export type PromptDraft = {
  role?: string;
  traits?: string;
  scenario?: string;
  targetUsers?: string;
  environment?: string;
  coreProblem?: string;
  objective?: string;
  constraints?: string[];
  outputFormat?: string[];
  referenceData?: string;
};

export const EMPTY_DRAFT: PromptDraft = {
  role: "",
  traits: "",
  scenario: "",
  targetUsers: "",
  environment: "",
  coreProblem: "",
  objective: "",
  constraints: [],
  outputFormat: [],
  referenceData: "",
};

export const REQUIRED_FIELDS = ["role", "scenario", "objective"] as const satisfies ReadonlyArray<
  keyof PromptDraft
>;

export const BASE_GUARDRAILS = [
  "Do NOT include conversational filler, meta-announcements, or polite intros.",
  "Do NOT assume missing requirements; state your assumptions clearly if data is missing.",
  "Keep explanations dense, practical, and focused on implementation.",
];

export const DEFAULT_OUTPUT_FORMAT = [
  "**Core Recommendation / Solution Summary** (1-2 sentences)",
  "**Technical Specifications** (Markdown table or bullet points)",
  "**Step-by-Step Execution Plan** (Numbered list)",
];

export function isSectionFilled(draft: PromptDraft, key: keyof PromptDraft): boolean {
  const value = draft[key];
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return false;
}

/** Number of required fields completed. */
export function requiredFilled(draft: PromptDraft): number {
  return REQUIRED_FIELDS.filter((key) => isSectionFilled(draft, key)).length;
}

export function isComplete(draft: PromptDraft): boolean {
  return requiredFilled(draft) === REQUIRED_FIELDS.length;
}

export function draftProgress(draft: PromptDraft): number {
  return Math.round((requiredFilled(draft) / REQUIRED_FIELDS.length) * 100);
}

export function mergeDraft(base: PromptDraft, patch: PromptDraft): PromptDraft {
  const next: PromptDraft = { ...base };
  for (const [key, value] of Object.entries(patch) as [keyof PromptDraft, unknown][]) {
    if (value === undefined || value === null) continue;
    (next[key] as unknown) = value;
  }
  return next;
}

function bullets(items: string[]): string {
  return items.map((item) => `- ${item.replace(/^[-*]\s*/, "")}`).join("\n");
}

/** Renders the draft into the fixed seven-section prompt format. */
export function renderPrompt(draft: PromptDraft): string {
  const role = draft.role?.trim() || "[Domain / Role]";
  const traits = draft.traits?.trim();

  const persona = traits
    ? `You are an expert ${role} known for ${traits}.`
    : `You are an expert ${role} known for [Traits].`;

  const keyDetails = [
    `- Target Users: ${draft.targetUsers?.trim() || "[Details]"}`,
    `- Environment/Stack: ${draft.environment?.trim() || "[Details]"}`,
    `- Core Problem: ${draft.coreProblem?.trim() || "[Details]"}`,
  ].join("\n");

  const extra = (draft.constraints ?? []).map((c) => c.trim()).filter(Boolean);
  const constraints = bullets([...BASE_GUARDRAILS, ...extra]);

  const outputItems = (draft.outputFormat ?? []).map((o) => o.trim()).filter(Boolean);
  const items = outputItems.length > 0 ? outputItems : DEFAULT_OUTPUT_FORMAT;
  const output = items
    .map((item, i) => `${i + 1}. ${item.replace(/^\d+[.)]\s*/, "")}`)
    .join("\n");

  const reference = draft.referenceData?.trim();

  const sections = [
    `[ROLE & PERSONA]\n${persona}`,
    `[CONTEXT & BACKGROUND]\nI am currently ${draft.scenario?.trim().replace(/^I am currently\s*/i, "") || "[Project / scenario]"}.\n\nKey Details:\n${keyDetails}`,
    `[PRIMARY OBJECTIVE]\nYour task is to ${draft.objective?.trim().replace(/^Your task is to\s*/i, "") || "[Action verb + specific deliverable]"}.`,
    `[CONSTRAINTS & GUARDRAILS]\n${constraints}`,
    `[OUTPUT FORMAT & STRUCTURE]\nFormat your response strictly using the following hierarchy:\n${output}`,
  ];

  if (reference) {
    sections.push(`[INPUT DATA / REFERENCE]\n<reference_data>\n${reference}\n</reference_data>`);
  }

  return sections.join("\n\n");
}
