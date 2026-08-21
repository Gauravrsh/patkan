export type PromptDraft = {
  role?: string;
  scenario?: string;
  targetUsers?: string;
  environment?: string;
  coreProblem?: string;
  objective?: string;
  constraints?: string[];
  outputFormat?: string[];
  referenceData?: string;
  complete?: boolean;
};

export const DRAFT_SECTIONS = [
  { key: "role", label: "Role & Persona" },
  { key: "scenario", label: "Context & Background" },
  { key: "objective", label: "Primary Objective" },
  { key: "constraints", label: "Constraints & Guardrails" },
  { key: "outputFormat", label: "Output Format & Structure" },
  { key: "referenceData", label: "Input Data / Reference" },
] as const satisfies ReadonlyArray<{ key: keyof PromptDraft; label: string }>;

const BASE_GUARDRAILS = [
  "Do NOT include conversational filler, meta-announcements, or polite intros.",
  "Do NOT assume missing requirements; state your assumptions clearly if data is missing.",
  "Keep explanations dense, practical, and focused on implementation.",
];

const DEFAULT_OUTPUT_FORMAT = [
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

export function draftProgress(draft: PromptDraft): number {
  const required = DRAFT_SECTIONS.filter((s) => s.key !== "referenceData");
  const filled = required.filter((s) => isSectionFilled(draft, s.key)).length;
  return Math.round((filled / required.length) * 100);
}

export function mergeDraft(base: PromptDraft, patch: PromptDraft): PromptDraft {
  const next: PromptDraft = { ...base };
  for (const [key, value] of Object.entries(patch) as [keyof PromptDraft, unknown][]) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      (next[key] as unknown) = value;
    } else if (typeof value === "string") {
      if (value.trim().length === 0) continue;
      (next[key] as unknown) = value;
    } else {
      (next[key] as unknown) = value;
    }
  }
  return next;
}

function bullets(items: string[]): string {
  return items.map((item) => `- ${item.replace(/^[-*]\s*/, "")}`).join("\n");
}

/** Renders the draft into the fixed seven-section prompt format. */
export function renderPrompt(draft: PromptDraft): string {
  const role = draft.role?.trim() || "[Domain/Role and defining traits]";
  const scenario = draft.scenario?.trim() || "[Project / scenario]";

  const keyDetails = [
    `- Target Users: ${draft.targetUsers?.trim() || "[Details]"}`,
    `- Environment/Stack: ${draft.environment?.trim() || "[Details]"}`,
    `- Core Problem: ${draft.coreProblem?.trim() || "[Details]"}`,
  ].join("\n");

  const constraints = bullets([...BASE_GUARDRAILS, ...(draft.constraints ?? [])]);

  const outputItems =
    draft.outputFormat && draft.outputFormat.length > 0
      ? draft.outputFormat
      : DEFAULT_OUTPUT_FORMAT;
  const output = outputItems
    .map((item, i) => `${i + 1}. ${item.replace(/^\d+[.)]\s*/, "")}`)
    .join("\n");

  const reference = draft.referenceData?.trim() || "[Paste code snippets, SOPs, roadmap details, or text context here]";

  return `[ROLE & PERSONA]
You are ${role}.

[CONTEXT & BACKGROUND]
I am currently ${scenario}.

Key Details:
${keyDetails}

[PRIMARY OBJECTIVE]
Your task is to ${draft.objective?.trim().replace(/^Your task is to\s*/i, "") || "[Action verb + specific deliverable]"}.

[CONSTRAINTS & GUARDRAILS]
${constraints}

[OUTPUT FORMAT & STRUCTURE]
Format your response strictly using the following hierarchy:
${output}

[INPUT DATA / REFERENCE]
<reference_data>
${reference}
</reference_data>`;
}
