import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";

import { ldScript, organizationLd, pageLd } from "@/lib/seo";
import skillText from "../../.agents/skills/noghaan/SKILL.md?raw";

const TITLE = "NoGhaan: an AI skill to stop AI from making things up";
const DESC =
  "NoGhaan is a copy-paste AI skill that tells ChatGPT, Claude, Gemini, or another AI to separate verified facts from guesses, state assumptions, say \u201cI don\u2019t know\u201d when evidence is missing, and cut long filler.";
const URL = "https://patkan.in/noghaan";

export const Route = createFileRoute("/noghaan")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      ldScript([
        organizationLd,
        pageLd({ name: TITLE, path: "/noghaan", description: DESC, dateModified: "2026-10-22" }),
      ]),
    ],
  }),
  component: NoGhaanPage,
});

const shell = "mx-auto w-full max-w-3xl px-5 sm:px-6 lg:px-8";

const changes: [string, string][] = [
  ["Filling gaps with plausible guesses", "DATA GAP: followed by what is known and what is missing"],
  ["Treating an assumption as fact", "An explicit assumption, or a question before proceeding"],
  ["Agreeing with a wrong premise", "A direct correction in the first line"],
  ["Giving an answer with no evidence", "A source, a stated basis, or an UNVERIFIED label"],
  ["Writing long, polished filler", "The shortest answer that fully answers the question"],
  ["Claiming a task was tested or fixed", "The check that proves it"],
];

const downloads = [
  { label: "Download skill as Markdown", href: "/noghaan/noghaan-skill.md" },
  { label: "Download skill as TXT", href: "/noghaan/noghaan-skill.txt" },
  { label: "Download skill as PDF", href: "/noghaan/noghaan-skill.pdf" },
];

function CopyButton({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(skillText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 ${className}`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy NoGhaan skill"}
    </button>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-2xl leading-tight sm:text-3xl">{children}</h2>;
}

function NoGhaanPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur-md">
        <div className={`${shell} flex h-14 items-center justify-between gap-3 sm:h-16`}>
          <span className="font-serif text-lg">NoGhaan</span>
          <CopyButton />
        </div>
      </header>

      <main className={`${shell} space-y-16 py-14 sm:py-20`}>
        <section className="space-y-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            A no-slop skill for AI
          </p>
          <h1 className="font-serif text-4xl leading-[1.05] sm:text-6xl">Stop AI from making things up.</h1>
          <p className="text-lg leading-relaxed">{DESC.replace("cut long filler.", "cut long filler from its answer.")}</p>
          <p className="text-muted-foreground">Use it when you need a factual answer\u2014not a confident-sounding one.</p>
          <a href="#skill" className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline">
            Read the skill \u2193
          </a>
        </section>

        <section className="space-y-5">
          <H2>What it tells an AI to do differently</H2>
          <div className="overflow-hidden rounded-xl border">
            <div className="grid grid-cols-2 border-b bg-muted text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <div className="p-3">Instead of</div>
              <div className="p-3">NoGhaan asks for</div>
            </div>
            {changes.map(([a, b]) => (
              <div key={a} className="grid grid-cols-2 border-b text-sm last:border-b-0">
                <div className="p-3 text-muted-foreground">{a}</div>
                <div className="p-3">{b}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            NoGhaan does not make an AI truthful. It makes the AI show its uncertainty, evidence, and assumptions more clearly.
          </p>
        </section>

        <section className="space-y-5">
          <H2>Use NoGhaan when being wrong has a cost.</H2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium">Use it for</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                <li>Research, comparisons, and fact-checking</li>
                <li>Legal, financial, medical, policy, or technical questions</li>
                <li>Product decisions based on incomplete information</li>
                <li>Reviewing claims, metrics, dates, prices, or quotations</li>
                <li>Any task where you need the AI to ask before it assumes</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Do not use it by default for</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                <li>Fiction, brainstorming, naming, or mood boards</li>
                <li>First drafts where speed matters more than verification</li>
                <li>Open-ended creative exploration</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            It may make the AI slower and more likely to stop for missing information. That is intentional.
          </p>
        </section>

        <section className="space-y-5">
          <H2>The difference is not confidence. It is traceability.</H2>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="rounded-xl border p-4">
              <figcaption className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Without NoGhaan</figcaption>
              <blockquote className="text-sm">\u201cYes, this is the best option. It will reduce costs and improve results significantly.\u201d</blockquote>
            </figure>
            <figure className="rounded-xl border border-primary/40 p-4">
              <figcaption className="mb-2 text-xs font-medium uppercase tracking-wider text-primary">With NoGhaan</figcaption>
              <blockquote className="space-y-2 font-mono text-xs leading-relaxed">
                <p>UNVERIFIED: I do not have your current costs, alternatives, or outcome data.</p>
                <p>DATA GAP: I can compare the options once you provide price, expected usage, and the result you want to improve.</p>
                <p>INFERENCE: Without those inputs, calling one option \u201cbest\u201d would be a guess.</p>
              </blockquote>
            </figure>
          </div>
        </section>

        <section id="skill" className="scroll-mt-20 space-y-5">
          <H2>Copy the complete NoGhaan skill</H2>
          <p className="text-muted-foreground">
            Paste this skill into an AI chat before your question, or add it to an AI tool\u2019s instructions.
          </p>
          <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-xl border bg-muted p-4 font-mono text-xs leading-relaxed">
            {skillText}
          </pre>
          <div className="flex flex-wrap gap-3">
            <CopyButton />
            {downloads.map((d) => (
              <a
                key={d.href}
                href={d.href}
                download
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-muted"
              >
                <Download className="h-4 w-4" />
                {d.label}
              </a>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <H2>AI can sound certain without being certain.</H2>
          <p className="leading-relaxed">
            Language models can produce a plausible answer even when the question leaves out important facts. They can repeat an unverified claim, assume a missing detail, invent a source, or add words that make a thin answer sound complete.
          </p>
          <p className="leading-relaxed">
            NoGhaan is a skill for that behaviour. It asks the AI to make the difference between evidence, inference, and uncertainty visible to you.
          </p>
        </section>

        <section className="space-y-4 border-t pt-12">
          <H2>Turn rough intent into a clearer prompt.</H2>
          <p className="leading-relaxed">
            NoGhaan helps you inspect an AI answer. Patkan helps you structure what you ask before the answer is generated.
          </p>
          <Link to="/" className="inline-block font-medium text-primary underline-offset-4 hover:underline">
            Try Patkan \u2192
          </Link>
        </section>
      </main>
    </div>
  );
}
