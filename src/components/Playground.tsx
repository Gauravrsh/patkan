import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Copy, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/lib/telemetry";
import { DAILY_FREE_LIMIT, DAILY_SIGNED_IN_LIMIT, MAX_INPUT_CHARS, localScaffold } from "@/lib/patkan-core";
import { streamTransform } from "@/lib/patkan-stream";

/** Shared // playground used on the homepage and the post-install welcome page. */
export const AIS = [
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


export const PROFESSIONS: PersonaOption[] = [
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

export type PersonaOption = readonly [string, string, string];
const MARKETER_INDEX = PROFESSIONS.findIndex(([name]) => name === "Marketing");


function deviceId() {
  const key = "patkan_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}


const GHOST_TASKS = [
  "Draft a 1-page PRD for our new user onboarding flow",
  "Write a cold outbound email to a VP of Operations about our demo",
  "Write a polite reply declining a refund outside our 30-day policy",
  "Explain tax deductions under Section 80C in plain, simple terms",
  "Write a friendly WhatsApp reply confirming a custom order date",
  "Draft an email comparing term insurance vs endowment plans",
  "Create a 45-minute lesson plan on photosynthesis for 8th graders",
  "Turn rough updates from 5 teams into a weekly executive summary",
];

/** Types the task, then adds each orange slash one at a time, holds, erases. */
function useGhost() {
  const [text, setText] = useState("");
  const [slashes, setSlashes] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let t: ReturnType<typeof setTimeout>;
    let i = 0;
    const run = (task: string, c: number) => {
      if (cancelled) return;
      if (c <= task.length) {
        setText(task.slice(0, c));
        t = setTimeout(() => run(task, c + 1), 38);
        return;
      }
      t = setTimeout(() => {
        setSlashes(1);
        t = setTimeout(() => {
          setSlashes(2);
          t = setTimeout(() => {
            setSlashes(0);
            setText("");
            i = (i + 1) % GHOST_TASKS.length;
            t = setTimeout(() => run(GHOST_TASKS[i]!, 0), 400);
          }, 2000);
        }, 650);
      }, 550);
    };
    t = setTimeout(() => run(GHOST_TASKS[0]!, 0), 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);
  return { text, slashes };
}

function Picker({ items, value, onChange, onOther }: { items: readonly (string | readonly [string, ...string[]])[]; value: number; onChange: (i: number) => void; onOther?: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline" className="h-auto shrink-0 rounded-full px-3 py-1.5 text-xs sm:text-sm"
        >
          {typeof items[value] === "string" ? items[value] : items[value]?.[0]} <ChevronDown className="size-3.5" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
        {items.map((item, i) => (
          <DropdownMenuItem key={typeof item === "string" ? item : item[0]} onSelect={() => onChange(i)}>
            {typeof item === "string" ? item : item[0]}
            {i === value && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
        {onOther && <DropdownMenuItem onSelect={onOther}>Other</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export function Playground() {
  const { session } = useAuth();
  const [ai, setAi] = useState(0);
  const [persona, setPersona] = useState(MARKETER_INDEX);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [customPersonas, setCustomPersonas] = useState<string[]>([]);
  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const [phase, setPhase] = useState<"idle" | "drafting" | "sharpening" | "ready">("idle");
  const runId = useRef(0);
  const running = useRef(false);
  const inputStarted = useRef(false);
  const ghost = useGhost();
  const personaList: PersonaOption[] = [
    ...PROFESSIONS,
    ...customPersonas.map((name) => [name, "auto", `Write as ${name}.`] as PersonaOption),
  ];
  const selectedPersona = personaList[persona] ?? PROFESSIONS[MARKETER_INDEX];
  const selectedAi = AIS[ai];
  const limit = usage?.limit ?? (session ? DAILY_SIGNED_IN_LIMIT : DAILY_FREE_LIMIT);
  const remaining = Math.max(0, limit - (usage?.used ?? 0));
  const exhausted = remaining === 0;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/public/usage?deviceId=${encodeURIComponent(deviceId())}`, {
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
    }).then((res) => res.ok ? res.json() : null)
      .then((data: { used?: number; limit?: number } | null) => {
        if (!cancelled && typeof data?.used === "number" && typeof data.limit === "number") {
          setUsage({ used: data.used, limit: data.limit });
        }
      }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [session?.access_token]);

  function reset() {
    runId.current += 1;
    running.current = false;
    setInput("");
    setOutput("");
    setBusy(false);
    setCopied(false);
    setPhase("idle");
  }

  async function transform(raw: string) {
    const text = raw.trim().slice(0, -2).trim();
    if (!text || running.current || exhausted) return;
    running.current = true;
    const run = ++runId.current;
    const role = selectedPersona ?? PROFESSIONS[MARKETER_INDEX];
    const target = selectedAi ?? AIS[0];
    if (!role || !target) { running.current = false; return; }
    setInput(text);
    setBusy(true);
    setPhase("drafting");
    setOutput(localScaffold(text, { persona: role[1], dialect: target[1], intensity: "standard" }));
    try {
      const result = await streamTransform({
        text, persona: role[1], dialect: target[1], intensity: "standard",
        deviceId: deviceId(), accessToken: session?.access_token,
        customInstruction: role[2] || null, surface: "web",
      }, (visible) => {
        if (run !== runId.current) return;
        setOutput(visible);
        setPhase("sharpening");
      });
      if (run !== runId.current) return;
      setOutput(result.prompt);
      setPhase("ready");
      trackEvent("playground_compiled", { meta: { engine: result.engine } });
      if (typeof result.used === "number" && typeof result.limit === "number") {
        setUsage({ used: result.used, limit: result.limit });
      }
    } catch (err) {
      if (run !== runId.current) return;
      setOutput("");
      setInput(raw);
      setPhase("idle");
      toast.error(err instanceof Error ? err.message : "Transform failed.");
    } finally {
      if (run === runId.current) { setBusy(false); running.current = false; }
    }
  }

  function onInput(value: string) {
    if (!inputStarted.current && value.trim()) {
      inputStarted.current = true;
      trackEvent("playground_input_started");
    }
    setInput(value);
    if (value.trimEnd().endsWith("//") && value.trimEnd().slice(0, -2).trim()) {
      void transform(value.trimEnd());
    }
  }

  async function copy() {
    if (phase !== "ready" || !output) return;
    try {
      await navigator.clipboard.writeText(output);
      trackEvent("playground_copied");
      void fetch("/api/public/feedback", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ deviceId: deviceId(), accepted: true }), keepalive: true,
      }).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { toast.error("Couldn't copy the prompt"); }
  }

  return (
          <div className="mx-auto mt-3 max-w-3xl overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <div className="flex min-w-0 flex-wrap gap-2">
                <Picker items={AIS} value={ai} onChange={setAi} />
                <Picker items={personaList} value={persona} onChange={setPersona} onOther={() => setCustomOpen(true)} />
              </div>
              <div className="ml-auto flex shrink-0 gap-1 text-muted-foreground">
                <Button type="button" variant="ghost" size="icon" onClick={reset} aria-label="Reset" title="Reset">
                  <RotateCcw className="size-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => void copy()} disabled={phase !== "ready"} aria-label="Copy prompt" title="Copy prompt">
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
            {customOpen && (
              <form className="flex gap-2 border-b p-3" onSubmit={(e) => {
                e.preventDefault();
                const name = customDraft.trim().slice(0, 40);
                if (name) {
                  const existing = customPersonas.indexOf(name);
                  if (existing < 0) setCustomPersonas([...customPersonas, name]);
                  setPersona(PROFESSIONS.length + (existing >= 0 ? existing : customPersonas.length));
                }
                setCustomOpen(false);
                setCustomDraft("");
              }}>
                <input value={customDraft} onChange={(e) => setCustomDraft(e.target.value)} maxLength={40} aria-label="Name your role" className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm" />
                <Button type="submit" size="sm">Add</Button>
              </form>
            )}
            <div className="relative p-4 sm:p-7">
              {phase === "idle" ? (
                <>
                  {!input && (
                    <p aria-hidden className="pointer-events-none absolute inset-x-4 top-4 text-base leading-relaxed text-muted-foreground sm:inset-x-7 sm:top-7 sm:text-lg">
                      {ghost.text}
                      {ghost.slashes > 0 && <span className="ml-1 font-mono font-bold text-primary">{"/".repeat(ghost.slashes)}</span>}
                    </p>
                  )}
                  <textarea
                    value={input}
                    onChange={(e) => onInput(e.target.value)}
                    maxLength={MAX_INPUT_CHARS + 2}
                    disabled={exhausted}
                    aria-label="Type your rough thought and end it with //"
                    className="block min-h-[96px] w-full resize-y bg-transparent text-base leading-relaxed outline-none sm:min-h-[120px] sm:text-lg"
                  />
                </>
              ) : (
                <pre aria-live="polite" aria-busy={busy} className="max-h-96 min-h-[120px] overflow-auto whitespace-pre-wrap break-words font-sans text-base leading-relaxed sm:text-lg">{output}</pre>
              )}
              {busy && <Loader2 aria-label="Transforming" className="mt-2 size-4 animate-spin text-primary" />}
              {exhausted && <p className="mt-2 text-sm text-muted-foreground">Daily limit reached. <Link to="/auth" className="text-primary underline">Sign in</Link> to keep going.</p>}
              {!exhausted && <p className="mt-2 text-xs text-muted-foreground">{session ? `${remaining} left today` : `${remaining} more transforms, before you need to sign-in`}</p>}
            </div>
          </div>
  );
}
