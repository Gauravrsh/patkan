/**
 * Patkan prompt engine.
 *
 * Dependency-free on purpose: the browser extension ships a mirror of this
 * module (extension/patkan-core.js), so it must not import anything.
 *
 * The engine is not a template. It classifies intent, picks a format dialect
 * for the target model, and compiles only the blocks the task actually needs.
 */

/* ------------------------------------------------------------------ personas */

export type PersonaId =
  | "auto"
  | "product-manager"
  | "ux-writer"
  | "marketer"
  | "engineer"
  | "analyst";

export interface Persona {
  id: PersonaId;
  label: string;
  role: string;
  constraints: string[];
}

export const PERSONAS: Persona[] = [
  {
    id: "auto",
    label: "Auto",
    role: "an expert in the domain the task implies",
    constraints: [
      "State assumptions as assumptions; never invent missing requirements.",
      "No conversational filler, meta-announcements or restating the question.",
    ],
  },
  {
    id: "product-manager",
    label: "Product Manager",
    role: "a senior product manager who writes rigorous, decision-ready specs",
    constraints: [
      "Cover edge cases, failure states and explicit out-of-scope items.",
      "Use tables for structured comparisons; no filler.",
    ],
  },
  {
    id: "ux-writer",
    label: "UX Writer",
    role: "a senior UX writer who produces tight, on-brand product copy",
    constraints: [
      "Respect character limits; give 3 options per string.",
      "Plain language, active voice, no marketing adjectives, no emoji.",
    ],
  },
  {
    id: "marketer",
    label: "B2B Marketer",
    role: "a B2B marketer who writes platform-native, high-conversion copy",
    constraints: [
      "Match the target platform's formatting conventions exactly.",
      "Lead with a hook in the first line; keep claims specific and evidence-backed.",
    ],
  },
  {
    id: "engineer",
    label: "Engineer",
    role: "a pragmatic staff engineer who gives implementation-grade answers",
    constraints: [
      "Show working code, not pseudocode; name versions and trade-offs.",
      "Call out failure modes and how to test them.",
    ],
  },
  {
    id: "analyst",
    label: "Analyst",
    role: "a data analyst who reasons quantitatively and shows the working",
    constraints: [
      "Show the method before the conclusion; present results as a table.",
      "Flag data you don't have rather than estimating silently.",
    ],
  },
];

export function getPersona(id: string | undefined | null): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0]!;
}

/* ------------------------------------------------------------------ dialects */

export type Dialect = "xml" | "markdown" | "sectioned";

export interface DialectSpec {
  id: Dialect;
  label: string;
  note: string;
  /** Hosts this dialect is the right default for. */
  hosts: string[];
}

export const DIALECTS: DialectSpec[] = [
  {
    id: "xml",
    label: "XML",
    note: "Claude — Anthropic trains on tag boundaries and respects them.",
    hosts: ["claude.ai"],
  },
  {
    id: "markdown",
    label: "Markdown",
    note: "GPT — OpenAI's own guidance leans on headings, not tags.",
    hosts: [
      "chatgpt.com",
      "chat.openai.com",
      "perplexity.ai",
      "copilot.microsoft.com",
      "grok.com",
      "chat.deepseek.com",
      "chat.mistral.ai",
      "poe.com",
      "kimi.com",
      "chat.qwen.ai",
      "notion.so",
    ],
  },
  {
    id: "sectioned",
    label: "Sectioned",
    note: "Gemini and everything else — plain headers with an explicit contract.",
    hosts: ["gemini.google.com", "aistudio.google.com", "meta.ai"],

  },
];

export function dialectForHost(hostname: string | undefined | null): Dialect {
  const h = (hostname ?? "").toLowerCase();
  for (const d of DIALECTS) {
    if (d.hosts.some((x) => h === x || h.endsWith("." + x))) return d.id;
  }
  return "markdown";
}

export function getDialect(id: string | undefined | null): DialectSpec {
  return DIALECTS.find((d) => d.id === id) ?? DIALECTS[1]!;
}

/* -------------------------------------------------------------------- intent */

export type Intent = "question" | "build" | "write" | "analyse" | "transform" | "decide";
export type Complexity = "trivial" | "standard" | "deep";
export type Intensity = "light" | "standard" | "surgical";

export const INTENSITIES: { id: Intensity; label: string; note: string }[] = [
  { id: "light", label: "Light", note: "Sharpen the wording. Nothing added." },
  { id: "standard", label: "Standard", note: "Role, context, task, output contract." },
  { id: "surgical", label: "Surgical", note: "Adds success criteria, edge cases and a self-check." },
];

const INTENT_RULES: { intent: Intent; re: RegExp }[] = [
  { intent: "build", re: /\b(build|code|implement|api|schema|function|component|deploy|refactor|debug|architect)\b/i },
  { intent: "write", re: /\b(write|draft|copy|email|post|blog|headline|caption|tagline|script|prd|spec)\b/i },
  { intent: "analyse", re: /\b(analy[sz]e|compare|evaluate|review|audit|breakdown|forecast|estimate|why does)\b/i },
  { intent: "transform", re: /\b(rewrite|summari[sz]e|translate|convert|shorten|reformat|clean up|tidy)\b/i },
  { intent: "decide", re: /\b(should i|which|choose|decide|recommend|worth it|better option|vs\.?)\b/i },
  { intent: "question", re: /^(what|who|when|where|how many|how much|is|are|does|do|can)\b|\?\s*$/i },
];

export function classifyLocal(rawInput: string): { intent: Intent; complexity: Complexity } {
  const text = stripTrigger(rawInput);
  const words = text.split(/\s+/).filter(Boolean).length;

  let intent: Intent = "question";
  for (const rule of INTENT_RULES) {
    if (rule.re.test(text)) {
      intent = rule.intent;
      break;
    }
  }

  const complexity: Complexity =
    words <= 6 && (intent === "question" || intent === "transform")
      ? "trivial"
      : words > 40 || intent === "build" || intent === "analyse"
        ? "deep"
        : "standard";

  return { intent, complexity };
}

export function stripTrigger(rawInput: string): string {
  return String(rawInput ?? "")
    .replace(/\/\/\s*$/, "")
    .trim();
}

/* ------------------------------------------------------------------- compile */

export interface PromptBlocks {
  role?: string;
  context?: string;
  task: string;
  questionsFirst?: string;
  successCriterion?: string;
  outputContract?: string;
  constraints?: string[];
  selfCheck?: string;
}

interface Section {
  key: string;
  title: string;
  body: string;
}

function sectionsFor(blocks: PromptBlocks): Section[] {
  const out: Section[] = [];
  const push = (key: string, title: string, body?: string) => {
    if (body && body.trim()) out.push({ key, title, body: body.trim() });
  };
  push("role", "Role", blocks.role);
  push("context", "Context", blocks.context);
  push("task", "Task", blocks.task);
  push("questions_first", "Questions to ask me first", blocks.questionsFirst);
  push("success_criteria", "Success criteria", blocks.successCriterion);
  push("output_format", "Output format", blocks.outputContract);
  if (blocks.constraints?.length) {
    out.push({
      key: "constraints",
      title: "Constraints",
      body: blocks.constraints.map((c) => `- ${c}`).join("\n"),
    });
  }
  push("verify", "Before answering", blocks.selfCheck);
  return out;
}


export function renderPrompt(blocks: PromptBlocks, dialect: Dialect): string {
  const sections = sectionsFor(blocks);
  if (sections.length === 1 && sections[0]!.key === "task") return sections[0]!.body;

  if (dialect === "xml") {
    return sections
      .map((s) => `<${s.key}>\n${indent(s.body)}\n</${s.key}>`)
      .join("\n\n");
  }
  if (dialect === "markdown") {
    return sections.map((s) => `## ${s.title}\n${s.body}`).join("\n\n");
  }
  return sections.map((s) => `${s.title.toUpperCase()}\n${s.body}`).join("\n\n");
}

function indent(body: string): string {
  return body
    .split("\n")
    .map((l) => (l.trim() ? "  " + l : l))
    .join("\n");
}

/**
 * Deterministic, zero-network scaffold. Renders in under a millisecond so the
 * user never stares at an empty box while the model works. Deliberately
 * restrained: a trivial input stays one line.
 */
export function localScaffold(
  rawInput: string,
  opts?: { persona?: string | undefined; dialect?: Dialect | undefined; intensity?: Intensity | undefined },
): string {
  const text = stripTrigger(rawInput);
  if (!text) return "";
  const { intent, complexity } = classifyLocal(text);
  const intensity = opts?.intensity ?? "standard";
  const dialect = opts?.dialect ?? "markdown";
  const persona = getPersona(opts?.persona);

  if (complexity === "trivial" || intensity === "light") {
    return text.endsWith("?") || intent === "question"
      ? `${text}\n\nAnswer directly and concisely. State it plainly; skip preamble.`
      : `${text}\n\nBe specific and dense. No preamble, no filler.`;
  }

  const blocks: PromptBlocks = {
    role: `You are ${persona.role}.`,
    context:
      "Infer the situation from the request below. Where a decisive detail is missing, state the assumption you are making rather than inventing a requirement.",
    task: text,
    questionsFirst:
      "Before you start, ask me up to 3 questions whose answers would genuinely change what you produce — numbered, in one message — and wait for my reply. If I skip a question, state the assumption you are making and carry on.",
    constraints: persona.constraints.slice(),
    outputContract: INTENT_CONTRACT[intent],
  };


  if (intensity === "surgical") {
    blocks.successCriterion =
      "The answer is complete when every part of the task is addressed, every assumption is labelled, and nothing is padded.";
    blocks.selfCheck =
      "Check that no fact, number or name has been invented, and that the output matches the requested format exactly.";
  }

  return renderPrompt(blocks, dialect);
}

const INTENT_CONTRACT: Record<Intent, string> = {
  question: "A direct answer first, then only the detail that changes the answer.",
  build: "1) Approach in two sentences. 2) Implementation, with working code. 3) Failure modes and how to test them.",
  write: "The finished copy only, ready to use. Offer alternates only where a choice genuinely matters.",
  analyse: "1) Conclusion. 2) Evidence as a table. 3) What would change the conclusion.",
  transform: "The transformed text only. No commentary on what changed unless asked.",
  decide: "1) The recommendation. 2) The trade-off in a table. 3) The condition under which the other option wins.",
};

/* ---------------------------------------------------------------- meta-prompt */

export const META_DELIMITER = "===PATKAN_META===";

/** Reading-research ceiling: past ~1,500 characters a prompt stops being read. */
export const PROMPT_TARGET_CHARS = 1500;
export const PROMPT_HARD_CAP_CHARS = 2000;
export const PROMPT_QUICK_CAP_CHARS = 1200;

export function buildMetaSystemPrompt(dialect: Dialect): string {
  const formatRule =
    dialect === "xml"
      ? `Wrap each section in lowercase XML tags chosen from: <role>, <context>, <task>, <questions_first>, <success_criteria>, <output_format>, <constraints>, <verify>. Claude respects tag boundaries; use them.`
      : dialect === "markdown"
        ? `Use "## " Markdown headings chosen from: Role, Context, Task, Questions to ask me first, Success criteria, Output format, Constraints, Before answering.`
        : `Use bare uppercase section headers on their own line, chosen from: ROLE, CONTEXT, TASK, QUESTIONS TO ASK ME FIRST, SUCCESS CRITERIA, OUTPUT FORMAT, CONSTRAINTS, BEFORE ANSWERING.`;

  return `You are Patkan, a prompt compiler. You rewrite a user's rough input into the prompt an expert would have written. You never answer the request itself.

FORMAT
${formatRule}

QUESTIONS — mandatory, never omit this section
- The questions section always appears, directly after the task.
- Its body must instruct the answerer: ask these questions first, in one numbered message, and wait for the reply; if the user skips a question, state the assumption being made and continue anyway.
- At most 3 questions. Only questions whose answer would genuinely change the output — never administrative or polite filler.
- Write them in plain language a non-technical professional understands.

LENGTH — this is a hard contract
- The rewritten prompt must be under ${PROMPT_TARGET_CHARS} characters, and never above ${PROMPT_HARD_CAP_CHARS}. A prompt nobody reads is a failed prompt.
- Get there by cutting sections and words, never by dropping a detail the user gave or the questions section.

JUDGEMENT — this matters more than the format
- Use only the sections the task actually needs. A factual question needs a sharpened sentence plus its questions section, not a spec. Padding a small ask is a failure.
- Length must be proportional to the input's real complexity.
- Preserve every concrete detail from the input: names, numbers, platforms, tools, deadlines. Never drop one, never invent one.
- Where a decisive detail is missing, either ask it in the questions section or instruct the answerer to state an assumption. Do not fabricate the detail.
- Prefer a measurable success criterion ("done when X") over vague quality words.
- Give an explicit output contract: exact shape, order and length of the answer.
- Constraints must include negative space: what to exclude, what not to assume.
- Never instruct step-by-step reasoning for a simple lookup.
- Plain, everyday language throughout. The reader may be a designer, a lawyer or a shop owner, not an engineer.

OUTPUT
Return the rewritten prompt only — no preamble, no explanation, no code fences.
Then, on its own line, print ${META_DELIMITER} followed by a single minified JSON object:
{"assumptions":["short phrase", ...],"clarifiers":[{"label":"3-5 word chip","refinement":"one sentence to add to the prompt if tapped"}]}
- assumptions: at most 3 short phrases naming what you inferred (audience, format, scope).
- clarifiers: at most 3, only for details that would genuinely change the answer. Empty array if none.
- Nothing after the JSON.`;
}


export function buildMetaUserMessage(
  rawInput: string,
  persona: Persona,
  opts: {
    intensity?: Intensity | undefined;
    intent?: Intent | undefined;
    complexity?: Complexity | undefined;
    customInstruction?: string | null | undefined;
    refinement?: string | null | undefined;
  } = {},
): string {
  const clean = stripTrigger(rawInput);
  const intensity = opts.intensity ?? "standard";
  const intensityRule =
    intensity === "light"
      ? `INTENSITY: light. Keep the whole prompt under ${PROMPT_QUICK_CAP_CHARS} characters. Sharpen the wording, keep the questions section (2 questions maximum) and an output contract. Do not add role, success criteria or a self-check.`
      : intensity === "surgical"
        ? `INTENSITY: surgical. Keep the whole prompt under ${PROMPT_TARGET_CHARS} characters. Include the questions section, a measurable success criterion, edge cases, and a short verification clause.`
        : `INTENSITY: standard. Keep the whole prompt under ${PROMPT_TARGET_CHARS} characters. Role, context, task, the questions section and an output contract. Skip the self-check.`;


  const parts = [
    intensityRule,
    opts.intent ? `Detected intent: ${opts.intent} (${opts.complexity ?? "standard"} complexity). Override this if the input says otherwise.` : "",
    persona.id === "auto"
      ? "Persona: infer the right expert from the task."
      : `Persona: ${persona.label} — ${persona.role}. Fold in these baselines naturally:\n${persona.constraints.map((c) => `- ${c}`).join("\n")}`,
    opts.customInstruction?.trim()
      ? `The user saved this framework and wants it applied:\n${opts.customInstruction.trim()}`
      : "",
    opts.refinement?.trim() ? `Additional detail the user just supplied: ${opts.refinement.trim()}` : "",
    `User's raw input:\n"""\n${clean}\n"""`,
  ];

  return parts.filter(Boolean).join("\n\n");
}

/** Splits a completed model response into the prompt and its metadata. */
export function splitMeta(raw: string): {
  prompt: string;
  assumptions: string[];
  clarifiers: { label: string; refinement: string }[];
} {
  const idx = raw.indexOf(META_DELIMITER);
  const promptPart = (idx === -1 ? raw : raw.slice(0, idx))
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/```\s*$/, "")
    .trim();
  let assumptions: string[] = [];
  let clarifiers: { label: string; refinement: string }[] = [];
  if (idx !== -1) {
    const tail = raw.slice(idx + META_DELIMITER.length).trim().replace(/^```[a-z]*\n?/i, "").replace(/```\s*$/, "");
    try {
      const parsed = JSON.parse(tail) as {
        assumptions?: unknown;
        clarifiers?: unknown;
      };
      if (Array.isArray(parsed.assumptions)) {
        assumptions = parsed.assumptions.filter((a): a is string => typeof a === "string").slice(0, 3);
      }
      if (Array.isArray(parsed.clarifiers)) {
        clarifiers = parsed.clarifiers
          .filter(
            (c): c is { label: string; refinement: string } =>
              !!c && typeof (c as { label?: unknown }).label === "string" &&
              typeof (c as { refinement?: unknown }).refinement === "string",
          )
          .slice(0, 3);
      }
    } catch {
      /* metadata is best-effort; the prompt is what matters */
    }
  }
  return { prompt: promptPart, assumptions, clarifiers };
}

/** Streaming helper: everything before the delimiter is displayable prompt. */
export function visiblePrompt(streamed: string): string {
  const idx = streamed.indexOf(META_DELIMITER);
  const head = idx === -1 ? streamed : streamed.slice(0, idx);
  // Hide a partially-arrived delimiter so it never flickers on screen.
  return head.replace(/=+P?A?T?K?A?N?_?M?E?T?A?=*\s*$/, "").replace(/^```[a-z]*\n?/i, "");
}

/** Ghost (device-only) daily allowance. */
export const DAILY_FREE_LIMIT = 10;
/** Signed-in daily allowance — the reason to create an account. */
export const DAILY_SIGNED_IN_LIMIT = 50;
export function dailyLimitFor(signedIn: boolean): number {
  return signedIn ? DAILY_SIGNED_IN_LIMIT : DAILY_FREE_LIMIT;
}
export const MAX_INPUT_CHARS = 4000;

