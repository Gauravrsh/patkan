import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowRight, Check, MousePointer2, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";

import patkanMark from "@/assets/patkan-mark.svg";

export const Route = createFileRoute("/claude-prompt-generator")({
  head: () => ({
    meta: [
      { title: "Claude Prompt Generator — Patkan" },
      {
        name: "description",
        content:
          "Turn a rough thought into an expert Claude prompt without leaving claude.ai. Patkan wraps your words in Claude-specific XML tags the moment you type //.",
      },
      { property: "og:title", content: "Claude Prompt Generator — Patkan" },
      {
        property: "og:description",
        content:
          "Turn a rough thought into an expert Claude prompt without leaving claude.ai. Patkan wraps your words in Claude-specific XML tags the moment you type //.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://patkan.in/claude-prompt-generator" },
      { property: "og:image", content: "https://patkan.in/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://patkan.in/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://patkan.in/claude-prompt-generator" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Claude Prompt Generator — Patkan",
          url: "https://patkan.in/claude-prompt-generator",
          description:
            "Turn a rough thought into an expert Claude prompt without leaving claude.ai, using Patkan's Claude XML dialect.",
          isPartOf: { "@type": "WebSite", name: "Patkan", url: "https://patkan.in/" },
        }),
      },
    ],
  }),
  component: ClaudePromptGenerator,
});

const shell = "mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8";

const exampleBefore = "help me write a cold email to a founder about my analytics tool";

const exampleAfter = `<role>You are a senior B2B copywriter who writes concise, founder-to-founder cold email.</role>

<context>The sender is reaching out about an analytics product. The recipient is a startup founder with limited time.</context>

<task>Write a cold outreach email introducing the analytics tool.</task>

<constraints>
- Under 120 words
- No buzzwords or hype
- One clear call to action
</constraints>

<output_format>Subject line, then body. No sign-off placeholders.</output_format>`;

const steps: [string, string][] = [
  ["Type what you want", "Open claude.ai and describe your task in plain, messy words. No structure needed."],
  ["End it with //", "Two slashes at the end of your sentence trigger Patkan. Nothing happens until then."],
  [
    "Watch it become XML",
    "Your thought is replaced in place by a structured Claude prompt — role, context, task, constraints, and output format wrapped in the XML tags Claude follows best.",
  ],
];

const faqs = [
  {
    q: "Why do XML tags matter for Claude?",
    a: "Anthropic's own prompting guidance recommends separating a prompt into clearly labeled XML sections — role, context, task, constraints, output format. Claude parses these boundaries more reliably than a wall of prose, which means fewer misunderstandings and better first answers. Patkan applies that structure for you automatically.",
  },
  {
    q: "Do I have to leave claude.ai to use it?",
    a: "No. Patkan is a browser extension that runs inside the Claude tab. You type, you finish with //, and your text is transformed right in the input box — no copy-pasting, no switching tabs.",
  },
  {
    q: "What does Patkan actually do to my text?",
    a: "It compiles your rough thought into a structured prompt: it picks an expert persona, adds the context and constraints Claude needs, and wraps each section in XML tags. You can review and edit the result before sending it.",
  },
  {
    q: "Does it work with other AI tools too?",
    a: "Yes. The same extension works inside ChatGPT, Gemini, Microsoft Copilot, Perplexity, and more — with the output format adapted to each model. This page just focuses on the Claude XML dialect.",
  },
] as const;

function downloadExtension() {
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

function ClaudePromptGenerator() {
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
            <span className="hidden sm:inline">Get Extension</span>
            <span className="sm:hidden">Get</span>
            <ArrowDownToLine className="size-4" aria-hidden />
          </button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className={`${shell} py-16 sm:py-20 lg:py-28`}>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">For Anthropic Claude</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            A Claude prompt generator that lives inside Claude
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Claude answers best when a prompt is split into labeled XML sections — role, context, task, constraints,
            output format. Writing that by hand every time is tedious. Patkan does it for you: type your rough thought
            on claude.ai, end it with <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">//</code>,
            and it becomes a structured Claude prompt in the blink of an eye.
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
                Same thought. Surgically crafted for Claude.
              </h2>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-px lg:overflow-hidden lg:rounded-lg lg:border lg:bg-border">
              <div className="rounded-lg border bg-background p-5 sm:p-7 lg:rounded-none lg:border-0">
                <p className="text-xs font-semibold tracking-wider">YOU TYPE</p>
                <p className="mt-4 text-base leading-relaxed sm:text-lg">
                  {exampleBefore} <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-primary">//</code>
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-5 sm:p-7 lg:rounded-none lg:border-0">
                <p className="text-xs font-semibold tracking-wider">CLAUDE RECEIVES</p>
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
                body: "Claude gets XML. ChatGPT gets markdown. Gemini gets sections. Each model receives the structure it respects.",
              },
              {
                icon: ShieldCheck,
                heading: "Open and auditable",
                body: "Installed unpacked as plain JavaScript — open the folder and inspect every line before you load it.",
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
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Claude + Patkan, answered</h2>
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
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Start prompting Claude patkan.</h2>
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
          <Link to="/" className="transition-colors hover:text-foreground">
            Back to patkan.in
          </Link>
        </div>
      </footer>
    </div>
  );
}
