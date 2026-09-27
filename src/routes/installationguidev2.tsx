import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const STORE_URL =
  "https://chromewebstore.google.com/detail/patkan-%E2%80%94-instant-expert-p/jcgkfecfliophjfnkokjnifcmalfbnnn";

export const Route = createFileRoute("/installationguidev2")({
  head: () => ({
    meta: [
      { title: "Install section — three directions" },
      {
        name: "description",
        content:
          "Three challenger directions for the Patkan install section, stacked for review.",
      },
      { property: "og:title", content: "Install section — three directions" },
      {
        property: "og:description",
        content:
          "Three challenger directions for the Patkan install section, stacked for review.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InstallSectionDirections,
});

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return mobile;
}

function openStore() {
  window.open(STORE_URL, "_blank", "noopener,noreferrer");
}

function CTA({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={openStore}
      className="rounded-full bg-primary px-7 py-3.5 text-sm font-bold tracking-tight text-primary-foreground transition-opacity hover:opacity-90"
    >
      {label}
    </button>
  );
}

function ConceptLabel({ children }: { children: string }) {
  return (
    <p className="mb-10 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
      {children}
    </p>
  );
}

function InstallSectionDirections() {
  const mobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-5xl px-5 py-4">
          <p className="font-mono text-sm font-bold tracking-tight">patkan.in</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            install section — three directions
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5">
        <div className="divide-y divide-border/60">
          <section className="py-24 sm:py-32">
            <ConceptLabel>Direction 01 — The one-breath truth</ConceptLabel>
            <OneBreath mobile={mobile} />
          </section>

          <section className="py-24 sm:py-32">
            <ConceptLabel>Direction 02 — The light switch</ConceptLabel>
            <LightSwitch mobile={mobile} />
          </section>

          <section className="py-24 sm:py-32">
            <ConceptLabel>Direction 03 — The 3-second slap</ConceptLabel>
            <KineticSlap mobile={mobile} />
          </section>
        </div>
      </main>
    </div>
  );
}

function OneBreath({ mobile }: { mobile: boolean }) {
  return (
    <div>
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
        Installation
      </p>
      <h2 className="mt-4 text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl">
        No accounts. No settings.
      </h2>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-2xl">
        {mobile
          ? "Tap once. Google syncs Patkan to your desktop Chrome automatically."
          : "One click, and it lives in your cursor."}
      </p>

      <div className="mt-9">
        <CTA label={mobile ? "Send to Desktop Chrome" : "Add to Chrome — Free"} />
      </div>

      <p className="mt-7 text-sm leading-relaxed text-muted-foreground">
        Works silently inside ChatGPT, Claude, Gemini &amp; Copilot.
        <br />
        Chrome · Brave · Arc · Edge · Opera
      </p>
    </div>
  );
}

function LightSwitch({ mobile }: { mobile: boolean }) {
  const beats = [
    { n: "1", title: "Add to Chrome", body: "Official Web Store" },
    { n: "2", title: "Open any AI", body: "Sits in your prompt bar" },
    { n: "3", title: "Type //", body: "Instant surgical brief" },
  ];

  return (
    <div>
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
        The setup
      </p>
      <h2 className="mt-4 max-w-3xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl">
        Click once. Never think about prompt engineering again.
      </h2>

      <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
        {beats.map((b) => (
          <div key={b.n} className="bg-card px-6 py-7">
            <p className="font-mono text-xs font-bold text-muted-foreground">{b.n}</p>
            <p className="mt-2 text-lg font-bold tracking-tight">{b.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{b.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-9">
        <CTA label={mobile ? "Send to Desktop Chrome" : "Add to Chrome — Free"} />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Zero data stored. Zero training. Verified by Google.
      </p>
    </div>
  );
}

function KineticSlap({ mobile }: { mobile: boolean }) {
  return (
    <div>
      <h2 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl">
        From install to your first surgical prompt: 3 seconds.
      </h2>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border/70 px-6 py-5">
          <p className="font-mono text-sm sm:text-base">
            <span className="text-muted-foreground">&gt; </span>
            write a cold email to a ceo
            <span className="font-black text-primary">//</span>
          </p>
        </div>
        <div className="grid gap-2 px-6 py-6 font-mono text-xs leading-relaxed text-muted-foreground sm:text-sm">
          <p className="text-foreground">## Role</p>
          <p className="text-foreground">## Context</p>
          <p className="text-foreground">## Task</p>
          <p className="text-foreground">## Output format</p>
          <p className="text-foreground">## Constraints</p>
          <p className="text-foreground">## Before answering</p>
        </div>
      </div>

      <div className="mt-9">
        <CTA label={mobile ? "Send to Desktop Chrome" : "Add to Chrome — It's Free"} />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Instant setup. Verified by Google. Works across all Chromium browsers.
      </p>
    </div>
  );
}
