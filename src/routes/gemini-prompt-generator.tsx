import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowRight, MousePointer2, ShieldCheck, Zap } from "lucide-react";

import { ldScript, organizationLd, pageLd, softwareLd } from "@/lib/seo";
import patkanMark from "@/assets/patkan-mark.svg";

const DESCRIPTION =
  "Turn a rough thought into an expert Gemini prompt without leaving gemini.google.com. Patkan gives your words the clear sections Gemini follows, the moment you type //.";

export const Route = createFileRoute("/gemini-prompt-generator")({
  head: () => ({
    meta: [
      { title: "Gemini Prompt Generator — Patkan" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Gemini Prompt Generator — Patkan" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://patkan.in/gemini-prompt-generator" },
      { property: "og:image", content: "https://patkan.in/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://patkan.in/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://patkan.in/gemini-prompt-generator" }],
    scripts: [
      ldScript([
        organizationLd,
        softwareLd,
        pageLd({
          name: "Gemini Prompt Generator — Patkan",
          path: "/gemini-prompt-generator",
          description:
            "Turn a rough thought into an expert Gemini prompt without leaving the chat. End your line with // and Patkan rewrites it.",
          dateModified: "2026-09-30",
        }),
      ]),
    ],
  }),
  component: GeminiPromptGenerator,
});

const shell = "mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8";

const exampleBefore = "help me write a cold email to a founder about my analytics tool";

const exampleAfter = `ROLE
Senior B2B copywriter who writes concise, founder-to-founder cold email.

CONTEXT
The sender is reaching out about an analytics product. The recipient is a startup founder with limited time.

TASK
Write a cold outreach email introducing the analytics tool.

OUTPUT FORMAT
Subject line, then body. No sign-off placeholders.

CONSTRAINTS
- Under 120 words
- No buzzwords or hype
- One clear call to action

BEFORE ANSWERING
Check that no fact, number or name has been invented, and that the answer matches the requested format exactly.`;

const steps: [string, string][] = [
  ["Type what you want", "Open gemini.google.com and describe your task in plain, messy words. No structure needed."],
  ["End it with //", "Two slashes at the end of your sentence trigger Patkan. Nothing happens until then."],
  [
    "Watch it become sections",
    "Your thought is replaced in place by a structured Gemini prompt — role, context, task, output format and constraints, each under its own clear heading.",
  ],
];

const faqs = [
  {
    q: "Why does clear structure matter for Gemini?",
    a: "Gemini reads a prompt as one block of text. When the role, the task, the limits and the format are not separated, it fills the gaps itself — padding the answer with chatter, assuming details that were never given, or drifting away from what you asked. Plain uppercase section headings draw those lines for it. Patkan writes them for you.",
  },
  {
    q: "Do I have to leave gemini.google.com to use it?",
    a: "No. Patkan is a browser extension that runs inside the Gemini tab. You type, you finish with //, and your text is rewritten right in the input box — no copying, no switching tabs.",
  },
  {
    q: "Does it work in Google AI Studio too?",
    a: "Yes. Patkan runs on both gemini.google.com and aistudio.google.com, and applies the same sectioned structure in each.",
  },
  {
    q: "What does Patkan actually do to my text?",
    a: "It compiles your rough thought into a structured prompt: it picks an expert role, adds the context and limits Gemini needs, and states the format you want back. You can read and edit the result before you send it.",
  },
  {
    q: "Does it work with other AI tools too?",
    a: "Yes. The same extension works inside ChatGPT, Claude, Microsoft Copilot, Perplexity and more, with the structure adapted to each one. This page is about the Gemini dialect.",
  },
] as const;

const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/patkan-%E2%80%94-instant-expert-p/jcgkfecfliophjfnkokjnifcmalfbnnn";

function downloadExtension() {
  window.open(CHROME_WEB_STORE_URL, "_blank", "noopener,noreferrer");
}

function GeminiPromptGenerator() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className={`${shell} flex h-14 items-center justify-between gap-3 sm:h-16`}>
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <img
              src={patkanMark}
              alt="Patkan"
              width={816}
              height={816}
              className="size-8 shrink-0 rounded-[0.55rem] sm:size-9"
            />
            <span className="truncate text-lg font-semibold tracking-tight sm:text-xl">Patkan</span>
          </Link>
          <button
            onClick={downloadExtension}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:px-4"
          >
            <span className="hidden sm:inline">Add to Desktop</span>
            <span className="sm:hidden">Add</span>
            <ArrowDownToLine className="size-4" aria-hidden />
          </button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className={`${shell} py-16 sm:py-20 lg:py-28`}>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">For Google Gemini</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            A Gemini prompt generator that lives inside Gemini
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Gemini answers best when a prompt has clear, unmistakable boundaries — role, context, task, constraints,
            output format. Writing that by hand every time is tedious. Patkan does it for you: type your rough thought
            on gemini.google.com, end it with{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">//</code>, and it
            becomes a structured Gemini prompt in the blink of an eye.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              onClick={downloadExtension}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:h-10"
            >
              <ArrowDownToLine className="size-4" aria-hidden /> Download the extension
            </button>
            <Link
              to="/"
              hash="playground"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-background px-5 text-sm font-medium shadow-sm transition-colors hover:bg-accent sm:h-10"
            >
              Try the playground <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>

        {/* Before / After */}
        <section className="border-y bg-card py-16 sm:py-20 md:py-24">
          <div className={shell}>
            <div className="mx-auto max-w-xl text-center">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Before → After</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Same thought. Surgically crafted for Gemini.
              </h2>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-px lg:overflow-hidden lg:rounded-lg lg:border lg:bg-border">
              <div className="rounded-lg border bg-background p-5 sm:p-7 lg:rounded-none lg:border-0">
                <p className="text-xs font-semibold tracking-wider">YOU TYPE</p>
                <p className="mt-4 text-base leading-relaxed sm:text-lg">
                  {exampleBefore}{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-primary">//</code>
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-5 sm:p-7 lg:rounded-none lg:border-0">
                <p className="text-xs font-semibold tracking-wider">GEMINI RECEIVES</p>
                <pre className="mt-4 overflow-auto rounded-md border bg-background p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words text-foreground/90 sm:text-xs">
                  {exampleAfter}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className={`${shell} py-16 sm:py-20 md:py-24`}>
          <div aria-hidden className="h-[3px] w-full bg-primary" />
          <h2 className="mt-10 text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map(([title, detail], index) => (
              <li key={title} className="relative">
                <span className="font-mono text-3xl tracking-tight text-foreground/25">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{detail}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Trust strip */}
        <section className="border-y bg-card py-16 sm:py-20">
          <div className={`${shell} grid gap-8 md:grid-cols-3`}>
            {[
              {
                icon: MousePointer2,
                heading: "Nothing leaves the page until //",
                body: "Patkan takes no action until you deliberately end a sentence with two slashes.",
              },
              {
                icon: Zap,
                heading: "Dialects, not templates",
                body: "Gemini gets sections. Claude gets XML. ChatGPT gets markdown. Each model receives the structure it respects.",
              },
              {
                icon: ShieldCheck,
                heading: "Open and auditable",
                body: "Patkan is open source under AGPL-3.0. Every line is on GitHub, there for anyone to read.",
              },
            ].map(({ icon: Icon, heading, body }) => (
              <article key={heading}>
                <span className="grid size-9 place-items-center rounded-md border bg-background">
                  <Icon className="size-4 text-primary" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{heading}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className={`${shell} py-16 sm:py-20 md:py-24`}>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Questions</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Gemini + Patkan, answered</h2>
          <div className="mt-10 divide-y rounded-lg border">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium sm:text-lg [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="font-mono text-primary transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t bg-card py-16 sm:py-20">
          <div className={`${shell} flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between`}>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Start prompting Gemini patkan.</h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                10 transforms a day in ghost mode. No sign-up to start.
              </p>
            </div>
            <button
              onClick={downloadExtension}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:h-10"
            >
              <ArrowDownToLine className="size-4" aria-hidden /> Download the extension
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className={`${shell} flex flex-wrap items-center justify-end gap-3 py-8 text-xs text-muted-foreground`}>
          <Link to="/about" className="transition-colors hover:text-foreground">
            About
          </Link>
          <Link to="/chatgpt-prompt-generator" className="transition-colors hover:text-foreground">
            ChatGPT prompt generator
          </Link>
          <Link to="/claude-prompt-generator" className="transition-colors hover:text-foreground">
            Claude prompt generator
          </Link>
          <Link to="/privacy" className="transition-colors hover:text-foreground">
            Privacy Policy
          </Link>
          <Link to="/terms" className="transition-colors hover:text-foreground">
            Terms of Use
          </Link>
          <Link to="/" className="transition-colors hover:text-foreground">
            Back to patkan.in
          </Link>
        </div>
      </footer>
    </div>
  );
}
