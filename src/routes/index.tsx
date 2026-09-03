import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Copy, Check, Download, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DAILY_FREE_LIMIT,
  DIALECTS,
  INTENSITIES,
  PERSONAS,
  localScaffold,
  type Dialect,
  type Intensity,
} from "@/lib/patkan-core";
import { streamTransform } from "@/lib/patkan-stream";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Patkan — lazy input in, expert prompt out" },
      {
        name: "description",
        content:
          "A browser extension that compiles your rough sentence into an expert prompt — model-aware format, output contract and assumptions — inside ChatGPT, Claude and Gemini.",
      },
      { property: "og:title", content: "Patkan — lazy input in, expert prompt out" },
      {
        property: "og:description",
        content:
          "A browser extension that compiles your rough sentence into an expert prompt — model-aware format, output contract and assumptions — inside ChatGPT, Claude and Gemini.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function deviceId() {
  const key = "patkan_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

const SAMPLE = "write a prd for redesigning our checkout";

type Phase = "idle" | "drafting" | "sharpening" | "ready";

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Compiled prompt",
  drafting: "Drafting…",
  sharpening: "Sharpening this…",
  ready: "Ready",
};

function Landing() {
  const { session } = useAuth();
  const [input, setInput] = useState(SAMPLE);
  const [persona, setPersona] = useState("auto");
  const [dialect, setDialect] = useState<Dialect>("markdown");
  const [intensity, setIntensity] = useState<Intensity>("standard");
  const [output, setOutput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [engine, setEngine] = useState<"primary" | "fallback" | "local">("local");
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [clarifiers, setClarifiers] = useState<{ label: string; refinement: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const outRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    setOutput(localScaffold(SAMPLE, { persona: "auto", dialect: "markdown", intensity: "standard" }));
  }, []);

  async function transform(refinement?: string) {
    if (!input.trim() || busy) return;
    setBusy(true);
    setPhase("drafting");
    setAssumptions([]);
    setClarifiers([]);
    setOutput(localScaffold(input, { persona, dialect, intensity }));
    try {
      const result = await streamTransform(
        {
          text: input,
          persona,
          dialect,
          intensity,
          deviceId: deviceId(),
          accessToken: session?.access_token,
          refinement: refinement ?? null,
        },
        (visible) => {
          setPhase("sharpening");
          setOutput(visible);
        },
      );
      setOutput(result.prompt);
      setEngine(result.engine);
      setPhase("ready");
      setAssumptions(result.assumptions);
      setClarifiers(result.clarifiers);
      if (typeof result.used === "number" && typeof result.limit === "number") {
        setUsage({ used: result.used, limit: result.limit });
      }
    } catch (err) {
      setPhase("ready");
      setEngine("local");
      toast.error(err instanceof Error ? err.message : "Transform failed.");
    } finally {
      setBusy(false);
    }
  }

  const settled = phase === "ready" || phase === "idle";

  async function copy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }


  function download() {
    fetch("/patkan-extension.zip")
      .then((res) => {
        if (!res.ok) throw new Error("Download failed. Try again.");
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "patkan-extension.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err: Error) => toast.error(err.message));
  }

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs transition-colors ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border text-muted-foreground hover:bg-muted"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="text-primary">✦</span> Patkan
        </span>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <a href="#install">Install</a>
          </Button>
          {session ? (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/library">Library</Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 pb-24">
        <section className="pt-10 md:pt-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Marathi for "promptly"
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Type lazily.
            <br />
            Send an expert prompt.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground">
            Patkan sits inside ChatGPT, Claude and Gemini. Finish your rough sentence with{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">//</code> and it
            compiles a prompt in the format that model actually respects — with a success criterion, an
            output contract, and its assumptions on the record.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button onClick={download}>
              <Download /> Download the extension
            </Button>
            <Button variant="outline" asChild>
              <a href="#try">
                Try it here first <ArrowRight />
              </a>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            No sign-up to start. {DAILY_FREE_LIMIT} transforms per day, free.
          </p>
        </section>

        <section id="try" className="mt-16 scroll-mt-8">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Your rough input
                </span>
                <span className="text-xs text-muted-foreground">
                  {usage ? `${usage.used}/${usage.limit} today` : `${DAILY_FREE_LIMIT}/day free`}
                </span>
              </div>
              <Textarea
                rows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="draft a prd for checkout redesign"
                className="mt-3 resize-none border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
              />

              <div className="mt-4 space-y-3 border-t pt-4">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Target model</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {DIALECTS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        title={d.note}
                        onClick={() => setDialect(d.id)}
                        className={chip(dialect === d.id)}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Intensity</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {INTENSITIES.map((i) => (
                      <button
                        key={i.id}
                        type="button"
                        title={i.note}
                        onClick={() => setIntensity(i.id)}
                        className={chip(intensity === i.id)}
                      >
                        {i.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Persona</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {PERSONAS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPersona(p.id)}
                        className={chip(persona === p.id)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={() => void transform()} disabled={busy} className="mt-4 w-full">
                {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {busy ? "Sharpening…" : "Patkan it"}
              </Button>

            </div>

            <div className="flex flex-col rounded-xl border bg-foreground/[0.03] p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {!settled && (
                    <span className="size-1.5 animate-pulse rounded-full bg-primary" aria-hidden />
                  )}
                  {PHASE_LABEL[phase]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void copy()}
                  disabled={!output || !settled}
                >
                  {copied ? <Check /> : <Copy />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <pre
                ref={outRef}
                aria-busy={!settled}
                className={`mt-3 max-h-[22rem] flex-1 overflow-auto whitespace-pre-wrap break-words font-mono text-[12.5px] leading-relaxed transition-opacity duration-300 ${
                  settled ? "text-foreground/90 opacity-100" : "text-foreground/70 opacity-60"
                }`}
              >
                {output}
              </pre>

              <p className="mt-3 text-xs text-muted-foreground">
                {phase === "drafting" && "Instant draft — hold on, this gets sharpened."}
                {phase === "sharpening" && "Rewriting in place. Copy unlocks the moment it's done."}
                {phase === "ready" &&
                  (engine === "primary"
                    ? "Ready"
                    : engine === "fallback"
                      ? "Ready — backup engine"
                      : "Ready — offline draft")}
              </p>

              {assumptions.length > 0 && (
                <p className="mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">Assumed:</span>{" "}
                  {assumptions.join(" · ")}
                </p>
              )}


              {clarifiers.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {clarifiers.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      disabled={busy}
                      onClick={() => void transform(c.refinement)}
                      className="rounded-full border border-dashed px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50"
                    >
                      + {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-8 md:grid-cols-3">
          {[
            {
              t: "Format that fits the model",
              d: "XML for Claude, Markdown headings for GPT, plain sections for Gemini. The extension picks by the site you're on — because a tag style is only useful if the model was trained to respect it.",
            },
            {
              t: "Restraint, not padding",
              d: "A one-line question gets a sharpened one-liner, not a spec. Patkan classifies intent first and only compiles the blocks the task actually needs.",
            },
            {
              t: "Legible magic",
              d: "Every result names what it assumed, and offers up to three one-tap chips for the details that would genuinely change the answer.",
            },
          ].map((f) => (
            <div key={f.t}>
              <h3 className="font-medium">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </section>

        <section id="install" className="mt-20 scroll-mt-8 rounded-xl border bg-card p-6 md:p-8">
          <h2 className="text-xl font-semibold tracking-tight">Install it</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Works in Chrome, Edge, Brave and Arc. Not on the Web Store yet, so it installs unpacked.
          </p>
          <ol className="mt-5 space-y-2 text-sm">
            {[
              "Download the zip and unzip it.",
              "Open chrome://extensions in your browser.",
              "Turn on Developer mode (top right).",
              "Click 'Load unpacked' and pick the unzipped folder.",
              "Open ChatGPT, type a rough sentence, end it with // — or click the Patkan icon for the side panel.",
            ].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[11px]">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={download}>
              <Download /> Download zip
            </Button>
            <Button variant="outline" asChild>
              <Link to="/connect">Connect my account</Link>
            </Button>
          </div>
        </section>

        <section className="mt-20 max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight">What we send, and what we don't</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The text you transform is sent to our endpoint and on to the model to be rewritten. We do not
            store your prompts. Usage is counted as a number per day, tied to an anonymous device id or
            your account — never to prompt content. Patkan only runs on ChatGPT, Claude and Gemini, plus
            its own side panel; it does not read any other site.
          </p>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground">
          <span>✦ Patkan — quickly.</span>
          <span>{DAILY_FREE_LIMIT} free transforms a day.</span>
        </div>
      </footer>
    </div>
  );
}
