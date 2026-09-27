import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const STORE_URL =
  "https://chromewebstore.google.com/detail/patkan-%E2%80%94-instant-expert-p/jcgkfecfliophjfnkokjnifcmalfbnnn";
const FIREFOX_URL = "https://patkan.in/patkan-extension-firefox.zip";

export const Route = createFileRoute("/installationguidev2")({
  head: () => ({
    meta: [
      { title: "Installation — Patkan" },
      {
        name: "description",
        content: "One click, and your AI stops giving you junk.",
      },
      { property: "og:title", content: "Installation — Patkan" },
      {
        property: "og:description",
        content: "One click, and your AI stops giving you junk.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InstallSection,
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

function openFirefox() {
  window.open(FIREFOX_URL, "_blank", "noopener,noreferrer");
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

function InstallSection() {
  const mobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-5xl px-5 py-4">
          <p className="font-mono text-sm font-bold tracking-tight">patkan.in</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            installation
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5">
        {/* 1. The value — what changes in their life */}
        <section className="py-24 sm:py-32">
          <h2 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl">
            Stop wrestling with prompts.
            <br />
            <span className="text-primary">Just type //</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-2xl">
            Patkan turns your rough thoughts into sharp, expert prompts —
            inside ChatGPT, Claude, Gemini & Copilot. In one second.
          </p>
          <div className="mt-9">
            <CTA label={mobile ? "Add to Desktop" : "Add to Chrome — It's Free"} />
          </div>
        </section>

        {/* 2. The click — how effortless it is */}
        <section className="border-t border-border/60 py-24 sm:py-32">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
            Getting it
          </p>
          <h2 className="mt-4 max-w-2xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl">
            {mobile ? "Send it to your laptop in 5 seconds." : "One click. Done."}
          </h2>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
            {(mobile
              ? [
                  { n: "1", title: "Tap “Add to Desktop”", body: "Google opens." },
                  { n: "2", title: "Tap the blue button", body: "That's it." },
                  { n: "3", title: "Open your laptop", body: "Patkan is already there." },
                ]
              : [
                  { n: "1", title: "Click “Add to Chrome”", body: "Google confirms." },
                  { n: "2", title: "Open your AI", body: "ChatGPT, Claude, Gemini." },
                  { n: "3", title: "Type //", body: "Watch it transform." },
                ]
            ).map((b) => (
              <div key={b.n} className="bg-card px-6 py-7">
                <p className="font-mono text-xs font-bold text-muted-foreground">{b.n}</p>
                <p className="mt-2 text-lg font-bold tracking-tight">{b.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>

          {mobile && (
            <p className="mt-5 text-sm text-muted-foreground">
              ✓ Installs automatically on every computer signed into your Google account.
            </p>
          )}

          <div className="mt-9">
            <CTA label={mobile ? "Add to Desktop" : "Add to Chrome — It's Free"} />
          </div>
        </section>

        {/* 3. The trust — quiet, one line */}
        <section className="border-t border-border/60 py-20 sm:py-28">
          <p className="text-2xl font-black tracking-tight sm:text-3xl">
            Verified by Google.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Install takes a moment. Removing it takes one. Nothing to sign, nothing
            to learn — your AI just starts behaving.
          </p>
          <p className="mt-8 text-sm text-muted-foreground">
            Works in Chrome · Brave · Arc · Edge · Opera.{" "}
            <button
              type="button"
              onClick={openFirefox}
              className="underline underline-offset-4 hover:text-foreground"
            >
              Using Firefox? Get the add-on.
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}
