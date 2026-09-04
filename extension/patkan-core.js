// Shared Patkan engine. Mirrors src/lib/patkan-core.ts on the web side.
// Kept dependency-free so it can be loaded as a plain ES module.

export const PERSONAS = [
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

export function getPersona(id) {
  return PERSONAS.find((p) => p.id === id) || PERSONAS[0];
}

export const DIALECTS = [
  { id: "xml", label: "XML", hosts: ["claude.ai"] },
  {
    id: "markdown",
    label: "Markdown",
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
    hosts: ["gemini.google.com", "aistudio.google.com", "meta.ai"],
  },
];


export function dialectForHost(hostname) {
  const h = String(hostname || "").toLowerCase();
  for (const d of DIALECTS) {
    if (d.hosts.some((x) => h === x || h.endsWith("." + x))) return d.id;
  }
  return "markdown";
}

export const INTENSITIES = [
  { id: "light", label: "Light" },
  { id: "standard", label: "Standard" },
  { id: "surgical", label: "Surgical" },
];

export function stripTrigger(raw) {
  return String(raw || "")
    .replace(/\/\/\s*$/, "")
    .trim();
}

const INTENT_RULES = [
  { intent: "build", re: /\b(build|code|implement|api|schema|function|component|deploy|refactor|debug|architect)\b/i },
  { intent: "write", re: /\b(write|draft|copy|email|post|blog|headline|caption|tagline|script|prd|spec)\b/i },
  { intent: "analyse", re: /\b(analy[sz]e|compare|evaluate|review|audit|breakdown|forecast|estimate|why does)\b/i },
  { intent: "transform", re: /\b(rewrite|summari[sz]e|translate|convert|shorten|reformat|clean up|tidy)\b/i },
  { intent: "decide", re: /\b(should i|which|choose|decide|recommend|worth it|better option|vs\.?)\b/i },
  { intent: "question", re: /^(what|who|when|where|how many|how much|is|are|does|do|can)\b|\?\s*$/i },
];

export function classifyLocal(raw) {
  const text = stripTrigger(raw);
  const words = text.split(/\s+/).filter(Boolean).length;
  let intent = "question";
  for (const rule of INTENT_RULES) {
    if (rule.re.test(text)) {
      intent = rule.intent;
      break;
    }
  }
  const complexity =
    words <= 6 && (intent === "question" || intent === "transform")
      ? "trivial"
      : words > 40 || intent === "build" || intent === "analyse"
        ? "deep"
        : "standard";
  return { intent, complexity };
}

const INTENT_CONTRACT = {
  question: "A direct answer first, then only the detail that changes the answer.",
  build: "1) Approach in two sentences. 2) Implementation, with working code. 3) Failure modes and how to test them.",
  write: "The finished copy only, ready to use. Offer alternates only where a choice genuinely matters.",
  analyse: "1) Conclusion. 2) Evidence as a table. 3) What would change the conclusion.",
  transform: "The transformed text only. No commentary on what changed unless asked.",
  decide: "1) The recommendation. 2) The trade-off in a table. 3) The condition under which the other option wins.",
};

function renderPrompt(sections, dialect) {
  if (dialect === "xml") {
    return sections
      .map((s) => `<${s.key}>\n${s.body.split("\n").map((l) => (l.trim() ? "  " + l : l)).join("\n")}\n</${s.key}>`)
      .join("\n\n");
  }
  if (dialect === "markdown") return sections.map((s) => `## ${s.title}\n${s.body}`).join("\n\n");
  return sections.map((s) => `${s.title.toUpperCase()}\n${s.body}`).join("\n\n");
}

export function localScaffold(raw, opts = {}) {
  const text = stripTrigger(raw);
  if (!text) return "";
  const { intent, complexity } = classifyLocal(text);
  const intensity = opts.intensity || "standard";
  const dialect = opts.dialect || "markdown";
  const persona = getPersona(opts.persona);

  if (complexity === "trivial" || intensity === "light") {
    return text.endsWith("?") || intent === "question"
      ? `${text}\n\nAnswer directly and concisely. State it plainly; skip preamble.`
      : `${text}\n\nBe specific and dense. No preamble, no filler.`;
  }

  const sections = [
    { key: "role", title: "Role", body: `You are ${persona.role}.` },
    {
      key: "context",
      title: "Context",
      body: "Infer the situation from the request below. Where a decisive detail is missing, state the assumption you are making rather than inventing a requirement.",
    },
    { key: "task", title: "Task", body: text },
  ];
  if (intensity === "surgical") {
    sections.push({
      key: "success_criteria",
      title: "Success criteria",
      body: "The answer is complete when every part of the task is addressed, every assumption is labelled, and nothing is padded.",
    });
  }
  sections.push({ key: "output_format", title: "Output format", body: INTENT_CONTRACT[intent] });
  sections.push({
    key: "constraints",
    title: "Constraints",
    body: persona.constraints.map((c) => `- ${c}`).join("\n"),
  });
  if (intensity === "surgical") {
    sections.push({
      key: "verify",
      title: "Before answering",
      body: "Check that no fact, number or name has been invented, and that the output matches the requested format exactly.",
    });
  }
  return renderPrompt(sections, dialect);
}

export const DEFAULT_API_BASE = "https://patkan.lovable.app";
export const DAILY_FREE_LIMIT = 10;
