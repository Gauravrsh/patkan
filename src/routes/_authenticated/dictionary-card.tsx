import { createFileRoute } from "@tanstack/react-router";
import { Volume2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dictionary-card")({
  head: () => ({
    meta: [
      { title: "Patkan dictionary card (private archive)" },
      { name: "description", content: "Private archived Patkan dictionary card." },
      { property: "og:title", content: "Patkan dictionary card (private archive)" },
      { property: "og:description", content: "Private archived Patkan dictionary card." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DictionaryCard,
});

function DictionaryCard() {
  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.speak(new SpeechSynthesisUtterance("patkan"));
  };
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-12">
      <article className="w-full overflow-hidden rounded-lg border bg-card shadow-sm">
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
            <span className="font-semibold text-foreground">SYNONYMS:</span> promptly · instantly · swiftly · in a flash
          </div>
        </div>
      </article>
    </main>
  );
}
