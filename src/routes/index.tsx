import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowRight, Check, ChevronDown, Copy, EyeOff, Headphones, RotateCcw, Share2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import patkanMark from "@/assets/patkan-mark.svg";

// UI-review mock of the new landing page. Static only: no transforms, no API calls.
export const Route = createFileRoute("/playgroundv2")({
  head: () => ({
    meta: [
      { title: "Landing page preview — Patkan" },
      { name: "description", content: "Layout preview of the new Patkan landing page." },
      { property: "og:title", content: "Landing page preview — Patkan" },
      { property: "og:description", content: "Layout preview of the new Patkan landing page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LandingPreview,
});

const shell = "mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8";

const AIS = [
  "ChatGPT", "Gemini", "Claude", "Microsoft Copilot", "Perplexity", "DeepSeek", "Grok",
  "Meta AI", "Mistral", "Poe", "Notion AI", "Qwen", "Kimi",
];

const PROFESSIONS = [
  "Chartered Accountant", "Content Writer", "Corporate Lawyer", "Customer Success Manager",
  "Customer Support Agent", "Doctor", "Equity Research Analyst", "Executive Assistant",
  "Financial Analyst", "HR Business Partner", "Insurance Advisor", "Journalist",
  "Learning & Development Specialist", "Litigation Advocate", "Management Consultant", "Marketing",
  "Non-profit Grant Writer", "Operations Manager", "PR Manager", "Product Manager", "Project Manager",
  "Real Estate Agent", "Recruiter", "Sales Representative", "SEO Specialist", "Small Business Owner",
  "Social Media Manager", "Teacher", "UX / Product Designer", "UX Writer",
];

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

function Picker({ items, value, onChange }: { items: string[]; value: number; onChange: (i: number) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent sm:text-sm"
        >
          {items[value]} <ChevronDown className="size-3.5" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
        {items.map((name, i) => (
          <DropdownMenuItem key={name} onSelect={() => onChange(i)}>
            {name}
            {i === value && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const eyebrow = "text-sm font-medium text-primary";
const h2 = "mt-2 text-2xl font-semibold leading-tight tracking-tight sm:text-4xl";

function LandingPreview() {
  const [ai, setAi] = useState(0);
  const [persona, setPersona] = useState(PROFESSIONS.indexOf("Marketing"));
  const [input, setInput] = useState("");
  const ghost = useGhost();

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
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="hidden md:inline">Sign in</span>
            <Share2 className="size-4" aria-label="Share" />
            <span className="hidden rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground sm:inline">
              Add to Chrome
            </span>
          </div>
        </div>
      </header>

      <main>
        {/* 1. Hero + 2. Playground + 3. CTA */}
        <section className={`${shell} py-12 sm:py-20`}>
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
                <Picker items={PROFESSIONS} value={persona} onChange={setPersona} />
              </div>
              <div className="ml-auto flex shrink-0 gap-1 text-muted-foreground">
                <button type="button" onClick={() => setInput("")} aria-label="Reset" className="rounded-md p-2 hover:bg-accent">
                  <RotateCcw className="size-4" />
                </button>
                <button type="button" aria-label="Copy prompt" className="rounded-md p-2 hover:bg-accent">
                  <Copy className="size-4" />
                </button>
              </div>
            </div>
            <div className="relative p-5 sm:p-7">
              {!input && (
                <p aria-hidden className="pointer-events-none absolute inset-x-5 top-5 text-base leading-relaxed text-muted-foreground sm:inset-x-7 sm:top-7 sm:text-lg">
                  {ghost.text}
                  {ghost.slashes > 0 && (
                    <span className="ml-1 font-mono font-bold text-primary">{"/".repeat(ghost.slashes)}</span>
                  )}
                </p>
              )}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Type your rough thought and end it with //"
                className="block min-h-[120px] w-full resize-none bg-transparent text-base leading-relaxed outline-none sm:text-lg"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <span className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm">
              <ArrowDownToLine className="size-4" aria-hidden />
              <span className="sm:hidden">Add to Desktop</span>
              <span className="hidden sm:inline">Add to Chrome</span>
            </span>
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
              {AIS.map((n) => (
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
            {[...PROFESSIONS, ...PROFESSIONS].map((p, i) => (
              <span key={i} className="shrink-0 rounded-full border px-4 py-2 text-sm">{p}</span>
            ))}
          </div>
          <style>{`@keyframes pv2-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
        </section>

        {/* 6. Three steps */}
        <section className="border-y bg-card py-14 sm:py-20">
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
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            Read the full privacy policy <ArrowRight className="size-4" aria-hidden />
          </span>
        </section>

        {/* 8. Support */}
        <section className={`${shell} pb-16 sm:pb-24`}>
          <div className="rounded-lg border bg-card p-6 sm:p-10">
            <p className={eyebrow}>Support</p>
            <h2 className={h2}>Need Help?</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Questions, bug reports, a site where Patkan should work but doesn&apos;t - send it across and you&apos;ll
              get a reply from the person who builds Patkan.
            </p>
            <span className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">
              Email: contact@patkan.in
            </span>
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
