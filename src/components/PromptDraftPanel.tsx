import { useMemo, useState } from "react";
import { Check, Copy, Download, FileText, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isComplete, renderPrompt, requiredFilled, type PromptDraft } from "@/lib/prompt-draft";

function download(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function PromptDraftPanel({
  draft,
  onReset,
}: {
  draft: PromptDraft;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const prompt = useMemo(() => renderPrompt(draft), [draft]);
  const ready = isComplete(draft);
  const started = requiredFilled(draft) > 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section
      className="flex h-full min-h-0 flex-col bg-card"
      aria-label="Generated prompt"
    >
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-6 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <h2 className="truncate text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Live prompt
          </h2>
          <span
            className={cn(
              "shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-wider",
              ready
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            {ready ? "READY" : "DRAFT"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
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
          <Button variant="ghost" size="icon-sm" onClick={onReset} aria-label="Reset form">
            <RotateCcw />
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <pre
          className={cn(
            "whitespace-pre-wrap break-words font-mono text-[12.5px] leading-relaxed",
            started ? "text-foreground" : "text-muted-foreground/60",
          )}
        >
          {prompt}
        </pre>
      </div>
    </section>
  );
}
