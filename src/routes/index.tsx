import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, ArrowRight, Check, ChevronDown, Copy, EyeOff, Headphones, Loader2, RotateCcw, Share2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/telemetry";
import { DAILY_FREE_LIMIT, DAILY_SIGNED_IN_LIMIT, MAX_INPUT_CHARS, localScaffold, type Dialect } from "@/lib/patkan-core";
import { streamTransform } from "@/lib/patkan-stream";
import { ldScript, organizationLd, pageLd, PATKAN_DEFINITION, softwareLd } from "@/lib/seo";
import patkanMark from "@/assets/patkan-mark.svg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Patkan - Prompt convertor for ChatGPT, Gemini, Claude and more AI assistants" },
      {
        name: "description",
        content:
          "Turn a rough thought into a clear, well-structured prompt without leaving your AI chat. End your line with // and Patkan rewrites it for ChatGPT, Gemini or Claude.",
      },
      { property: "og:title", content: "Patkan - Prompt convertor for ChatGPT, Gemini, Claude and more AI assistants" },
      {
        property: "og:description",
        content:
          "Turn a rough thought into a clear, well-structured prompt without leaving your AI chat. End your line with // and Patkan rewrites it.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://patkan.in/" },
      { property: "og:image", content: "https://patkan.in/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://patkan.in/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://patkan.in/" }],
    scripts: [
      ldScript([
        organizationLd,
        softwareLd,
        { "@type": "WebSite", "@id": "https://patkan.in/#website", name: "Patkan", url: "https://patkan.in/", publisher: { "@id": "https://patkan.in/#organization" } },
        pageLd({ name: "Patkan - Prompt convertor for ChatGPT, Gemini, Claude and more AI assistants", path: "/", description: PATKAN_DEFINITION, dateModified: "2026-10-03" }),
      ]),
    ],
  }),
  component: Landing,
});

const shell = "mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8";

const AIS = [
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


const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/patkan-%E2%80%94-instant-expert-p/jcgkfecfliophjfnkokjnifcmalfbnnn";



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

function Picker({ items, value, onChange }: { items: readonly (string | readonly [string, ...string[]])[]; value: number; onChange: (i: number) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent sm:text-sm"
        >
          {typeof items[value] === "string" ? items[value] : items[value]?.[0]} <ChevronDown className="size-3.5" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
        {items.map((item, i) => (
          <DropdownMenuItem key={typeof item === "string" ? item : item[0]} onSelect={() => onChange(i)}>
            {typeof item === "string" ? item : item[0]}
            {i === value && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const eyebrow = "text-sm font-medium text-primary";
const h2 = "mt-2 text-2xl font-semibold leading-tight tracking-tight sm:text-4xl";

function Landing() {
  const { session } = useAuth();
  const isAdmin = useIsAdmin(!!session);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useSectionTracking("/");
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

  async function signOutEverywhere() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/", replace: true });
  }

  function reset() {
    runId.current += 1;
    setInput("");
    setOutput("");
    setBusy(false);
    setCopied(false);
    setPhase("idle");
  }

  async function transform(raw: string) {
    const text = raw.trim().slice(0, -2).trim();
    if (!text || busy || exhausted) return;
    const run = ++runId.current;
    const role = selectedPersona ?? PROFESSIONS[MARKETER_INDEX];
    const target = selectedAi ?? AIS[0];
    if (!role || !target) return;
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
      if (run === runId.current) setBusy(false);
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

  function getExtension() {
    trackEvent("download_clicked", { meta: { file: "chrome-web-store" } });
    window.open(CHROME_WEB_STORE_URL, "_blank", "noopener,noreferrer");
  }

  async function sharePatkan() {
    trackEvent("share_clicked");
    const url = "https://www.patkan.in";
    if (navigator.share) {
      try { await navigator.share({ title: "Patkan", url }); } catch { /* cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
      catch { toast.error("Couldn't copy the link"); }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 0. Masthead */}
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className={`${shell} flex h-14 items-center justify-between gap-3 sm:h-16`}>
          <div className="flex items-center gap-2">
            <img src={patkanMark} alt="Patkan" width={816} height={816} className="size-8 rounded-[0.55rem]" />
            <span className="text-lg font-semibold tracking-tight">Patkan</span>
            <span className="rounded-full border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">/पट्कन/</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground sm:gap-4">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="max-w-24 truncate">Account</Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild><Link to="/library">Your Library</Link></DropdownMenuItem>
                  {isAdmin && <DropdownMenuItem asChild><Link to="/admin">Admin</Link></DropdownMenuItem>}
                  <DropdownMenuItem onSelect={() => void signOutEverywhere()}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : <Link to="/auth" className="hidden hover:text-foreground sm:inline">Sign in</Link>}
            <Button variant="ghost" size="icon" aria-label="Share Patkan" title="Share Patkan" onClick={() => void sharePatkan()}><Share2 className="size-4" /></Button>
            <Button onClick={getExtension} size="sm" className="hidden sm:inline-flex">Add to Chrome</Button>
          </div>
        </div>
      </header>

      <main>
        {/* 1. Hero + 2. Playground + 3. CTA */}
        <section id="playground" data-section="hero" className={`${shell} scroll-mt-20 py-12 sm:py-20`}>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xl font-semibold text-primary sm:text-2xl">Your Personal Prompt Engineer</p>
            <h1 className="mt-3 text-balance text-3xl font-semibold leading-[1.15] tracking-tight sm:text-[2.6rem]">
              Stop writing prompts. Just end your sentence with <span className="font-mono text-primary">//</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Turn raw thoughts into structured prompts right inside ChatGPT, Claude, and Gemini — without switching
              tabs or learning prompt engineering.
            </p>
          </div>

          <p className="mt-10 text-sm font-medium text-primary">Try Patkan in action. Just type anything and end it with //</p>
          <div className="mx-auto mt-3 max-w-3xl overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <div className="flex min-w-0 flex-wrap gap-2">
                <Picker items={AIS} value={ai} onChange={setAi} />
                <Picker items={personaList} value={persona} onChange={setPersona} />
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
            <div className="relative p-5 sm:p-7">
              {phase === "idle" ? (
                <>
                  {!input && (
                    <p aria-hidden className="pointer-events-none absolute inset-x-5 top-5 text-base leading-relaxed text-muted-foreground sm:inset-x-7 sm:top-7 sm:text-lg">
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
                    className="block min-h-[120px] w-full resize-y bg-transparent text-base leading-relaxed outline-none sm:text-lg"
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

          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <Button onClick={getExtension} className="h-11 px-6">
              <ArrowDownToLine className="size-4" aria-hidden />
              <span className="sm:hidden">Add to Desktop</span>
              <span className="hidden sm:inline">Add to Chrome</span>
            </Button>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Google Verified • Works across 14 AI assistants • No sign-up to start
            </p>
          </div>
        </section>

        {/* 4. Works inside */}
        <section className="border-y bg-card py-10">
          <div className={`${shell} text-center`}>
            <p className={eyebrow}>Works right inside</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {AIS.map(([n]) => (
                <span key={n} className="rounded-full border bg-background px-3 py-1.5 text-sm text-muted-foreground">{n}</span>
              ))}
              <span className="rounded-full border bg-background px-3 py-1.5 text-sm text-muted-foreground">+ more</span>
            </div>
          </div>
        </section>

        {/* 5. Professions ticker */}
        <section className="overflow-hidden py-14 sm:py-20">
          <div className={`${shell} text-center`}>
            <p className={eyebrow}>Built for all professionals - not just software engineers</p>
            <h2 className={h2}>Whatever you do, Patkan speaks your language.</h2>
          </div>
          <div className="mt-8 flex w-max animate-[pv2-marquee_40s_linear_infinite] gap-3">
            {[...PROFESSIONS, ...PROFESSIONS].map(([name], i) => (
              <span key={i} className="shrink-0 rounded-full border px-4 py-2 text-sm">{name}</span>
            ))}
          </div>
          <style>{`@keyframes pv2-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
        </section>

        {/* 6. Three steps */}
        <section id="install" data-section="install" className="scroll-mt-20 border-y bg-card py-14 sm:py-20">
          <div className={shell}>
            <p className={eyebrow}>How it works</p>
            <h2 className={h2}>How to turn any sentence into a prompt inside your AI</h2>
            <div className="mt-10 grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-3">
              {[
                ["01", "Add to Desktop Browser", "Install the free Patkan prompt generator extension for Chrome, Edge, Firefox, Brave, Arc, and Opera. It takes just 2 click, no sign-up."],
                ["02", "Open your AI in browser", "Open ChatGPT, Claude, Gemini, Microsoft Copilot, Perplexity, or any supported AI assistant. Patkan sits inside the AI you already use - no new tab. no copy pasting prompts."],
                ["03", "Type anything and end with //", "Write your task in plain words and end it with //. Patkan turns the sentence into a structured expert prompt instantly - no tab switching, no copy-paste."],
              ].map(([n, t, b]) => (
                <article key={n} className="bg-background p-6 sm:p-8">
                  <span className="font-mono text-xs tracking-widest text-muted-foreground">{n}</span>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">{t}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{b}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Privacy */}
        <section className={`${shell} py-14 sm:py-20`}>
          <p className={eyebrow}>Privacy &amp; Security</p>
          <h2 className={h2}>Inside your AI tab. Nowhere else.</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-2">
            {[
              [Headphones, "Deaf until //", "No keyloggers. No background daemons listening to keystrokes. Patkan takes no action until you type // at the end of a sentence."],
              [EyeOff, "Blind to the rest of the web", "Patkan cannot see your other tabs, bank logins, emails, or browsing history. It is confined to the AI sites in its approved list."],
            ].map(([Icon, t, b]) => {
              const I = Icon as typeof EyeOff;
              return (
                <article key={t as string} className="bg-background p-6 sm:p-8">
                  <span className="inline-flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <I className="size-4" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{t as string}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{b as string}</p>
                </article>
              );
            })}
          </div>
          <Link to="/privacy" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            Read the full privacy policy <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>

        {/* 8. Support */}
        <section id="support" data-section="support" className={`${shell} scroll-mt-20 pb-16 sm:pb-24`}>
          <div className="rounded-lg border bg-card p-6 sm:p-10">
            <p className={eyebrow}>Support</p>
            <h2 className={h2}>Need Help?</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Questions, bug reports, a site where Patkan should work but doesn&apos;t - send it across and you&apos;ll
              get a reply from the person who builds Patkan.
            </p>
            <a href="mailto:contact@patkan.in" className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">
              Email: contact@patkan.in
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className={`${shell} flex flex-wrap items-center justify-between gap-3 py-8 text-xs text-muted-foreground`}>
          <p>patkan.in</p>
          <nav className="flex flex-wrap gap-4">
            <Link to="/about">About</Link>
            <Link to="/chatgpt-prompt-generator">ChatGPT prompt generator</Link>
            <Link to="/claude-prompt-generator">Claude prompt generator</Link>
            <Link to="/gemini-prompt-generator">Gemini prompt generator</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
