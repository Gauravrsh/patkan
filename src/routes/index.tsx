import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  EyeOff,
  Globe2,
  Headphones,
  Loader2,
  LockKeyhole,
  MousePointer2,
  ShieldCheck,
  Sparkles,
  Volume2,
  Zap,
} from "lucide-react";

import { toast } from "sonner";

import {
  DAILY_FREE_LIMIT,
  DAILY_SIGNED_IN_LIMIT,
  type Dialect,
  type Intensity,
  localScaffold,
} from "@/lib/patkan-core";
import { streamTransform, type EngineId } from "@/lib/patkan-stream";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import patkanMark from "@/assets/patkan-mark.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Patkan — Expert prompts, instantly" },
      {
        name: "description",
        content: "Turn a rough thought into a surgically crafted prompt without leaving your AI chat.",
      },
      { property: "og:title", content: "Patkan — Expert prompts, instantly" },
      {
        property: "og:description",
        content: "Turn a rough thought into a surgically crafted prompt without leaving your AI chat.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://patkan.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://patkan.lovable.app/" }],
  }),
  component: Landing,
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

const targetAis = [
  ["Gemini", "sectioned", "Google Gemini — sectioned format with clear prompt boundaries"],
  ["ChatGPT", "markdown", "OpenAI ChatGPT — structured markdown with headings"],
  ["Claude", "xml", "Anthropic Claude — XML tags for prompt boundaries"],
  ["Copilot", "markdown", "Microsoft Copilot — structured reasoning with markdown"],
] as const;

const personas = [
  ["Auto", "auto", "Role: an expert in the domain the task implies"],
  ["Product Manager", "product-manager", "Role: a senior product manager who writes rigorous, decision-ready specs"],
  ["UX Writer", "ux-writer", "Role: a senior UX writer who produces tight, on-brand product copy"],
  ["B2B Marketer", "marketer", "Role: a B2B marketer who writes platform-native, high-conversion copy"],
  ["Engineer", "engineer", "Role: a pragmatic staff engineer who gives implementation-grade answers"],
  ["Analyst", "analyst", "Role: a data analyst who reasons quantitatively and shows the working"],
  ["Other", "auto", "Custom persona active"],
] as const;

const pillars = [
  {
    number: "01",
    icon: MousePointer2,
    heading: "Invisible Execution",
    body: 'No prompt libraries. No copy-pasting. No switching tabs. No endless typing. Ridiculously frictionless. Unbelievably precise. Leaves you "WTF!" the first time, and with a satisfying smile every time after.',
  },
  {
    number: "02",
    icon: Zap,
    heading: "100X your AI.",
    body: "Turn a raw thought into a surgical instruction in a flash. Patkan automatically injects the personas, constraints, and output formats that frontier models actually respect. Stop arguing with the AI to fix its mistakes. Get crazy good output on the very first prompt.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    heading: "A tool, not a toll.",
    body: "No pricing tiers. No credit limits. No monthly subscriptions. Foundational utilities should be a public good. Patkan is open-source, absolutely free, and built with zero interest in your data. Our contribution to the FOSS community.",
  },
] as const;

const installSteps = [
  ["Download & Extract", "Download Patkan and extract the .zip file."],
  ["Open Extensions", "Type chrome://extensions in your address bar and hit enter."],
  ["Enable Developer Mode", "Toggle the switch in the top right corner to ON."],
  ["Load Unpacked", 'Click "Load unpacked" (top left) and select your extracted folder.'],
  [
    "Trigger Patkan",
    "Type your prompt in ChatGPT, Claude, or Gemini in natural language. End it with // and Patkan takes over.",
  ],
] as const;

const approvedUrls = ["https://chatgpt.com/*", "https://claude.ai/*", "https://gemini.google.com/*"] as const;

const privacy = [
  {
    icon: Headphones,
    heading: "Deaf until //",
    body: "No keyloggers. No background daemons listening to keystrokes. Patkan stays completely inert in memory until you type `//` at the end of a sentence.",
  },
  {
    icon: EyeOff,
    heading: "Blind to the rest of the web",
    body: "Patkan cannot see your other tabs, bank logins, emails, or browsing history. The browser sandbox strictly confines it to `chatgpt.com`, `claude.ai`, and `gemini.google.com`.",
  },
  {
    icon: Zap,
    heading: "Zero memory. Zero retention.",
    body: "Your rough input compiles in RAM for 200ms and immediately replaces your text. No prompt logs, no chat databases, and zero model training on what you write.",
  },
  {
    icon: Globe2,
    heading: "100% open and auditable",
    body: "No obfuscated binary blobs. Because you install Patkan unpacked, you can open the folder, inspect every line of plain JavaScript, and verify every network call in DevTools before you click load.",
  },
] as const;

function Landing() {
  const { session } = useAuth();
  const [input, setInput] = useState("");
  const [targetIndex, setTargetIndex] = useState(0);
  const [personaIndex, setPersonaIndex] = useState(0);
  const [output, setOutput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [engine, setEngine] = useState<EngineId>("local");
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [clarifiers, setClarifiers] = useState<{ label: string; refinement: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const outRef = useRef<HTMLPreElement>(null);

  const target = targetAis[targetIndex]!;
  const persona = personas[personaIndex]!;
  const dialect = target[1] as Dialect;
  const personaId = persona[1];
  const intensity: Intensity = "standard";
  const settled = phase === "ready" || phase === "idle";

  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = `${Math.max(el.scrollHeight, 96)}px`;
    }
  }, [input]);

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
          surface: "web",
        },
        (visible) => {
          setPhase("sharpening");
          setOutput(visible);
        },
      );
      setOutput(result.prompt);
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

  async function copy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function download() {
    fetch("/patkan-extension.zip")
      .then((res) => {
        if (!res.ok) throw new Error("Download failed. Try again.");
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "patkan-extension.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err: Error) => toast.error(err.message));
  }

  function scrollToPlayground() {
    const el = document.getElementById("playground");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => textareaRef.current?.focus(), 400);
    }
  }

  function speak() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance("patkan");
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  const limit = usage?.limit ?? (session ? DAILY_SIGNED_IN_LIMIT : DAILY_FREE_LIMIT);
  const used = usage?.used ?? 0;
  const remaining = Math.max(0, limit - used);
  const exhausted = used >= limit;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className={`${shell} grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:h-16`}>
          <div className="flex min-w-0 items-center gap-2.5">
            <img
              src={patkanMark}
              alt="Patkan"
              width={816}
              height={816}
              className="size-8 shrink-0 rounded-[0.55rem] sm:size-9"
            />
            <span className="truncate text-lg font-semibold tracking-tight sm:text-xl">Patkan</span>
            <span className="hidden shrink-0 rounded-full border bg-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground sm:inline">
              /पट्कन/
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
              <a href="#playground" className="transition-colors hover:text-foreground">
                Playground
              </a>
              <a href="#install" className="transition-colors hover:text-foreground">
                Install Guide
              </a>
              {session ? (
                <Link to="/library" className="transition-colors hover:text-foreground">
                  Library
                </Link>
              ) : (
                <Link to="/auth" className="transition-colors hover:text-foreground">
                  Sign in
                </Link>
              )}
            </div>
            <button
              onClick={download}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:px-4"
            >
              <span className="hidden sm:inline">Get Extension</span>
              <span className="sm:hidden">Get</span>
              <ArrowDownToLine className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section
          className={`${shell} grid gap-10 pb-16 pt-10 sm:gap-12 sm:pb-20 sm:pt-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-20`}
        >
          <div className="order-2 lg:order-1">
            <div className="border-l-2 border-primary pl-4 sm:pl-6">
              <p className="text-balance text-xl font-medium leading-snug sm:text-2xl md:text-3xl">
                “Good prompts work better.
                <br />I know that, but its too much to type!”
              </p>
              <p className="mt-3 text-sm italic text-muted-foreground">— Is that you?</p>
            </div>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-9 sm:text-lg">
              Just type what you want to do in plain words and finish your sentence with{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">//</code>. Watch your
              rough thought turn into a surgically crafted prompt in the blink of an eye.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base">
              Patkan sits right inside <strong className="text-foreground">ChatGPT</strong>,{" "}
              <strong className="text-foreground">Claude</strong>, <strong className="text-foreground">Gemini</strong>,{" "}
              <strong className="text-foreground">Microsoft Copilot</strong>,{" "}
              <strong className="text-foreground">Perplexity</strong>, and more. You never have to switch tabs or leave
              your AI chat.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <button
                onClick={download}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:h-10"
              >
                <ArrowDownToLine className="size-4" aria-hidden /> Download the extension
              </button>
              <button
                onClick={scrollToPlayground}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-background px-5 text-sm font-medium shadow-sm transition-colors hover:bg-accent sm:h-10"
              >
                Try it here first <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">No sign-up to start. 10 transforms per day, free.</p>
          </div>

          <article className="order-1 overflow-hidden rounded-lg border bg-card shadow-sm lg:order-2">
            <div className="flex items-start justify-between gap-3 border-b p-5 sm:p-7 md:p-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h1 className="text-[2.6rem] font-semibold leading-none tracking-tight sm:text-5xl">patkan</h1>
                  <span className="text-xl text-muted-foreground sm:text-2xl">पट्कन</span>
                </div>
                <p className="mt-3 font-mono text-xs text-muted-foreground sm:text-sm">/ˈpʌʈ.kən/</p>
              </div>
              <button
                onClick={speak}
                className="inline-flex shrink-0 items-center gap-2 rounded-md border px-2.5 py-2 text-xs transition-colors hover:bg-accent sm:px-3 sm:text-sm"
              >
                <Volume2 className="size-4 text-primary" aria-hidden />
                <span className="hidden sm:inline">Listen</span>
              </button>
            </div>
            <div className="p-5 sm:p-7 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground sm:text-xs">
                <span className="italic">adverb | क्रियाविशेषण अव्यय</span>
                <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">Origin: Marathi [मराठी]</span>
              </div>
              <p className="mt-6 text-base leading-relaxed sm:mt-7 sm:text-lg">
                <span className="mr-3 font-mono text-sm text-primary">:</span>to perform, execute, or complete an action{" "}
                <strong>instantly, promptly, and without friction or delay</strong>; in a single swift motion.
              </p>
              <blockquote className="mt-6 border-l pl-4 text-sm italic leading-relaxed text-muted-foreground sm:mt-7">
                “Draft your raw thoughts, finish with <code className="font-mono text-foreground">//</code>, and watch it
                sharpen into an expert prompt <strong className="text-foreground">patkan</strong>.”
              </blockquote>
              <div className="mt-6 border-t pt-5 text-[11px] leading-relaxed text-muted-foreground sm:mt-7 sm:text-xs">
                <span className="font-semibold text-foreground">SYNONYMS:</span> promptly · instantly · swiftly · in a
                flash
              </div>
            </div>
          </article>
        </section>

        {/* Playground */}
        <section id="playground" className="scroll-mt-16 border-y bg-card py-16 sm:py-20 md:py-28">
          <div className={shell}>
            <Playground
              input={input}
              setInput={setInput}
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
              transform={transform}
              remaining={remaining}
              exhausted={exhausted}
              session={!!session}
              textareaRef={textareaRef}
              outRef={outRef}
            />
          </div>
        </section>

        {/* Pillars */}
        <section className={`${shell} py-16 sm:py-20 md:py-24`}>
          <div aria-hidden className="h-[3px] w-full bg-primary" />
          <div className="border-b border-border md:grid md:grid-cols-[1fr_1.35fr_1fr] md:divide-x md:divide-border">
            {pillars.map(({ number, icon: Icon, heading, body }) => (
              <article
                key={heading}
                className="group flex gap-5 border-b border-border py-8 last:border-b-0 md:block md:border-b-0 md:px-10 md:py-12 md:first:pl-0 md:last:pr-0"
              >
                <div className="flex w-9 shrink-0 flex-col items-center gap-4 md:w-auto md:flex-row md:items-center md:justify-between">
                  <span className="font-mono text-xs tracking-widest text-muted-foreground md:text-3xl md:tracking-tight md:text-foreground/25 md:transition-colors md:duration-300 md:group-hover:text-primary">
                    {number}
                  </span>
                  <span aria-hidden className="w-px flex-1 bg-border md:hidden" />
                  <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-card md:size-10">
                    <Icon className="size-4 text-primary md:size-5" aria-hidden />
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl md:mt-10">{heading}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground md:mt-4">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Install guide */}
        <section id="install" className="scroll-mt-16 border-y bg-card py-16 sm:py-20 md:py-28">
          <div className={shell}>
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Install Guide</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                  60 sec Installation Guide
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Works across all major desktop browsers. Not in stores yet, so it installs directly unpacked.
              </p>
            </div>

            <div className="relative mt-10">
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:border-b md:gap-1 md:pb-0">
                {["Google Chrome", "Microsoft Edge", "Mozilla Firefox", "Apple Safari", "Opera"].map((browser, index) => (
                  <span
                    key={browser}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm md:rounded-none md:border-0 md:border-b-2 md:px-4 md:py-3 ${
                      index === 0
                        ? "border-primary bg-primary text-primary-foreground md:bg-transparent md:font-medium md:text-foreground"
                        : "text-muted-foreground md:border-transparent"
                    }`}
                  >
                    {browser}
                  </span>
                ))}
              </div>
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-card to-transparent md:hidden"
                aria-hidden
              />
            </div>

            <div className="mt-10 grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-center lg:gap-14">
              <ol className="relative space-y-7 border-l pl-0">
                {installSteps.map(([title, detail], index) => (
                  <li key={title} className="relative grid grid-cols-[2.25rem_1fr] items-start gap-4 pl-0">
                    <span className="-ml-[1.125rem] flex size-9 items-center justify-center rounded-full border bg-card font-mono text-xs text-primary shadow-sm">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[0.95rem] font-semibold tracking-tight">{title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{detail}</p>
                      {index === 0 && (
                        <button
                          onClick={download}
                          className="mt-3 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                        >
                          <ArrowDownToLine className="size-4" aria-hidden /> Download Patkan v1.0
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <BrowserMockup />
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className={`${shell} py-16 sm:py-20 md:py-28`}>
          <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Privacy &amp; Security</p>
              <h2 className="mt-3 max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Inside your AI tab. Nowhere else.
              </h2>
              <span className="mt-6 block h-px w-16 bg-primary" aria-hidden />
            </div>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              No background tracking. No keystroke logging. No reading your chat history. Patkan is hardcoded strictly
              to <ApprovedUrlsTrigger /> and stays completely inert until you type{" "}
              <code className="font-mono text-foreground">//</code>. What you type compiles in RAM and vanishes.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border bg-border sm:mt-16 md:grid-cols-2">
            {privacy.map(({ icon: Icon, heading, body }, index) => (
              <article key={heading} className="bg-background p-6 sm:p-8 md:p-9">
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="font-mono text-xs tracking-widest text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight sm:text-xl">{heading}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{renderCode(body)}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className={`${shell} flex flex-wrap items-center justify-between gap-3 py-8 text-xs text-muted-foreground`}>
          <span>✦ Patkan — quickly.</span>
          <span>10 free transforms a day.</span>
        </div>
      </footer>
    </div>
  );
}

function ApprovedUrlsTrigger() {
  return (
    <Popover>
      <PopoverTrigger className="border-b border-primary text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
        these approved URLs ↗
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="font-mono text-xs font-medium">Hardcoded manifest.json Matches</span>
          <LockKeyhole className="size-4 text-primary" aria-hidden />
        </div>
        <div className="divide-y font-mono text-[11px]">
          {approvedUrls.map((url) => (
            <div key={url} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="truncate text-muted-foreground">{url}</span>
              <span className="flex shrink-0 items-center gap-1 text-primary">
                <Check className="size-3" aria-hidden /> VERIFIED
              </span>
            </div>
          ))}
        </div>
        <p className="border-t px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          Chrome strictly prevents content scripts from running on any domain not explicitly listed in this match array.
        </p>
      </PopoverContent>
    </Popover>
  );
}

const chipRow =
  "mt-3 flex gap-2 max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:pb-1 max-lg:[mask-image:linear-gradient(to_right,black_86%,transparent)] lg:flex-wrap";

function Chip({ name, active, onClick }: { name: string; active: boolean; onClick?: () => void }) {
  const base =
    "shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition-colors cursor-pointer select-none";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${active ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
    >
      {name}
    </button>
  );
}

interface PlaygroundProps {
  input: string;
  setInput: (v: string) => void;
  targetIndex: number;
  setTargetIndex: (i: number) => void;
  personaIndex: number;
  setPersonaIndex: (i: number) => void;
  output: string;
  phase: Phase;
  engine: EngineId;
  assumptions: string[];
  clarifiers: { label: string; refinement: string }[];
  busy: boolean;
  copied: boolean;
  copy: () => void;
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

  const target = targetAis[targetIndex]!;
  const persona = personas[personaIndex]!;
  const settled = phase === "ready" || phase === "idle";

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
              {exhausted ? "0 left today" : `${remaining} left today`}
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
            <div className="mt-5 min-h-24 border-b border-dashed pb-6 sm:min-h-28">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="I want to.."
                rows={1}
                className="w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-sans text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 sm:text-lg"
                disabled={busy}
              />
            </div>
          )}

          <div className="mt-6">
            <p className="font-mono text-[11px] tracking-widest text-muted-foreground">TARGET AI</p>
            <div className={chipRow}>
              {targetAis.map(([name], index) => (
                <Chip key={name} name={name} active={targetIndex === index} onClick={() => setTargetIndex(index)} />
              ))}
            </div>
            <p className="mt-3 truncate text-xs leading-relaxed text-muted-foreground sm:text-sm lg:whitespace-normal">
              {target[2]}
            </p>
          </div>

          <div className="mt-6 border-t pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[11px] tracking-widest text-muted-foreground">PERSONA</p>
              <span className="text-xs text-muted-foreground">{persona[2]}</span>
            </div>
            <div className={chipRow}>
              {personas.map(([name], index) => (
                <Chip key={name} name={name} active={personaIndex === index} onClick={() => setPersonaIndex(index)} />
              ))}
            </div>
            <p className="mt-3 truncate text-xs leading-relaxed text-muted-foreground sm:text-sm lg:whitespace-normal">
              {persona[2]}
            </p>
          </div>

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
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold tracking-wider">{PHASE_LABEL[phase]}</span>
            <button
              onClick={copy}
              disabled={!output || !settled}
              className="inline-flex shrink-0 items-center gap-2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              {copied ? <Check className="size-4" aria-hidden /> : <CopyIcon className="size-4" aria-hidden />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="mt-3 truncate font-mono text-[11px] tracking-wide text-muted-foreground">
            compiled for {target[0]} · {persona[0]}
          </p>
          <div className="relative mt-4 overflow-hidden rounded-md border bg-background">
            <pre
              ref={outRef}
              aria-busy={!settled}
              className={`max-h-56 space-y-2.5 overflow-auto p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words sm:max-h-64 sm:p-5 sm:text-xs ${
                settled ? "text-foreground/90 opacity-100" : "text-foreground/70 opacity-60"
              }`}
            >
              {output ? (
                <PromptOutput text={output} dialect={target[1] as Dialect} />
              ) : (
                <span className="text-muted-foreground/60">Your compiled prompt will appear here.</span>
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

          {phase === "ready" && (
            <p className="mt-3 text-xs text-muted-foreground">
              {engine === "primary"
                ? "Ready"
                : engine === "fallback"
                  ? "Ready — backup engine"
                  : "Ready — offline draft"}
            </p>
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

function Toggle({ on = true }: { on?: boolean }) {
  return (
    <span
      className={`inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 ${on ? "bg-primary" : "bg-muted"}`}
      aria-hidden
    >
      <span className={`size-4 rounded-full bg-background shadow-sm transition-transform ${on ? "translate-x-4" : ""}`} />
    </span>
  );
}

function BrowserMockup() {
  return (
    <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border bg-background shadow-md lg:max-w-none">
      <div className="flex items-center gap-2 border-b bg-muted px-3 py-2.5 sm:px-4 sm:py-3">
        <span className="size-2.5 rounded-full bg-destructive/70" />
        <span className="size-2.5 rounded-full bg-primary/50" />
        <span className="size-2.5 rounded-full bg-chart-2/60" />
        <div className="ml-2 flex-1 truncate rounded-full bg-background px-3 py-1.5 font-mono text-[10px] text-muted-foreground">
          chrome://extensions
        </div>
      </div>
      <div className="p-4 sm:p-6 md:p-7">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight sm:text-lg">Extensions</h3>
          <span className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
            <span className="hidden sm:inline">Developer mode</span>
            <Toggle />
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-[10px] sm:text-[11px]">
          {["Load unpacked", "Pack extension", "Update"].map((item, index) => (
            <span
              key={item}
              className={`rounded-md px-3 py-1.5 font-medium shadow-sm ${
                index === 0 ? "bg-primary text-primary-foreground" : "border bg-background text-foreground"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ExtensionCard
            title="Patkan"
            version="1.0.0"
            description="End any prompt with // in ChatGPT, Claude, or Gemini to trigger Patkan."
            accent
          />
          <ExtensionCard
            title="Grammarly"
            version="14.1.2"
            description="Improve your writing with real-time grammar and spell checking."
          />
        </div>
      </div>
    </div>
  );
}

function ExtensionCard({
  title,
  version,
  description,
  accent = false,
}: {
  title: string;
  version: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-background p-4 ${
        accent ? "border-primary shadow-[0_0_0_2px_color-mix(in_oklab,var(--primary)_18%,transparent)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {accent ? (
          <img src={patkanMark} alt="Patkan" width={816} height={816} loading="lazy" className="size-9 rounded-md" />
        ) : (
          <span className="flex size-9 items-center justify-center rounded-md bg-muted text-sm font-semibold text-muted-foreground">
            G
          </span>
        )}
        <Toggle />
      </div>
      <h4 className="mt-4 text-sm font-semibold tracking-tight">
        {title} <span className="font-normal text-muted-foreground">{version}</span>
      </h4>
      <p className="mt-2 min-h-12 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-4 flex gap-2 border-t pt-3 text-[10px] text-muted-foreground">
        <span className="rounded border px-2 py-1">Details</span>
        <span className="rounded border px-2 py-1">Remove</span>
      </div>
    </div>
  );
}

function renderCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code key={part} className="font-mono text-foreground">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  );
}
