import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PromptForm } from "@/components/PromptForm";
import { PromptDraftPanel } from "@/components/PromptDraftPanel";
import {
  DEFAULT_OUTPUT_FORMAT,
  EMPTY_DRAFT,
  REQUIRED_FIELDS,
  mergeDraft,
  requiredFilled,
  type PromptDraft,
} from "@/lib/prompt-draft";
import mark from "@/assets/prompt-architect-mark.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prompt Architect — Build expert prompts from plain English" },
      {
        name: "description",
        content:
          "Fill a short structured form and watch a surgically crafted expert prompt assemble live: role, context, objective, guardrails and output format.",
      },
      { property: "og:title", content: "Prompt Architect — expert prompt builder" },
      {
        property: "og:description",
        content:
          "A two-column builder: structured fields on the left, a precision-engineered prompt on the right. Copy it or export as .md or .txt.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PromptArchitect,
});

const STORAGE_KEY = "prompt-architect-draft-v1";

const INITIAL: PromptDraft = { ...EMPTY_DRAFT, outputFormat: [...DEFAULT_OUTPUT_FORMAT] };

function PromptArchitect() {
  const [draft, setDraft] = useState<PromptDraft>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setDraft(mergeDraft(INITIAL, JSON.parse(stored) as PromptDraft));
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  const done = requiredFilled(draft);
  const total = REQUIRED_FIELDS.length;

  return (
    <main className="flex h-screen flex-col bg-background text-foreground">
      <header className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-6 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <img src={mark} alt="" width={512} height={512} className="size-6 shrink-0 object-contain" />
          <div className="min-w-0 leading-tight">
            <h1 className="truncate text-sm font-semibold tracking-tight">Prompt Architect</h1>
            <p className="truncate text-xs text-muted-foreground">
              Natural language in, surgically crafted prompt out.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="font-mono text-[11px] text-muted-foreground">
            {done}/{total} required
          </span>
          <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-h-0 overflow-y-auto border-b border-border lg:border-b-0 lg:border-r">
          <PromptForm draft={draft} onChange={(patch) => setDraft((d) => mergeDraft(d, patch))} />
        </div>
        <PromptDraftPanel draft={draft} onReset={() => setDraft(INITIAL)} />
      </div>
    </main>
  );
}
