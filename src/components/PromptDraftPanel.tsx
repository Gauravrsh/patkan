import { useMemo, useState } from "react";
import { Check, Copy, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DRAFT_SECTIONS,
  draftProgress,
  isSectionFilled,
  renderPrompt,
  type PromptDraft,
} from "@/lib/prompt-draft";

function download(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function PromptDraftPanel({ draft }: { draft: PromptDraft }) {
  const [copied, setCopied] = useState(false);
  const prompt = useMemo(() => renderPrompt(draft), [draft]);
  const progress = draftProgress(draft);
  const started = progress > 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="flex h-full min-h-0 flex-col bg-card" aria-label="Generated prompt">
      <header className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        <h2 className="text-sm font-semibold tracking-tight">Prompt draft</h2>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 font-mono text-[11px]",
            draft.complete
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border text-muted-foreground",
          )}
        >
          {draft.complete ? "READY" : `${progress}% mapped`}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!started}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => download("prompt.md", prompt)}
            disabled={!started}
          >
            <FileText />
            .md
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => download("prompt.txt", prompt)}
            disabled={!started}
          >
            <Download />
            .txt
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5 border-b border-border px-5 py-2.5">
        {DRAFT_SECTIONS.map((section) => {
          const filled = isSectionFilled(draft, section.key);
          return (
            <span
              key={section.key}
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors",
                filled
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground/60",
              )}
            >
              {section.label}
            </span>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <pre
          className={cn(
            "whitespace-pre-wrap break-words font-mono text-[12.5px] leading-relaxed",
            started ? "text-foreground" : "text-muted-foreground/55",
          )}
        >
          {prompt}
        </pre>
      </div>
    </section>
  );
}
