import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Copy, Check, Download, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PERSONAS, localScaffold, DAILY_FREE_LIMIT } from "@/lib/patkan-core";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Patkan — lazy input in, expert prompt out" },
      {
        name: "description",
        content:
          "A browser extension that rewrites your rough sentence into a structured, role-and-constraint prompt right inside ChatGPT, Claude and Gemini.",
      },
      { property: "og:title", content: "Patkan — lazy input in, expert prompt out" },
      {
        property: "og:description",
        content:
          "A browser extension that rewrites your rough sentence into a structured, role-and-constraint prompt right inside ChatGPT, Claude and Gemini.",
      },
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

function Landing() {
  const { session } = useAuth();
  const [input, setInput] = useState(SAMPLE);
  const [persona, setPersona] = useState("product-manager");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const outRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    setOutput(localScaffold(SAMPLE, "product-manager"));
  }, []);

  async function transform() {
    if (!input.trim() || busy) return;
    setBusy(true);
    setOutput(localScaffold(input, persona));
    try {
      const res = await fetch("/api/public/transform", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ text: input, persona, deviceId: deviceId() }),
      });
      const data = (await res.json()) as {
        prompt?: string;
        error?: string;
        used?: number;
        limit?: number;
      };
      if (!res.ok || !data.prompt) {
        toast.error(data.error ?? "Transform failed.");
      } else {
        setOutput(data.prompt);
        if (typeof data.used === "number" && typeof data.limit === "number") {
          setUsage({ used: data.used, limit: data.limit });
        }
      }
    } catch {
      toast.error("Network error. The instant draft above is still usable.");
    } finally {
      setBusy(false);
      outRef.current?.scrollTo({ top: 0 });
    }
  }

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
            rewrites in place — role, context, task and constraints, in XML the models actually respect.
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
                rows={5}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="draft a prd for checkout redesign"
                className="mt-3 resize-none border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
              />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersona(p.id)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      persona === p.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <Button onClick={transform} disabled={busy} className="mt-4 w-full">
                {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {busy ? "Transforming…" : "Patkan it"}
              </Button>
            </div>

            <div className="flex flex-col rounded-xl border bg-foreground/[0.03] p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Structured prompt
                </span>
                <Button variant="ghost" size="sm" onClick={copy} disabled={!output}>
                  {copied ? <Check /> : <Copy />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <pre
                ref={outRef}
                className="mt-3 max-h-[22rem] overflow-auto whitespace-pre-wrap break-words font-mono text-[12.5px] leading-relaxed text-foreground/90"
              >
                {output}
              </pre>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-8 md:grid-cols-3">
          {[
            {
              t: "Instant, then better",
              d: "A structured draft appears with zero network delay, then the model's enriched version replaces it. You never watch a blank box.",
            },
            {
              t: "Never breaks your flow",
              d: "It writes back into the site's own composer. If a site changes and injection fails, the prompt lands on your clipboard instead.",
            },
            {
              t: "Your own frameworks",
              d: "Save a framework once — 'Strict PRD', 'LinkedIn, no emoji' — and apply it from the extension on any device.",
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
