import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine } from "lucide-react";

import { CWS_URL, GITHUB_URL, ldScript, organizationLd, pageLd, softwareLd } from "@/lib/seo";
import patkanMark from "@/assets/patkan-mark.svg";

const TITLE = "About Patkan | AI Prompt Engineer for professionals";
const DESC =
  "Patkan is an open-source browser extension that instantly turns rough thoughts into perfectly structured prompts for ChatGPT, Claude, and Gemini and more AI assistants just by typing // at the end of rough sentence.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://patkan.in/about" },
      { property: "og:image", content: "https://patkan.in/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://patkan.in/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://patkan.in/about" }],
    scripts: [
      ldScript([
        organizationLd,
        softwareLd,
        pageLd({ name: TITLE, path: "/about", description: DESC, dateModified: "2026-10-01" }),
      ]),
    ],
  }),
  component: AboutPage,
});

const shell = "mx-auto w-full max-w-3xl px-5 sm:px-6 lg:px-8";

const sections: { heading: string; body: string[] }[] = [
  {
    heading: "The problem with rough thoughts",
    body: [
      "When you type a quick, messy thought into an AI chat, the model has to guess a lot, like your role, its own role, your task, your constraints, information that it has and the information that it needs to look for or assume and the output format you need. Those guesses are exactly where things go wrong: made-up details stated with total confidence, two-page essays when you only needed three bullet points, or frustrating generic corporate AI fluff.",
      "The standard industry advice is to \u201clearn prompt engineering\u201d - add system directives, specify XML delimiters, and write elaborate guardrails. But if you work in marketing, HR, sales, legal, finance, or run a business, wrestling with prompt syntax is an unwanted task, not your job. AI was supposed to take care of all this.",
    ],
  },
  {
    heading: "Right inside your chat window",
    body: [
      "Patkan is a lightweight desktop browser extension that does the prompt engineering for you. It activates only when you type // at the end of your sentence inside your AI chat box like ChatGPT, Claude, Gemini etc.",
      "In the blink of an eye, your rough thought is replaced by a structured, high-quality prompt complete with a clear role, context, task boundaries, and output format\u2014tailored specifically to the AI model you are using.",
      "There is no tab switching, no copying and pasting from external prompt libraries, and no complex configuration. Patkan works natively inside ChatGPT, Claude, Google Gemini, Microsoft Copilot, Perplexity, Google AI Studio and more AI assistant models.",
    ],
  },
  {
    heading: "Envisioned and Made in India",
    body: [
      "The name originates from the Marathi word \u201c\u092a\u091f\u094d\u0915\u0928\u201d (patkan), which translates to \u201cinstantly\u201d or \u201cin a snap.\u201d",
      "The tool was born out of personal frustration with the gap between having a quick thought and actually getting a usable, hallucination-free answer from modern AI chatbots. The solution was to type 300 words well structured prompts all the time, which is time consuming and everyone doesn\u2019t know that. Patkan was built to make AI feel \u2018intelligent\u2019 again.",
    ],
  },
  {
    heading: "Open source, zero surveillance",
    body: [
      "Trust is critical when it comes to your browser. The core code behind Patkan is free and open-source under the GNU AGPL-3.0 license on GitHub. Anyone can inspect the code, review the extension manifests, or run their own local copy.",
      "Patkan is built with zero advertising trackers and no user profiling. Your prompts (raw thoughts) are processed solely to return a structured prompt, and an anonymous cache ensures that repeat transforms happen instantly. The extension is completely deaf until you type // and blind to every website not explicitly listed in its permissions.",
    ],
  },
];

function downloadExtension() {
  window.open(CWS_URL, "_blank", "noopener,noreferrer");
}

function AboutPage() {
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
            <span className="truncate text-lg font-semibold tracking-tight sm:text-xl">patkan.in</span>
          </Link>
          <span className="font-mono text-sm text-muted-foreground">/&#2346;&#2335;&#2381;&#2325;&#2344;/</span>
        </div>
      </header>

      <main>
        <section className={`${shell} py-16 sm:py-20`}>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">About Patkan</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            A prompt engineering tool for all professionals.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Nobody wants to learn &ldquo;prompt engineering&rdquo; or &ldquo;context engineering&rdquo;. You just want
            ChatGPT, Claude, Gemini, Copilot or your AI assistant to answer your question or get the job done without
            making things up or throwing a five-page write up in your face. Patkan was built to solve this problem.
          </p>
          <div className="mt-8">
            <button
              onClick={downloadExtension}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:h-10"
            >
              <ArrowDownToLine className="size-4" aria-hidden /> Download the extension
            </button>
          </div>
          <span className="mt-8 block h-px w-16 bg-primary" aria-hidden />
        </section>

        <div className={`${shell}`}>
          {sections.map(({ heading, body }, index) => (
            <section key={heading} className="border-b py-10 sm:py-12">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-sm tracking-widest text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{heading}</h2>
              </div>
              <div className="mt-5 space-y-4 pl-0 sm:pl-9">
                {body.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <section className="border-b py-10 sm:py-12">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-sm tracking-widest text-muted-foreground">05</span>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Fair-use limits</h2>
            </div>
            <div className="mt-5 space-y-4 pl-0 sm:pl-9">
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                Patkan is currently completely free to use. To protect server capacity and prevent automated abuse,
                simple fair-use limits apply:
              </p>
              <ul className="max-w-2xl list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                <li>Unauthenticated Guest users: Up to 10 prompt transforms per day.</li>
                <li>Signed-in users: Up to 50 prompt transforms per day.</li>
              </ul>
            </div>
          </section>

          <section className="py-12">
            <div className="rounded-lg border bg-card p-6 sm:p-8">
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                Questions, feedback, or ideas? Write to{" "}
                <a
                  href="mailto:contact@patkan.in"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  contact@patkan.in
                </a>
                .
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t">
        <div className={`${shell} flex flex-wrap items-center justify-between gap-3 py-8 text-xs text-muted-foreground`}>
          <p>patkan.in</p>
          <nav className="flex flex-wrap items-center gap-4" aria-label="Site">
            <Link to="/privacy" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-foreground">
              Terms of Use
            </Link>
            <Link to="/chatgpt-prompt-generator" className="transition-colors hover:text-foreground">
              ChatGPT prompt generator
            </Link>
            <Link to="/claude-prompt-generator" className="transition-colors hover:text-foreground">
              Claude prompt generator
            </Link>
            <Link to="/gemini-prompt-generator" className="transition-colors hover:text-foreground">
              Gemini prompt generator
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub (AGPL-3.0)
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
