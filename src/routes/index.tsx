import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine, ArrowRight, Check, ChevronDown, Code2, Copy, EyeOff, Loader2, RotateCcw, Share2, Slash, UserRound } from "lucide-react";

const FAQS: [string, string][] = [
  ["What is Patkan?", "Patkan is an AI prompt generator and enhancer that turns rough sentences into structured, expert prompts right inside your AI chat box. Instead of learning prompt engineering syntax, you type your task in plain words and end it with //. Patkan rewrites it instantly before the AI model processes it."],
  ["Which AI assistants does Patkan work with?", "Patkan works directly inside desktop web interfaces for ChatGPT, Claude, Google Gemini, Microsoft Copilot, Perplexity, Google AI Studio, and other major AI platforms. It functions directly inside your active chat window without requiring you to switch tabs or copy-paste between tools."],
  ["How does Patkan protect your privacy?", "Patkan activates only when you type // at the end of a sentence. It does not monitor background keystrokes, does not read other browser tabs or browsing history, and never accesses personal accounts. Inputs are processed solely to structure your prompt and are not used to build advertising profiles."],
  ["Do I need to learn prompt engineering to use Patkan?", "No. Effective prompt engineering requires specifying roles, task constraints, edge cases, and output formats. As an instant prompt generator, Patkan builds this context automatically. You write naturally, and Patkan supplies the framing required for accurate, hallucination-free AI responses."],
];

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/telemetry";
import { DAILY_FREE_LIMIT, DAILY_SIGNED_IN_LIMIT, MAX_INPUT_CHARS, localScaffold, type Dialect } from "@/lib/patkan-core";
import { streamTransform } from "@/lib/patkan-stream";
import { faqLd, ldScript, organizationLd, pageLd, PATKAN_DEFINITION, softwareLd } from "@/lib/seo";
import patkanMark from "@/assets/patkan-mark.svg";
import { AIS, PROFESSIONS, Playground } from "@/components/Playground";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Patkan - AI Prompt Enhancer & Prompt Generator" },
      {
        name: "description",
        content:
          "Turn rough sentences into structured prompts right inside ChatGPT, Claude & Gemini. End any thought with // to trigger instant prompt enhancement.",
      },
      { property: "og:title", content: "Patkan - AI Prompt Enhancer & Prompt Generator" },
      {
        property: "og:description",
        content:
          "Turn rough sentences into structured prompts inside ChatGPT, Claude & Gemini. End any thought with // to trigger instant prompt enhancement.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://patkan.in/" },
      { property: "og:image", content: "https://patkan.in/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://patkan.in/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://patkan.in/" }],
    scripts: [
      ldScript([
        organizationLd,
        softwareLd,
        { "@type": "WebSite", "@id": "https://patkan.in/#website", name: "Patkan", url: "https://patkan.in/", publisher: { "@id": "https://patkan.in/#organization" } },
        pageLd({ name: "Patkan - AI Prompt Enhancer & Prompt Generator", path: "/", description: PATKAN_DEFINITION, dateModified: "2026-10-18" }),
        faqLd(FAQS),
      ]),
    ],
  }),
  component: Landing,
});

const shell = "mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8";

const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/patkan-%E2%80%94-instant-expert-p/jcgkfecfliophjfnkokjnifcmalfbnnn";



const eyebrow = "text-sm font-medium text-primary";
const h2 = "mt-2 text-2xl font-semibold leading-tight tracking-tight sm:text-4xl";

function Landing() {
  const { session } = useAuth();
  const isAdmin = useIsAdmin(!!session);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useSectionTracking("/");
  async function signOutEverywhere() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/", replace: true });
  }

  function getExtension() {
    trackEvent("download_clicked", { meta: { file: "chrome-web-store" } });
    window.open(CHROME_WEB_STORE_URL, "_blank", "noopener,noreferrer");
  }

  async function sharePatkan() {
    trackEvent("share_clicked");
    const url = "https://www.patkan.in";
    if (navigator.share) {
      try { await navigator.share({ title: "Patkan", url }); } catch { /* cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
      catch { toast.error("Couldn't copy the link"); }
    }
  }

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
          <div className="flex items-center gap-2 text-sm text-muted-foreground sm:gap-4">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="max-w-24 truncate">Account</Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild><Link to="/library">Your Library</Link></DropdownMenuItem>
                  {isAdmin && <DropdownMenuItem asChild><Link to="/admin">Admin</Link></DropdownMenuItem>}
                  <DropdownMenuItem onSelect={() => void signOutEverywhere()}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : <Link to="/auth" aria-label="Sign in" title="Sign in" className="inline-flex size-9 items-center justify-center rounded-md hover:text-foreground sm:w-auto sm:px-2"><UserRound className="size-4 sm:hidden" /><span className="hidden sm:inline">Sign in</span></Link>}
            <Button variant="ghost" size="icon" aria-label="Share Patkan" title="Share Patkan" onClick={() => void sharePatkan()}><Share2 className="size-4" /></Button>
            <Button onClick={getExtension} size="sm" className="inline-flex shrink-0 gap-1.5 px-3 sm:px-4">
              <span className="hidden sm:inline">Add to Desktop</span>
              <span className="sm:hidden">Add</span>
              <ArrowDownToLine className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* 1. Hero + 2. Playground + 3. CTA */}
        <section id="playground" data-section="hero" className={`${shell} scroll-mt-20 pt-5 pb-10 sm:py-16`}>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-[1.4rem] font-semibold leading-snug tracking-tight sm:text-4xl sm:leading-[1.15]">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-primary sm:mb-3 sm:text-sm">
                AI Prompt Generator &amp; Enhancer
              </span>
              Stop writing prompts. Just end your sentence with <span className="font-mono text-primary">//</span>{" "}
              inside ChatGPT, Claude, Gemini, or any AI assistant.
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-lg">
              Turn rough thoughts into structured prompts right where you type — without switching tabs or learning
              prompt engineering.
            </p>
          </div>

          <p className="mt-5 text-center text-xs font-medium text-primary sm:mt-10 sm:text-sm">Try Patkan in action. Just type anything and end it with //</p>
          <Playground />

          <div className="mt-6 flex flex-col items-center gap-3 text-center sm:mt-8">
            <Button onClick={getExtension} className="h-11 px-6">
              <ArrowDownToLine className="size-4" aria-hidden />
              <span className="sm:hidden">Add to Desktop</span>
              <span className="hidden sm:inline">Add to Chrome</span>
            </Button>
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
              {AIS.map(([n]) => (
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
            {[...PROFESSIONS, ...PROFESSIONS].map(([name], i) => (
              <span key={i} className="shrink-0 rounded-full border px-4 py-2 text-sm">{name}</span>
            ))}
          </div>
          <style>{`@keyframes pv2-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
        </section>

        {/* 6. Three steps */}
        <section id="install" data-section="install" className="scroll-mt-20 border-y bg-card py-14 sm:py-20">
          <div className={shell}>
            <p className={eyebrow}>How it works</p>
            <h2 className={h2}>How to turn any sentence into a prompt inside your AI</h2>
            <div className="mt-10 grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-3">
              {[
                ["01", "Add to Desktop Browser", "Install the Patkan prompt generator extension for Chrome, Edge, Firefox, Brave, Arc, and Opera. No sign-up required."],
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
          <h2 className={h2}>Activates only when you ask for it. Isolated to everything else.</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-3">
            {[
              [Slash, "Explicit // Trigger", "Patkan does not monitor typing or record background keystrokes. It evaluates text only when you intentionally type // at the end of a thought inside an approved AI chat box."],
              [EyeOff, "Strict Domain Isolation", "The extension operates exclusively within supported AI web interfaces. It has no access to your other browser tabs, browsing history, form fills, or personal credentials."],
              [Code2, "Open Source AGPL-3.0 License", "Every line of Patkan's code is public on GitHub under the GNU Affero General Public License v3. Anyone can inspect, verify, and independently audit how Patkan handles data, security boundaries, and privacy claims."],
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
          <Link to="/privacy" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            Read the full privacy policy <ArrowRight className="size-4" aria-hidden />
          </Link>
        </section>

        {/* 7b. FAQ — native details so every answer is in the server HTML */}
        <section id="faq" className={`${shell} scroll-mt-20 pb-14 sm:pb-20`}>
          <p className={eyebrow}>Common questions</p>
          <h2 className={h2}>Frequently asked questions about Patkan</h2>
          <div className="mt-8 divide-y rounded-lg border bg-card">
            {FAQS.map(([q, a]) => (
              <details key={q} className="group px-5 py-4 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
                  <h3>{q}</h3>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 8. Support */}
        <section id="support" data-section="support" className={`${shell} scroll-mt-20 pb-16 sm:pb-24`}>
          <div className="rounded-lg border bg-card p-6 sm:p-10">
            <p className={eyebrow}>Support</p>
            <h2 className={h2}>Need Help?</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Questions, bug reports, a site where Patkan should work but doesn&apos;t - send it across and you&apos;ll
              get a reply from the person who builds Patkan.
            </p>
            <a href="mailto:contact@patkan.in" className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">
              Email: contact@patkan.in
            </a>
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
