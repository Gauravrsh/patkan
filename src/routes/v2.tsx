import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  EyeOff,
  Globe2,
  Headphones,
  LockKeyhole,
  MousePointer2,
  ShieldCheck,
  Sparkles,
  Volume2,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/v2")({
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
      { property: "og:url", content: "https://patkan.lovable.app/v2" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://patkan.lovable.app/v2" }],
  }),
  component: PatkanV2,
});

const targetAis = [
  ["Gemini", "Google Gemini — sectioned format with clear prompt boundaries"],
  ["ChatGPT", "OpenAI ChatGPT — structured markdown with headings"],
  ["Claude", "Anthropic Claude — XML tags for prompt boundaries"],
  ["Copilot", "Microsoft Copilot — structured reasoning with markdown"],
] as const;

const personas = [
  ["Auto", "Role: an expert in the domain the task implies"],
  ["Product Manager", "Role: a senior product manager who writes rigorous, decision-ready specs"],
  ["UX Writer", "Role: a senior UX writer who produces tight, on-brand product copy"],
  ["B2B Marketer", "Role: a B2B marketer who writes platform-native, high-conversion copy"],
  ["Engineer", "Role: a pragmatic staff engineer who gives implementation-grade answers"],
  ["Analyst", "Role: a data analyst who reasons quantitatively and shows the working"],
  ["Other", "Custom persona active"],
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
    icon: HeartMark,
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

function PatkanV2() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="border-b bg-background/95">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold">Patkan</span>
            <span className="rounded-full border bg-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground">/पट्कन/</span>
          </div>
          <div className="hidden items-center gap-7 text-sm text-muted-foreground sm:flex">
            <span>Playground</span>
            <span>Install Guide</span>
          </div>
          <span className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm">
            Get Extension <ArrowDownToLine className="size-4" aria-hidden />
          </span>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 pb-20 pt-14 md:px-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-28 lg:pt-20">
          <div className="order-2 lg:order-1">
            <div className="border-l-2 border-primary pl-5 md:pl-7">
              <p className="text-2xl font-medium leading-snug md:text-3xl">
                “Good prompts work better.
                <br />I know that, but its too much to type!”
              </p>
              <p className="mt-3 text-sm italic text-muted-foreground">— Is that you?</p>
            </div>
            <p className="mt-9 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Just type what you want to do in plain words and finish your sentence with <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">//</code>. Watch your rough thought turn into a surgically crafted prompt in the blink of an eye.
            </p>
            <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
              Patkan sits right inside <strong className="text-foreground">ChatGPT</strong>, <strong className="text-foreground">Claude</strong>, <strong className="text-foreground">Gemini</strong>, <strong className="text-foreground">Microsoft Copilot</strong>, <strong className="text-foreground">Perplexity</strong>, and more. You never have to switch tabs or leave your AI chat.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm">
                <ArrowDownToLine className="size-4" aria-hidden /> Download the extension
              </span>
              <span className="inline-flex h-10 items-center gap-2 rounded-md border bg-background px-5 text-sm font-medium shadow-sm">
                Try it here first <ArrowRight className="size-4" aria-hidden />
              </span>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">No sign-up to start. 10 transforms per day, free.</p>
          </div>

          <article className="order-1 border bg-card shadow-sm lg:order-2">
            <div className="flex items-start justify-between gap-4 border-b p-6 md:p-8">
              <div>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h1 className="text-5xl font-semibold leading-none">patkan</h1>
                  <span className="text-2xl text-muted-foreground">पट्कन</span>
                </div>
                <p className="mt-3 font-mono text-sm text-muted-foreground">/ˈpʌʈ.kən/</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <Volume2 className="size-4 text-primary" aria-hidden /> Listen
              </span>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="italic">adverb | क्रियाविशेषण अव्यय</span>
                <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">Origin: Marathi [मराठी]</span>
              </div>
              <p className="mt-7 text-lg leading-relaxed">
                <span className="mr-3 font-mono text-sm text-primary">:</span>to perform, execute, or complete an action <strong>instantly, promptly, and without friction or delay</strong>; in a single swift motion.
              </p>
              <blockquote className="mt-7 border-l pl-4 text-sm italic leading-relaxed text-muted-foreground">
                “Draft your raw thoughts, finish with <code className="font-mono text-foreground">//</code>, and watch it sharpen into an expert prompt <strong className="text-foreground">patkan</strong>.”
              </blockquote>
              <div className="mt-7 border-t pt-5 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">SYNONYMS:</span> promptly · instantly · swiftly · in a flash
              </div>
            </div>
          </article>
        </section>

        <section className="border-y bg-card py-20 md:py-28">
          <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
            <Playground />
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-px border-x bg-border md:grid-cols-3">
          {pillars.map(({ number, icon: Icon, heading, body }) => (
            <article key={heading} className="bg-background p-7 md:min-h-[25rem] md:p-9">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">{number}</span>
                <Icon className="size-5 text-primary" aria-hidden />
              </div>
              <h2 className="mt-20 text-2xl font-semibold md:mt-28">{heading}</h2>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">{body}</p>
            </article>
          ))}
        </section>

        <section className="border-y bg-card py-20 md:py-28">
          <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-xs uppercase text-primary">Install Guide</p>
                <h2 className="mt-3 text-3xl font-semibold md:text-5xl">60 sec Installation Guide</h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Works across all major desktop browsers. Not in stores yet, so it installs directly unpacked.
              </p>
            </div>
            <div className="mt-12 flex gap-1 overflow-x-auto border-b">
              {["Google Chrome", "Microsoft Edge", "Mozilla Firefox", "Apple Safari", "Opera"].map((browser, index) => (
                <span key={browser} className={`shrink-0 border-b-2 px-4 py-3 text-sm ${index === 0 ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground"}`}>
                  {browser}
                </span>
              ))}
            </div>
            <div className="mt-10 grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
              <ol className="space-y-6">
                {installSteps.map(([title, detail], index) => (
                  <li key={title} className="grid grid-cols-[2rem_1fr] gap-4">
                    <span className="flex size-8 items-center justify-center rounded-full border font-mono text-xs text-primary">{index + 1}</span>
                    <div>
                      <h3 className="font-medium">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail}</p>
                      {index === 0 && (
                        <span className="mt-3 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground">
                          <ArrowDownToLine className="size-4" aria-hidden /> Download Patkan v1.0
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <BrowserMockup />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="font-mono text-xs uppercase text-primary">Privacy &amp; Security</p>
              <h2 className="mt-3 max-w-lg text-4xl font-semibold leading-tight md:text-5xl">Inside your AI tab. Nowhere else.</h2>
            </div>
            <div>
              <p className="text-lg leading-relaxed text-muted-foreground">
                No background tracking. No keystroke logging. No reading your chat history. Patkan is hardcoded strictly to <span className="border-b border-primary text-foreground">these approved URLs ↗</span> and stays completely inert until you type <code className="font-mono text-foreground">//</code>. What you type compiles in RAM and vanishes.
              </p>
              <ManifestCard />
            </div>
          </div>
          <div className="mt-16 grid gap-px border bg-border md:grid-cols-2">
            {privacy.map(({ icon: Icon, heading, body }) => (
              <article key={heading} className="bg-background p-7 md:p-9">
                <Icon className="size-5 text-primary" aria-hidden />
                <h3 className="mt-8 text-xl font-semibold">{heading}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{renderCode(body)}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-xs text-muted-foreground md:px-8">
          <span>✦ Patkan — quickly.</span>
          <span>10 free transforms a day.</span>
        </div>
      </footer>
    </div>
  );
}

function Playground() {
  return (
    <div>
      <div className="mx-auto mb-10 max-w-xl text-center">
        <p className="font-mono text-xs uppercase text-primary">Playground</p>
      </div>
      <div className="grid overflow-hidden border bg-border shadow-sm lg:grid-cols-2">
        <div className="bg-background p-5 md:p-7">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold tracking-wider">YOUR THOUGHTS</span>
            <span className="text-muted-foreground">10/day free</span>
          </div>
          <div className="mt-5 min-h-28 border-b text-lg text-muted-foreground">I want to..</div>
          <div className="mt-6">
            <p className="font-mono text-[11px] text-muted-foreground">TARGET AI</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {targetAis.map(([name], index) => (
                <span key={name} className={`rounded-full border px-3 py-1.5 text-xs ${index === 0 ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{name}</span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{targetAis[0][1]}</p>
          </div>
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] text-muted-foreground">PERSONA</p>
              <span className="text-[11px] text-muted-foreground">Custom persona active</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {personas.map(([name], index) => (
                <span key={name} className={`rounded-full border px-3 py-1.5 text-xs ${index === 0 ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{name}</span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{personas[0][1]}</p>
            <label className="mt-5 block text-xs font-medium">Define your custom persona or role:</label>
            <div className="mt-2 rounded-md border px-3 py-2.5 text-xs text-muted-foreground">e.g. Senior Security Auditor, Fintech Regulatory Lead, Creative Director...</div>
          </div>
          <span className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground">
            <Sparkles className="size-4" aria-hidden /> Patkan it
          </span>
        </div>
        <div className="flex min-h-[38rem] flex-col bg-muted/40 p-5 md:p-7">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider">COMPILED PROMPT</span>
            <span className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs"><Copy className="size-4" aria-hidden /> Copy</span>
          </div>
          <div className="mt-5 flex-1 space-y-3 font-mono text-xs leading-relaxed text-muted-foreground">
            <p className="text-foreground">Ready</p>
            <div className="h-px w-full bg-border" />
            <div className="h-px w-4/5 bg-border" />
            <div className="h-px w-11/12 bg-border" />
            <div className="h-px w-3/4 bg-border" />
          </div>
          <p className="border-t pt-4 text-xs leading-relaxed text-muted-foreground"><strong className="text-foreground">Assumed:</strong> B2C e-commerce context · Standard multi-step checkout with cart, payment, and confirmation</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["+ Mobile-first focus", "+ B2B Wholesale focus", "+ Payment aggregator migration"].map((item) => (
              <span key={item} className="rounded-full border border-dashed px-3 py-1.5 text-xs text-muted-foreground">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrowserMockup() {
  return (
    <div className="overflow-hidden rounded-md border bg-background shadow-sm">
      <div className="flex items-center gap-2 border-b bg-muted px-4 py-3">
        <span className="size-2.5 rounded-full bg-destructive/70" />
        <span className="size-2.5 rounded-full bg-primary/50" />
        <span className="size-2.5 rounded-full bg-chart-2/60" />
        <div className="ml-3 flex-1 rounded-md bg-background px-3 py-1.5 font-mono text-[10px] text-muted-foreground">chrome://extensions</div>
      </div>
      <div className="p-5 md:p-7">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-medium">Extensions</h3>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">Developer mode <strong className="text-primary">ON</strong></span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-[10px]">
          {['Load unpacked', 'Pack extension', 'Update'].map((item) => <span key={item} className="rounded-md border px-3 py-1.5">{item}</span>)}
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ExtensionCard title="Patkan" version="1.0.0" description="End any prompt with // in ChatGPT, Claude, or Gemini to trigger Patkan." accent />
          <ExtensionCard title="Grammarly" version="14.1.2" description="Improve your writing with real-time grammar and spell checking." />
        </div>
      </div>
    </div>
  );
}

function ExtensionCard({ title, version, description, accent = false }: { title: string; version: string; description: string; accent?: boolean }) {
  return (
    <div className={`border p-4 ${accent ? "border-primary/50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`flex size-9 items-center justify-center rounded-md ${accent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><Sparkles className="size-4" aria-hidden /></div>
        <span className="rounded-full bg-accent px-2 py-1 text-[9px] font-semibold text-accent-foreground">ON</span>
      </div>
      <h4 className="mt-4 text-sm font-medium">{title} <span className="font-normal text-muted-foreground">{version}</span></h4>
      <p className="mt-2 min-h-16 text-[10px] leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-4 flex gap-3 text-[10px] text-muted-foreground"><span>Details</span><span>Remove</span></div>
    </div>
  );
}

function ManifestCard() {
  return (
    <div className="mt-8 overflow-hidden border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <span className="font-mono text-xs font-medium">Hardcoded manifest.json Matches</span>
        <LockKeyhole className="size-4 text-primary" aria-hidden />
      </div>
      <div className="divide-y font-mono text-[11px]">
        {["https://chatgpt.com/*", "https://claude.ai/*", "https://gemini.google.com/*"].map((url) => (
          <div key={url} className="flex items-center justify-between gap-4 px-5 py-3">
            <span className="truncate text-muted-foreground">{url}</span>
            <span className="flex items-center gap-1 text-primary"><Check className="size-3" aria-hidden /> VERIFIED</span>
          </div>
        ))}
      </div>
      <p className="border-t px-5 py-4 text-xs leading-relaxed text-muted-foreground">
        Chrome strictly prevents content scripts from running on any domain not explicitly listed in this match array.
      </p>
    </div>
  );
}

function renderCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part) => part.startsWith("`") && part.endsWith("`") ? <code key={part} className="font-mono text-foreground">{part.slice(1, -1)}</code> : part);
}

function HeartMark({ className }: { className?: string }) {
  return <ShieldCheck className={className} aria-hidden />;
}