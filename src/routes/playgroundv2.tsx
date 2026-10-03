import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, Check, ChevronDown, Copy, Loader2, RotateCcw } from "lucide-react";
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

const CWS_URL =
  "https://chromewebstore.google.com/detail/patkan-%E2%80%94-instant-expert-p/jcgkfecfliophjfnkokjnifcmalfbnnn";
const GHOST_SET = new Set<string>(GHOST_TASKS);

function PlaygroundV2Page() {
  const { session } = useAuth();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [targetIndex, setTargetIndex] = useState(0);
  const [personaIndex, setPersonaIndex] = useState(MARKETER_INDEX);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [mobile, setMobile] = useState(false);
  const [, setEngine] = useState<EngineId>("local");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputStarted = useRef(false);

  const target = targetAis[targetIndex]!;
  const persona = PROFESSIONS[personaIndex]!;
  const dialect = target[1] as Dialect;
  const intensity: Intensity = "standard";
  const limit = usage?.limit ?? (session ? DAILY_SIGNED_IN_LIMIT : DAILY_FREE_LIMIT);
  const exhausted = (usage?.used ?? 0) >= limit;
  const ghost = useGhostTyping(!input && !output && !busy);
  const ghostDone = GHOST_SET.has(ghost);

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 767px)").matches);
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
    }
  }, [input]);

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

  async function transform(text: string) {
    if (busy) return;
    if (exhausted) {
      toast.error("Daily limit reached. Sign in to keep going.");
      return;
    }
    setBusy(true);
    setPhase("drafting");
    setOutput(localScaffold(text, { persona: persona[1], dialect, intensity }));
    try {
      const result = await streamTransform(
        {
          text,
          persona: persona[1],
          dialect,
          intensity,
          deviceId: deviceId(),
          accessToken: session?.access_token,
          refinement: null,
          customInstruction: persona[2] || null,
          surface: "web",
        },
        (visible) => {
          setPhase("sharpening");
          setOutput(visible);
        },
      );
      setOutput(result.prompt);
      setEngine(result.engine);
      trackEvent("playground_compiled", { meta: { engine: result.engine } });
      if (typeof result.used === "number" && typeof result.limit === "number") {
        setUsage({ used: result.used, limit: result.limit });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transform failed.");
    } finally {
      setPhase("ready");
      setBusy(false);
    }
  }

  function onType(value: string) {
    if (!inputStarted.current && value.trim()) {
      inputStarted.current = true;
      trackEvent("playground_input_started");
    }
    const trimmed = value.trimEnd();
    if (trimmed.endsWith("//")) {
      const thought = trimmed.slice(0, -2).trim();
      if (thought.length >= 3) {
        setInput(thought);
        void transform(thought);
        return;
      }
    }
    setInput(value);
  }

  function reset() {
    if (busy) return;
    setInput("");
    setOutput("");
    setPhase("idle");
  }

  async function copy() {
    if (!output) return;
    trackEvent("playground_copied");
    void fetch("/api/public/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ deviceId: deviceId(), accepted: true }),
      keepalive: true,
    }).catch(() => {});
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function getExtension() {
    trackEvent("download_clicked", { meta: { surface: "playgroundv2" } });
    window.open(CWS_URL, "_blank", "noopener");
  }

  const pill =
    "inline-flex shrink-0 items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className={`${shell} py-14 sm:py-20`}>
        <section data-section="hero" className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Your Personal Prompt Engineer</p>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Stop writing prompts. Just end your sentence with <span className="font-mono text-primary">//</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Turn raw thoughts into structured prompts right inside ChatGPT, Claude, and Gemini — without switching tabs
            or learning prompt engineering.
          </p>
        </section>

        <section data-section="playground" className="mx-auto mt-10 max-w-3xl sm:mt-12">
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={pill}>
                  {target[0]} <ChevronDown className="size-4" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
                {targetAis.map(([name], i) => (
                  <DropdownMenuItem key={name} onSelect={() => setTargetIndex(i)}>
                    {name}
                    {i === targetIndex && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className={pill}>
                  {persona[0]} <ChevronDown className="size-4" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
                {PROFESSIONS.map(([name], i) => (
                  <DropdownMenuItem key={name} onSelect={() => setPersonaIndex(i)}>
                    {name}
                    {i === personaIndex && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="flex items-center justify-end gap-1 border-b px-3 py-2">
              {busy && <Loader2 className="mr-auto size-4 animate-spin text-primary" aria-label="Working" />}
              <button
                type="button"
                onClick={reset}
                disabled={busy}
                aria-label="Reset"
                title="Reset"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                type="button"
                onClick={copy}
                disabled={!output || busy}
                aria-label="Copy prompt"
                title="Copy prompt"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
              >
                {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
              </button>
            </div>

            <div className="relative p-5 sm:p-7">
              {output ? (
                <pre className="max-h-[28rem] min-h-[120px] overflow-y-auto whitespace-pre-wrap break-words font-sans text-sm leading-relaxed sm:text-base">
                  {output}
                </pre>
              ) : (
                <>
                  {!input && (
                    <p
                      aria-hidden
                      className="pointer-events-none absolute inset-x-5 top-5 text-base leading-relaxed text-muted-foreground sm:inset-x-7 sm:top-7 sm:text-lg"
                    >
                      {ghost}
                      {ghostDone && <span className="ml-1 font-mono font-bold text-primary">//</span>}
                    </p>
                  )}
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => onType(e.target.value)}
                    aria-label="Type your rough thought and end it with //"
                    className="block min-h-[120px] w-full resize-none bg-transparent text-base leading-relaxed outline-none sm:text-lg"
                  />
                </>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <button
              type="button"
              onClick={getExtension}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              <ArrowDownToLine className="size-4" aria-hidden /> {mobile ? "Add to Desktop" : "Add to Chrome"}
            </button>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Google Verified • Works across 14 AI assistants • No sign-up to start
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
