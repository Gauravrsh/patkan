import { Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowRight } from "lucide-react";

import patkanMark from "@/assets/patkan-mark.svg";

export type PlatformFaq = { q: string; a: string };

export type PlatformPageContent = {
  eyebrow: string;
  h1: string;
  intro: string[];
  sectionH2: string;
  before: string;
  after: string;
  platformName: string;
  steps: [string, string][];
  faqs: readonly PlatformFaq[];
};

const shell = "mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8";

const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/patkan-%E2%80%94-instant-expert-p/jcgkfecfliophjfnkokjnifcmalfbnnn";

function openStore() {
  window.open(CHROME_WEB_STORE_URL, "_blank", "noopener,noreferrer");
}

const primaryBtn =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:h-10";

export function PlatformGeneratorPage({ c }: { c: PlatformPageContent }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className={`${shell} flex h-14 items-center justify-between gap-3 sm:h-16`}>
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <img src={patkanMark} alt="Patkan" width={816} height={816} className="size-8 shrink-0 rounded-[0.55rem] sm:size-9" />
            <span className="truncate text-lg font-semibold tracking-tight sm:text-xl">Patkan</span>
          </Link>
          <button onClick={openStore} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:px-4">
            <span className="hidden sm:inline">Add to Desktop</span>
            <span className="sm:hidden">Add</span>
            <ArrowDownToLine className="size-4" aria-hidden />
          </button>
        </div>
      </header>

      <main>
        <section className={`${shell} py-16 sm:py-20 lg:py-28`}>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">{c.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{c.h1}</h1>
          {c.intro.map((p) => (
            <p key={p} className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{p}</p>
          ))}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button onClick={openStore} className={primaryBtn}>
              <ArrowDownToLine className="size-4" aria-hidden /> Add Patkan to Desktop
            </button>
            <Link to="/" hash="playground" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-background px-5 text-sm font-medium shadow-sm transition-colors hover:bg-accent sm:h-10">
              Try the playground <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </section>

        <section className="border-y bg-card py-16 sm:py-20">
          <div className={shell}>
            <div className="mx-auto max-w-xl text-center">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Before → After</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{c.sectionH2}</h2>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border bg-background p-5 sm:p-7">
                <p className="text-xs font-semibold tracking-wider">YOU TYPE</p>
                <p className="mt-4 text-base leading-relaxed sm:text-lg">
                  {c.before.replace(/\/\/$/, "")}
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-primary">//</code>
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-5 sm:p-7">
                <p className="text-xs font-semibold tracking-wider">{c.platformName.toUpperCase()} RECEIVES</p>
                <pre className="mt-4 overflow-auto rounded-md border bg-background p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words text-foreground/90">{c.after}</pre>
              </div>
            </div>
          </div>
        </section>

        <section className={`${shell} py-16 sm:py-20`}>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {c.steps.map(([title, detail], i) => (
              <li key={title}>
                <span className="font-mono text-3xl tracking-tight text-foreground/25">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={`${shell} border-t py-16 sm:py-20`}>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Questions</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{c.platformName} + Patkan, answered</h2>
          <div className="mt-10 divide-y rounded-lg border">
            {c.faqs.map(({ q, a }) => (
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
      </main>

      <footer className="border-t">
        <div className={`${shell} flex flex-wrap items-center justify-end gap-3 py-8 text-xs text-muted-foreground`}>
          <Link to="/chatgpt-prompt-generator" className="hover:text-foreground">ChatGPT prompt generator</Link>
          <Link to="/claude-prompt-generator" className="hover:text-foreground">Claude prompt generator</Link>
          <Link to="/gemini-prompt-generator" className="hover:text-foreground">Gemini prompt generator</Link>
          <Link to="/copilot-prompt-generator" className="hover:text-foreground">Copilot prompt generator</Link>
          <Link to="/perplexity-prompt-generator" className="hover:text-foreground">Perplexity prompt generator</Link>
          <Link to="/deepseek-prompt-generator" className="hover:text-foreground">DeepSeek prompt generator</Link>
          <Link to="/promptperfect-alternative" className="hover:text-foreground">PromptPerfect alternative</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground">Terms of Use</Link>
        </div>
      </footer>
    </div>
  );
}

export function platformHead(path: string, title: string, description: string, ld: { children: string; type: string }) {
  const url = `https://patkan.in${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [ld],
  };
}
