import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Sparkles, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { trackEvent } from "@/lib/telemetry";
import {
  DAILY_FREE_LIMIT,
  DAILY_SIGNED_IN_LIMIT,
  type Dialect,
  type Intensity,
  localScaffold,
} from "@/lib/patkan-core";
import { streamTransform, type EngineId } from "@/lib/patkan-stream";
import { useAuth } from "@/hooks/useAuth";
import patkanMark from "@/assets/patkan-mark.svg";

export const Route = createFileRoute("/playgroundv2")({
  head: () => ({
    meta: [
      { title: "Playground — Patkan" },
      {
        name: "description",
        content: "Turn a rough thought into a surgically crafted prompt.",
      },
      { property: "og:title", content: "Playground — Patkan" },
      {
        property: "og:description",
        content: "Turn a rough thought into a surgically crafted prompt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlaygroundV2Page,
});

function deviceId() {
  const key = "patkan_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

type Phase = "idle" | "drafting" | "sharpening" | "ready";

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Compiled prompt",
  drafting: "Drafting…",
  sharpening: "Sharpening this…",
  ready: "Ready",
};

const shell = "mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8";

// Ordered by real-world usage scale, biggest first.
const targetAis = [
  ["ChatGPT", "markdown", "OpenAI ChatGPT — structured markdown with headings"],
  ["Gemini", "sectioned", "Google Gemini — sectioned format with clear prompt boundaries"],
  ["Claude", "xml", "Anthropic Claude — XML tags for prompt boundaries"],
  ["Microsoft Copilot", "markdown", "Microsoft Copilot — structured reasoning with markdown"],
  ["Perplexity", "markdown", "Perplexity — structured markdown with headings"],
  ["DeepSeek", "markdown", "DeepSeek — structured markdown with headings"],
  ["Grok", "markdown", "Grok — structured markdown with headings"],
  ["Meta AI", "sectioned", "Meta AI — sectioned format with clear prompt boundaries"],
  ["Mistral", "markdown", "Mistral — structured markdown with headings"],
  ["Poe", "markdown", "Poe — structured markdown with headings"],
  ["Notion AI", "markdown", "Notion AI — structured markdown with headings"],
  ["Qwen", "markdown", "Qwen — structured markdown with headings"],
  ["Kimi", "markdown", "Kimi — structured markdown with headings"],
] as const;

/** Everyday tasks that warm the visitor up instead of a blank box. */
const GHOST_TASKS = [
  "Draft a 1-page PRD for our new user onboarding flow",
  "Write 3 microcopy options for an empty checkout screen",
  "Rewrite an error message to sound friendly and under 60 characters",
  "Outline a 3-email nurture sequence for inbound demo leads",
  "Turn bullet notes from a team call into a 600-word blog draft",
  "Group 25 competitor keywords into 4 core search intent clusters",
  "Turn this case study into a 5-slide LinkedIn carousel script",
  "Write a cold outbound email to a VP of Operations about our demo",
  "Draft an agenda for a renewal meeting with a quiet client",
  "Write a polite reply declining a refund outside our 30-day policy",
  "Write a punchy job post for a Senior Operations Lead",
  "Draft an announcement explaining our updated remote work guidelines",
  "Create a 5-question quiz on workplace cybersecurity",
  "Draft a mutual non-disclosure agreement for a prospective vendor",
  "Prepare a chronological summary of facts from these witness notes",
  "Explain tax deductions under Section 80C in plain, simple terms",
  "Write a 3-bullet commentary on our Q3 marketing budget variance",
  "Summarize key headwinds and margin trends from this earnings report",
  "Structure a 4-part hypothesis deck framework for market entry",
  "Turn rough updates from 5 teams into a weekly executive summary",
  "Write a standard operating procedure for vendor onboarding",
  "Draft a polite response declining a speaking invite for the CEO",
  "Create a 45-minute lesson plan on photosynthesis for 8th graders",
  "Suggest 5 sharp, curiosity-driven headlines for an interview article",
  "Draft a press release announcing our new regional partnership",
  "Write a friendly WhatsApp reply confirming a custom order date",
  "Write a listing description for a 3-bedroom apartment",
  "Draft an email comparing term insurance vs endowment plans",
  "Draft a discharge note explaining home medication instructions",
  "Draft a 200-word problem statement for an education grant proposal",
] as const;

/** Types a task out, holds it, erases it, moves on. Pauses the moment it is not needed. */
function useGhostTyping(active: boolean) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!active) {
      setText("");
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let taskIndex = Math.floor(Math.random() * GHOST_TASKS.length);
    let charIndex = 0;
    let erasing = false;

    const tick = () => {
      if (cancelled) return;
      const task = GHOST_TASKS[taskIndex]!;
      if (!erasing) {
        charIndex += 1;
        setText(task.slice(0, charIndex));
        if (charIndex >= task.length) {
          erasing = true;
          timer = setTimeout(tick, 2200);
          return;
        }
        timer = setTimeout(tick, 38);
      } else {
        charIndex -= 6;
        if (charIndex <= 0) {
          charIndex = 0;
          erasing = false;
          taskIndex = (taskIndex + 1) % GHOST_TASKS.length;
          setText("");
          timer = setTimeout(tick, 400);
          return;
        }
        setText(task.slice(0, charIndex));
        timer = setTimeout(tick, 18);
      }
    };

    timer = setTimeout(tick, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active]);

  return text;
}

/**
 * The 30 non-tech professions Patkan is built for. Third value is an extra
 * role instruction for professions without a dedicated engine persona
 * ("" = the mapped persona's own treatment is enough).
 */
const PROFESSIONS: PersonaOption[] = [
  ["Chartered Accountant", "auto", "Write as a chartered accountant."],
  ["Content Writer", "auto", "Write as a professional content writer."],
  ["Corporate Lawyer", "auto", "Write as a corporate lawyer."],
  ["Customer Success Manager", "auto", "Write as a customer success manager."],
  ["Customer Support Agent", "auto", "Write as a customer support agent."],
  ["Doctor", "auto", "Write as a doctor."],
  ["Equity Research Analyst", "analyst", ""],
  ["Executive Assistant", "auto", "Write as an executive assistant."],
  ["Financial Analyst", "analyst", ""],
  ["HR Business Partner", "auto", "Write as an HR business partner."],
  ["Insurance Advisor", "auto", "Write as an insurance advisor."],
  ["Journalist", "auto", "Write as a journalist."],
  ["Learning & Development Specialist", "auto", "Write as a learning and development specialist."],
  ["Litigation Advocate", "auto", "Write as a practising litigation advocate."],
  ["Management Consultant", "auto", "Write as a management consultant."],
  ["Marketing", "marketer", ""],
  ["Non-profit Grant Writer", "auto", "Write as a non-profit grant writer."],
  ["Operations Manager", "auto", "Write as an operations manager."],
  ["PR Manager", "auto", "Write as a public relations manager."],
  ["Product Manager", "product-manager", ""],
  ["Project Manager", "auto", "Write as a project manager."],
  ["Real Estate Agent", "auto", "Write as a real estate agent."],
  ["Recruiter", "auto", "Write as a talent recruiter."],
  ["Sales Representative", "auto", "Write as an experienced B2B sales representative."],
  ["SEO Specialist", "auto", "Write as an experienced SEO specialist."],
  ["Small Business Owner", "auto", "Write as a small business owner."],
  ["Social Media Manager", "auto", "Write as a social media manager."],
  ["Teacher", "auto", "Write as an experienced teacher."],
  ["UX / Product Designer", "auto", "Write as a senior UX/product designer."],
  ["UX Writer", "ux-writer", ""],
];

type PersonaOption = readonly [string, string, string];
const MARKETER_INDEX = PROFESSIONS.findIndex(([name]) => name === "Marketing");

function PlaygroundV2Page() {
  const { session } = useAuth();

  const [input, setInput] = useState("");
  const [targetIndex, setTargetIndex] = useState(0);
  const [personaIndex, setPersonaIndex] = useState(MARKETER_INDEX);
  const [output, setOutput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [engine, setEngine] = useState<EngineId>("local");
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [clarifiers, setClarifiers] = useState<{ label: string; refinement: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [customPersonas, setCustomPersonas] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputStarted = useRef(false);
  const outRef = useRef<HTMLPreElement>(null);

  const personaList: PersonaOption[] = [
    ...PROFESSIONS,
    ...customPersonas.map((name) => [name, "auto", `Write as ${name}.`] as PersonaOption),
  ];

  const target = targetAis[targetIndex]!;
  const persona = personaList[personaIndex] ?? personaList[MARKETER_INDEX]!;
  const dialect = target[1] as Dialect;
  const personaId = persona[1];
  const customInstruction = persona[2] || null;
  const intensity: Intensity = "standard";

  function addCustomPersona(name: string) {
    const clean = name.trim().slice(0, 40);
    if (!clean) return;
    const existing = customPersonas.indexOf(clean);
    if (existing >= 0) {
      setPersonaIndex(PROFESSIONS.length + existing);
      return;
    }
    setCustomPersonas([...customPersonas, clean]);
    setPersonaIndex(PROFESSIONS.length + customPersonas.length);
  }

  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = `${Math.max(el.scrollHeight, 96)}px`;
    }
  }, [input]);

  // The allowance shown on load must be the real one, not an optimistic 10.
  useEffect(() => {
    let cancelled = false;
    const token = session?.access_token;
    fetch(`/api/public/usage?deviceId=${encodeURIComponent(deviceId())}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { used?: number; limit?: number } | null) => {
        if (cancelled || !data || typeof data.used !== "number" || typeof data.limit !== "number") return;
        setUsage({ used: data.used, limit: data.limit });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  async function transform(refinement?: string) {
    if (!input.trim() || busy) return;
    setBusy(true);
    setPhase("drafting");
    setAssumptions([]);
    setClarifiers([]);
    setOutput(localScaffold(input, { persona: personaId, dialect, intensity }));
    try {
      const result = await streamTransform(
        {
          text: input,
          persona: personaId,
          dialect,
          intensity,
          deviceId: deviceId(),
          accessToken: session?.access_token,
          refinement: refinement ?? null,
          customInstruction,
          surface: "web",
        },
        (visible) => {
          setPhase("sharpening");
          setOutput(visible);
        },
      );
      setOutput(result.prompt);
      trackEvent("playground_compiled", { meta: { engine: result.engine } });
      setEngine(result.engine);
      setPhase("ready");
      setAssumptions(result.assumptions);
      setClarifiers(result.clarifiers);
      if (typeof result.used === "number" && typeof result.limit === "number") {
        setUsage({ used: result.used, limit: result.limit });
      }
    } catch (err) {
      setPhase("ready");
      setEngine("local");
      toast.error(err instanceof Error ? err.message : "Transform failed.");
    } finally {
      setBusy(false);
    }
  }

  /**
   * Quality signal. A copy is the strongest "this was good" a visitor gives us;
   * the thumbs-down is the only way a bad compile becomes visible at all.
   */
  function rate(accepted: boolean) {
    void fetch("/api/public/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ deviceId: deviceId(), accepted }),
      keepalive: true,
    }).catch(() => {});
  }

  async function copy() {
    if (!output) return;
    trackEvent("playground_copied");
    rate(true);
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const limit = usage?.limit ?? (session ? DAILY_SIGNED_IN_LIMIT : DAILY_FREE_LIMIT);
  const used = usage?.used ?? 0;
  const remaining = Math.max(0, limit - used);
  const exhausted = used >= limit;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        {/* Playground */}
        <section id="playground" data-section="playground" className="scroll-mt-16 border-y bg-card py-16 sm:py-20 md:py-28">
          <div className={shell}>
            <Playground
              input={input}
              setInput={(value: string) => {
                if (!inputStarted.current && value.trim()) {
                  inputStarted.current = true;
                  trackEvent("playground_input_started");
                }
                setInput(value);
              }}
              targetIndex={targetIndex}
              setTargetIndex={setTargetIndex}
              personaIndex={personaIndex}
              setPersonaIndex={setPersonaIndex}
              output={output}
              phase={phase}
              engine={engine}
              assumptions={assumptions}
              clarifiers={clarifiers}
              busy={busy}
              copied={copied}
              copy={copy}
              rate={rate}
              transform={transform}
              personaList={personaList}
              addCustomPersona={addCustomPersona}
              remaining={remaining}
              exhausted={exhausted}
              session={!!session}
              textareaRef={textareaRef}
              outRef={outRef}
            />
          </div>
        </section>
      </main>
    </div>
  );
}


interface PlaygroundProps {
  input: string;
  setInput: (v: string) => void;
  targetIndex: number;
  setTargetIndex: (i: number) => void;
  personaIndex: number;
  setPersonaIndex: (i: number) => void;
  personaList: PersonaOption[];
  addCustomPersona: (name: string) => void;
  output: string;
  phase: Phase;
  engine: EngineId;
  assumptions: string[];
  clarifiers: { label: string; refinement: string }[];
  busy: boolean;
  copied: boolean;
  copy: () => void;
  rate: (accepted: boolean) => void;
  transform: (refinement?: string) => void;
  remaining: number;
  exhausted: boolean;
  session: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  outRef: React.RefObject<HTMLPreElement | null>;
}

function Playground(props: PlaygroundProps) {
  const {
    input,
    setInput,
    targetIndex,
    setTargetIndex,
    personaIndex,
    setPersonaIndex,
    personaList,
    addCustomPersona,
    output,
    phase,
    engine,
    assumptions,
    clarifiers,
    busy,
    copied,
    copy,
    transform,
    remaining,
    exhausted,
    session,
    textareaRef,
    outRef,
  } = props;

  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const target = targetAis[targetIndex]!;
  const persona = personaList[personaIndex] ?? personaList[MARKETER_INDEX]!;
  const settled = phase === "ready" || phase === "idle";
  const ghost = useGhostTyping(!input && !busy && !exhausted);

  return (
    <div>
      <div className="mx-auto mb-8 max-w-xl text-center sm:mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Playground</p>
      </div>
      <div className="relative flex flex-col lg:grid lg:grid-cols-[5fr_6fr] lg:gap-px lg:overflow-hidden lg:rounded-lg lg:border lg:bg-border lg:shadow-sm">
        {/* Input card */}
        <div className="rounded-lg border bg-background p-5 shadow-sm sm:p-7 lg:rounded-none lg:border-0 lg:pr-16 lg:shadow-none">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold tracking-wider">YOUR THOUGHTS</span>
            <span className="shrink-0 text-muted-foreground">
              {session
                ? exhausted
                  ? "0 left today"
                  : `${remaining} left today`
                : exhausted
                  ? "0 transforms left — sign in to keep going"
                  : `${remaining} more transforms, before you need to sign-in`}
            </span>
          </div>

          {exhausted ? (
            <div className="mt-5 min-h-24 border-b border-dashed pb-6 sm:min-h-28">
              <p className="text-sm text-muted-foreground">
                Daily limit reached.{" "}
                <Link to="/auth" className="text-primary underline underline-offset-4">
                  Sign in
                </Link>{" "}
                to keep going.
              </p>
            </div>
          ) : (
            <div className="relative mt-5 min-h-24 border-b border-dashed pb-6 sm:min-h-28">
              {!input && (
                <p
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 font-sans text-base text-muted-foreground sm:text-lg"
                >
                  {ghost || "I want to.."}
                  <span className="ml-0.5 inline-block w-px animate-pulse border-l border-muted-foreground align-middle text-transparent">
                    .
                  </span>
                </p>
              )}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                className="relative w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-sans text-base text-foreground focus:outline-none focus:ring-0 sm:text-lg"
                disabled={busy}
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-start gap-x-12 gap-y-4">
            <div>
              <p className="font-mono text-[11px] tracking-widest text-muted-foreground">TARGET AI</p>
              <div className="mt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      {target[0]}
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
                    {targetAis.map(([name], index) => (
                      <DropdownMenuItem key={name} onSelect={() => setTargetIndex(index)}>
                        {name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest text-muted-foreground">SELECT ROLE</p>
              <div className="mt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      {persona[0]}
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
                    {personaList.map(([name], index) => (
                      <DropdownMenuItem key={name} onSelect={() => setPersonaIndex(index)}>
                        {name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem onSelect={() => setCustomOpen(true)}>Other</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {customOpen && (
            <form
              className="mt-4 flex max-w-sm gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addCustomPersona(customDraft);
                setCustomDraft("");
                setCustomOpen(false);
              }}
            >
              <input
                value={customDraft}
                onChange={(e) => setCustomDraft(e.target.value)}
                placeholder="Name your persona"
                maxLength={40}
                className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="h-9 shrink-0 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Add
              </button>
            </form>
          )}

          {/* Mobile CTA */}
          <button
            onClick={() => transform()}
            disabled={busy || !input.trim() || exhausted}
            className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 lg:hidden"
          >
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
            {busy ? "Patkan it…" : "Patkan it"}
          </button>
        </div>

        {/* Mobile connector */}
        <div className="flex flex-col items-center py-1 lg:hidden" aria-hidden>
          <span className="h-4 w-px bg-border" />
          <img src={patkanMark} alt="" width={816} height={816} className="my-1 size-8 rounded-[0.55rem] shadow-sm" />
          <span className="h-4 w-px bg-border" />
        </div>

        {/* Output card */}
        <div className="flex flex-col rounded-lg border bg-muted/40 p-5 shadow-sm sm:p-7 lg:rounded-none lg:border-0 lg:pl-16 lg:shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider">
                {settled ? "UPGRADED PROMPT" : PHASE_LABEL[phase].toUpperCase()}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                Ready to paste into {target[0]}
              </p>
            </div>
            <button
              onClick={copy}
              disabled={!output || !settled}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              {copied ? <Check className="size-4" aria-hidden /> : <CopyIcon className="size-4" aria-hidden />}
              {copied ? "Copied" : "Copy Prompt"}
            </button>
          </div>
          <div className="relative mt-4 overflow-hidden rounded-md border bg-background">
            <pre
              ref={outRef}
              aria-busy={!settled}
              className={`max-h-72 space-y-2.5 overflow-auto p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words sm:max-h-96 sm:p-5 sm:text-xs ${
                settled ? "text-foreground/90 opacity-100" : "text-foreground/70 opacity-60"
              }`}
            >
              {output ? (
                <PromptOutput text={output} dialect={target[1] as Dialect} />
              ) : (
                <EmptySkeleton />
              )}
            </pre>
            {output && (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent"
                aria-hidden
              />
            )}
          </div>

          {assumptions.length > 0 && (
            <div className="mt-5 border-l-2 border-primary/60 pl-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                <strong className="font-mono text-[11px] tracking-wide text-foreground">Assumed:</strong>{" "}
                {assumptions.join(" · ")}
              </p>
            </div>
          )}

          {clarifiers.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 lg:mt-auto lg:pt-5">
              {clarifiers.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  disabled={busy || exhausted}
                  onClick={() => transform(c.refinement)}
                  className="rounded-full border border-dashed px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50"
                >
                  + {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop bridge */}
        <button
          onClick={() => transform()}
          disabled={busy || !input.trim() || exhausted}
          className="absolute top-1/2 left-[45.45%] hidden h-11 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium whitespace-nowrap text-primary-foreground shadow-lg ring-[6px] ring-background transition-colors hover:bg-primary/90 disabled:opacity-50 lg:inline-flex"
        >
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
          {busy ? "Patkan it…" : "Patkan it"}
        </button>
      </div>
    </div>
  );
}

function PromptOutput({ text, dialect }: { text: string; dialect: Dialect }) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        const isAccent = accentLine(line, dialect);
        return (
          <p key={i} className={isAccent ? "text-primary" : "text-foreground/90"}>
            {line || "\u00A0"}
          </p>
        );
      })}
    </>
  );
}

function accentLine(line: string, dialect: Dialect): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (dialect === "xml") {
    return /^<\/?[a-z_][a-z0-9_]*>$/i.test(trimmed);
  }
  if (dialect === "markdown") {
    return /^#{2,6}\s+/.test(trimmed);
  }
  return /^[A-Z][A-Z\s]{2,}$/.test(trimmed);
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
