import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownToLine, Check, ChevronDown, Copy, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

import patkanMark from "@/assets/patkan-mark.svg";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trackEvent } from "@/lib/telemetry";

import { ldScript, organizationLd, pageLd } from "@/lib/seo";
import skillText from "../../.agents/skills/noghaan/SKILL.md?raw";

const TITLE = "NoGhaan: an AI skill to stop AI from making things up";
const DESC =
  "An AI skill for ChatGPT, Claude, Gemini and more to verify facts, present proof, ask questions and not assume to reduce bloat and hallucinations.";
const URL = "https://patkan.in/noghaan";
const OG_IMAGE = "https://patkan.in/noghaan/og-image-v2.jpg?v=2";

export const Route = createFileRoute("/noghaan")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "640" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
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

const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/patkan-%E2%80%94-instant-expert-p/jcgkfecfliophjfnkokjnifcmalfbnnn";

const shares = {
  noghaan: {
    title: "NoGhaan: The Anti-Slop AI Skill",
    url: "https://patkan.in/noghaan",
    text: "An AI skill for ChatGPT, Claude, Gemini and more AI, that forces AI to verify facts, stop assuming and stop hallucinating.",
  },
  patkan: {
    title: "Patkan - AI Prompt Generator & Enhancer",
    url: "https://patkan.in",
    text: "Turn rough thoughts into expert prompts inside ChatGPT, Claude & Gemini. Just end your sentence with //.",
  },
};

async function doShare(kind: keyof typeof shares) {
  const s = shares[kind];
  trackEvent("share_clicked", { meta: { target: kind } });
  if (navigator.share) {
    try { await navigator.share(s); } catch { /* cancelled */ }
    return;
  }
  try { await navigator.clipboard.writeText(s.url); toast.success("Link copied"); }
  catch { toast.error("Couldn't copy the link"); }
}

const downloads = [
  { label: "Markdown (.md)", href: "/noghaan/noghaan-skill.md" },
  { label: "Plain text (.txt)", href: "/noghaan/noghaan-skill.txt" },
  { label: "PDF (.pdf)", href: "/noghaan/noghaan-skill.pdf" },
];

function Terminal({ name, actions, children }: { name: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-muted">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">{name}</span>
        <div className="flex items-center gap-1">{actions}</div>
      </div>
      {children}
    </div>
  );
}

function CopyIcon() {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(skillText);
    trackEvent("download_clicked", { meta: { file: "noghaan-copy" } });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <Button variant="ghost" size="icon" aria-label="Copy skill" title={copied ? "Copied" : "Copy skill"} onClick={() => void copy()}>
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </Button>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-2xl leading-tight text-foreground sm:text-3xl">{children}</h2>;
}

function NoGhaanPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className={`${shell} flex h-14 items-center justify-between gap-3 sm:h-16`}>
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img src={patkanMark} alt="Patkan" width={816} height={816} className="size-8 rounded-[0.55rem]" />
            <span className="text-lg font-semibold tracking-tight">Patkan</span>
            <span className="hidden rounded-full border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">/पट्कन/</span>
            <span className="truncate font-mono text-xs text-muted-foreground">/noghaan</span>
          </Link>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5" aria-label="Share">
                  <Share2 className="size-4" /><span className="hidden sm:inline">Share</span><ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => void doShare("noghaan")}>Share NoGhaan AI Skill</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void doShare("patkan")}>Share Patkan extension</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              className="inline-flex shrink-0 gap-1.5 px-3 sm:px-4"
              onClick={() => {
                trackEvent("download_clicked", { meta: { file: "chrome-web-store" } });
                window.open(CHROME_WEB_STORE_URL, "_blank", "noopener,noreferrer");
              }}
            >
              <span className="hidden sm:inline">Add to Desktop</span>
              <span className="sm:hidden">Add</span>
              <ArrowDownToLine className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </header>

      <main className={`${shell} space-y-12 pt-6 pb-14 sm:space-y-16 sm:py-20`}>
        <section className="flex min-h-[calc(100svh-180px)] flex-col justify-evenly gap-5 sm:block sm:min-h-0 sm:space-y-8">
          <h1 className="text-center font-serif text-[clamp(1.5rem,7.6vw,2.4rem)] font-bold leading-[1.05] tracking-tight whitespace-nowrap text-primary sm:whitespace-normal sm:text-6xl md:text-7xl">
            AI-SLOP, NO MORE!
          </h1>
          <div className="space-y-1.5">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground sm:text-sm">What is /noghaan</h2>
            <p className="text-[15px] leading-snug sm:text-lg sm:leading-relaxed">
              It's an AI skill which puts hard guardrails on how AI thinks and responds, thus significantly reducing AI slop responses, hallucination, making up stuff, and lying confidently.
            </p>
          </div>
          <div className="space-y-1.5">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground sm:text-sm">How to use it</h2>
            <p className="text-[15px] leading-snug sm:text-lg sm:leading-relaxed">Just add this skill in your AI and use it in your regular conversations.</p>
          </div>
          <p className="text-sm text-muted-foreground sm:text-base">Read it once for god's sake. You'll understand how it does what it does.</p>
        </section>

        <section id="skill" className="scroll-mt-20">
          <Terminal
            name="noghaan.skill.md"
            actions={
              <>
                <CopyIcon />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Download skill" title="Download skill">
                      <Download className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {downloads.map((d) => (
                      <DropdownMenuItem key={d.href} asChild>
                        <a href={d.href} download onClick={() => trackEvent("download_clicked", { meta: { file: d.href } })}>{d.label}</a>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            }
          >
            <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed">{skillText}</pre>
          </Terminal>
        </section>

        <section className="space-y-5">
          <H2>Where to add it</H2>
          <ol className="space-y-4">
            {[
              ["ChatGPT / Claude / Gemini", "Paste into Custom Instructions or Project Knowledge."],
              ["Lovable / Cursor / Claude Code", "Drop into .agents/skills/ or project rules."],
              ["One-off prompt", "Paste at the top of your prompt before asking."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="font-mono text-sm text-primary">{i + 1}.</span>
                <div><p className="font-medium">{t}</p><p className="text-muted-foreground">{d}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <Terminal name="note.txt">
            <div className="space-y-4 p-5 font-mono text-sm leading-relaxed">
              <p>
                When you force AI to produce sources, verify facts before throwing made-up stuff at you, and ask questions instead of assuming and moving forward, it is bound to slightly slow down the AI—because you are making it work harder.
              </p>
              <p>
                Now, whether to spend some more time moving with tight guardrails, or waste a lot more time haggling and arguing with your AI, is for you to decide.
              </p>
            </div>
          </Terminal>
        </section>

        <section className="space-y-5">
          <H2>Use /noghaan when being wrong has a cost.</H2>
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
        </section>

      </main>

      <footer className="border-t">
        <div className={`${shell} py-8 text-sm text-muted-foreground`}>
          <Link to="/" className="hover:text-foreground">patkan.in</Link> · Open-source browser prompt engine for professionals.
        </div>
      </footer>
    </div>
  );
}
