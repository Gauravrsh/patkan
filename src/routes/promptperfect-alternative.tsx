import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowRight } from "lucide-react";

import { CWS_URL, faqLd, ldScript, organizationLd, pageLd, softwareLd } from "@/lib/seo";
import patkanMark from "@/assets/patkan-mark.svg";

const TITLE = "PromptPerfect Alternative That Works Inside Your AI Chat | Patkan";
const DESCRIPTION =
  "PromptPerfect has shut down. Patkan turns a rough thought into a structured prompt inside ChatGPT, Claude and Gemini. End your sentence with // and review before you send.";
const SOURCE_URL = "https://www.preprompt.org/blog/promptperfect-alternatives";

const faqs = [
  {
    q: "What happened to PromptPerfect?",
    a: "PromptPerfect announced that it shut down on 1 September 2026, with user data deleted on 1 October 2026. This page was last checked on 21 October 2026. Source: PrePrompt’s PromptPerfect alternatives guide.",
  },
  {
    q: "Is Patkan the same as PromptPerfect?",
    a: "No. They are different products. Patkan is a browser extension for rewriting a rough thought into a structured prompt inside supported AI chat inputs. It is not a migration service and cannot recover PromptPerfect prompts or account data.",
  },
  {
    q: "Which AI chats does Patkan support?",
    a: "Patkan works inside ChatGPT, Claude, Gemini and other supported AI assistants. The prompt format adapts to the chat: for example, Claude receives labeled XML sections while ChatGPT receives clear markdown sections.",
  },
  {
    q: "Do I have to learn prompt engineering to use Patkan?",
    a: "No. Start with the outcome you want in ordinary language. Patkan supplies useful structure—such as role, context, task, constraints and output format—after you end the thought with //.",
  },
  {
    q: "Does Patkan send text before I trigger it?",
    a: "No. Patkan activates only when you explicitly end the sentence with //. Review the rewritten prompt in the chat input before you send it.",
  },
] as const;

export const Route = createFileRoute("/promptperfect-alternative")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://patkan.in/promptperfect-alternative" },
      { property: "og:image", content: "https://patkan.in/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://patkan.in/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://patkan.in/promptperfect-alternative" }],
    scripts: [
      ldScript([
        organizationLd,
        softwareLd,
        pageLd({
          name: TITLE,
          path: "/promptperfect-alternative",
          description: DESCRIPTION,
          dateModified: "2026-10-21",
        }),
        faqLd(faqs),
      ]),
    ],
  }),
  component: PromptPerfectAlternative,
});

const shell = "mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8";

const exampleBefore = "Write a follow-up email for a prospect who stopped replying after our product demo";

const exampleAfter = `## Role
You are a B2B sales professional who writes short, respectful follow-up emails.

## Context
A prospect attended a product demo and has not replied since.

## Task
Write a follow-up email that restarts the conversation without pressure.

## Constraints
- Under 120 words
- Reference the demo once
- One clear, easy next step

## Output format
Subject line, then the email body.`;

const rows: [string, string][] = [
  ["A clearer prompt from a rough idea", "Turns your sentence into a structured prompt"],
  ["To stay in your usual AI chat", "Works in the chat input itself"],
  ["Structure suited to the model", "Uses a model-aware format for ChatGPT, Claude and Gemini"],
  ["Control before sending", "Replaces the draft in the input box so you can read and edit it"],
];

const steps: [string, string][] = [
  ["Write your request in plain English", "Describe the outcome you want. It does not need to be formatted as a prompt."],
  ["End it with //", "Patkan only activates when you deliberately add // at the end of your sentence."],
  [
    "Review the structured prompt",
    "Patkan rewrites the thought in the input box. You remain in control of what goes to the AI model.",
  ],
];

function downloadExtension() {
  window.open(CWS_URL, "_blank", "noopener,noreferrer");
}

const slash = <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-primary">//</code>;

function PromptPerfectAlternative() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className={`${shell} flex h-14 items-center justify-between gap-3 sm:h-16`}>
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <img src={patkanMark} alt="Patkan" width={816} height={816} className="size-8 shrink-0 rounded-[0.55rem] sm:size-9" />
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
        <section className={`${shell} py-14 sm:py-20 lg:py-24`}>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">PromptPerfect alternative</p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Looking for a PromptPerfect alternative that works where you already write?
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            PromptPerfect has shut down. Patkan is a browser extension that turns a rough thought into a structured
            prompt inside ChatGPT, Claude, Gemini and other AI chats. Type what you need, end the sentence with {slash},
            then review the rewritten prompt before you send it.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              onClick={downloadExtension}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:h-10"
            >
              <ArrowDownToLine className="size-4" aria-hidden /> Add Patkan to Desktop
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

        <section className="border-y bg-card py-14 sm:py-20">
          <div className={shell}>
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-primary">PromptPerfect alternative, at a glance</h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed sm:text-lg">
              PromptPerfect focused on improving prompts through its own product experience. Patkan works inside the AI
              chat you already use. There is no separate prompt workspace to open, copy from, or move between.
            </p>
            <div className="mt-8 overflow-hidden rounded-lg border bg-background">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-4 font-semibold">If you need…</th>
                    <th className="p-4 font-semibold">Patkan does this</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map(([need, does]) => (
                    <tr key={need}>
                      <td className="p-4 align-top">{need}</td>
                      <td className="p-4 align-top text-muted-foreground">{does}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className={`${shell} py-14 sm:py-20`}>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Before → After</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">Start with the thought you already have.</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-background p-5 sm:p-7">
              <p className="text-xs font-semibold tracking-wider">YOU TYPE</p>
              <p className="mt-4 text-base leading-relaxed sm:text-lg">
                {exampleBefore}
                {slash}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-5 sm:p-7">
              <p className="text-xs font-semibold tracking-wider">PATKAN RETURNS</p>
              <pre className="mt-4 overflow-auto whitespace-pre-wrap break-words rounded-md border bg-background p-4 font-mono text-[11px] leading-relaxed text-foreground/90 sm:text-xs">
                {exampleAfter}
              </pre>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground">
            The prompt stays in your chat input. Edit it, keep it, undo it, or send it when it says what you mean.
          </p>
        </section>

        <section className="border-y bg-card py-14 sm:py-20">
          <div className={shell}>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">How Patkan works</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {steps.map(([title, detail], i) => (
                <li key={title}>
                  <span className="font-mono text-3xl tracking-tight text-foreground/25">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={`${shell} py-14 sm:py-20`}>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Why people use an in-chat prompt alternative</p>
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">
            The hard part is not opening another prompt tool. It is remembering prompt structure while you work.
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
            A useful AI prompt usually needs context, a clear task, boundaries and a requested output format. Patkan
            turns a rough instruction into that structure at the moment you need it—inside the ChatGPT, Claude or Gemini
            conversation already open.
          </p>
        </section>

        <section className="border-t bg-card py-14 sm:py-20">
          <div className={shell}>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">Questions</h2>
            <div className="mt-10 divide-y rounded-lg border bg-background">
              {faqs.map(({ q, a }, i) => (
                <details key={q} className="group p-5 sm:p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium sm:text-lg [&::-webkit-details-marker]:hidden">
                    {q}
                    <span className="font-mono text-primary transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                    {i === 0 ? (
                      <>
                        PromptPerfect announced that it shut down on 1 September 2026, with user data deleted on 1 October
                        2026. This page was last checked on 21 October 2026. Source:{" "}
                        <a href={SOURCE_URL} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-foreground">
                          PrePrompt’s PromptPerfect alternatives guide
                        </a>
                        .
                      </>
                    ) : (
                      a
                    )}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={`${shell} flex flex-col items-start gap-6 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-20`}>
          <h2 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            Replace the missing prompt tool with a workflow that stays in your chat.
          </h2>
          <button
            onClick={downloadExtension}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:h-10"
          >
            <ArrowDownToLine className="size-4" aria-hidden /> Add Patkan to Desktop
          </button>
        </section>
      </main>

      <footer className="border-t">
        <div className={`${shell} flex flex-wrap items-center justify-end gap-3 py-8 text-xs text-muted-foreground`}>
          <Link to="/chatgpt-prompt-generator" className="hover:text-foreground">ChatGPT prompt generator</Link>
          <Link to="/claude-prompt-generator" className="hover:text-foreground">Claude prompt generator</Link>
          <Link to="/gemini-prompt-generator" className="hover:text-foreground">Gemini prompt generator</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms of Use</Link>
          <Link to="/" className="hover:text-foreground">Back to patkan.in</Link>
        </div>
      </footer>
    </div>
  );
}
