import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Monitor, Smartphone } from "lucide-react";

const STORE_URL =
  "https://chromewebstore.google.com/detail/patkan-%E2%80%94-instant-expert-p/jcgkfecfliophjfnkokjnifcmalfbnnn";

export const Route = createFileRoute("/installationguidev2")({
  head: () => ({
    meta: [
      { title: "Install Patkan — Two clicks, zero setup" },
      {
        name: "description",
        content:
          "Add Patkan to Chrome from the official Chrome Web Store, or send it to your desktop from your phone in five seconds.",
      },
      { property: "og:title", content: "Install Patkan — Two clicks, zero setup" },
      {
        property: "og:description",
        content:
          "Add Patkan to Chrome from the official Chrome Web Store, or send it to your desktop from your phone in five seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InstallationGuideV2,
});

type Mode = "desktop" | "mobile";

function InstallationGuideV2() {
  const [auto, setAuto] = useState<Mode>("desktop");
  const [override, setOverride] = useState<Mode | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setAuto(mq.matches ? "mobile" : "desktop");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const mode = override ?? auto;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-bold tracking-tight">patkan.in</p>
            <p className="truncate text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              install guide v2 — preview
            </p>
          </div>
          <div className="flex shrink-0 items-center rounded-full border border-border bg-card p-1">
            <PreviewToggle
              active={mode === "desktop"}
              onClick={() => setOverride("desktop")}
              icon={<Monitor className="h-3.5 w-3.5" />}
              label="Desktop"
            />
            <PreviewToggle
              active={mode === "mobile"}
              onClick={() => setOverride("mobile")}
              icon={<Smartphone className="h-3.5 w-3.5" />}
              label="Mobile"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
        {mode === "desktop" ? <DesktopView /> : <MobileView />}
      </main>
    </div>
  );
}

function PreviewToggle({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
      {children}
    </p>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: React.ReactNode;
  body: string;
}) {
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-t border-border/60 py-5">
      <span className="shrink-0 font-mono text-sm font-bold text-primary">{n}</span>
      <div className="min-w-0">
        <p className="text-lg font-bold tracking-tight">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </li>
  );
}

function DesktopView() {
  return (
    <div className="grid gap-14 md:grid-cols-[minmax(0,1fr)_380px] md:gap-16">
      <section>
        <Kicker>Installation</Kicker>
        <h1 className="mt-3 text-5xl font-black leading-[0.95] tracking-tight">
          Two clicks.
          <br />
          Zero setup.
        </h1>
        <ol className="mt-10">
          <Step
            n="01"
            title="Add to Chrome"
            body="Verified by Google. No zip files, no developer mode."
          />
          <Step
            n="02"
            title="Open your AI"
            body="Sits silently inside ChatGPT, Claude, Gemini, and Copilot."
          />
          <Step
            n="03"
            title={
              <>
                Type <span className="font-mono text-primary">//</span>
              </>
            }
            body="Turn any rough sentence into an expert prompt in 800ms."
          />
        </ol>
      </section>

      <section className="md:pt-14">
        <StoreCard mobile={false} />
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Native support for Chrome, Brave, Arc, Edge, and Opera.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Using Firefox?{" "}
          <a className="font-semibold text-foreground underline underline-offset-4" href="/patkan-extension.zip">
            Get the add-on
          </a>
          <span className="mx-2 text-border">·</span>
          <span className="text-muted-foreground/70">Safari: in review</span>
        </p>
      </section>
    </div>
  );
}

function MobileView() {
  return (
    <div className="mx-auto max-w-md">
      <Kicker>Remote sync</Kicker>
      <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight">
        On mobile? Send it to your computer.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Google installs Patkan on your desktop while you browse here.
      </p>

      <ol className="mt-8">
        <Step n="01" title={'Tap "Add to Desktop"'} body="Opens the official Chrome Web Store." />
        <Step
          n="02"
          title="Google syncs it"
          body="The extension is signed to your desktop Chrome account."
        />
        <Step
          n="03"
          title="Ready on your laptop"
          body="Waiting for you the next time you open Chrome."
        />
      </ol>

      <div className="mt-10">
        <StoreCard mobile />
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Using Firefox?{" "}
        <a className="font-semibold text-foreground underline underline-offset-4" href="/patkan-extension.zip">
          Get the add-on
        </a>
        <span className="mx-2 text-border">·</span>
        <span className="text-muted-foreground/70">Safari: in review</span>
      </p>
    </div>
  );
}

function StoreCard({ mobile }: { mobile: boolean }) {
  const [added, setAdded] = useState(false);

  const open = () => {
    setAdded(true);
    window.open(STORE_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/70 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
        <span className="truncate font-mono text-[11px] text-muted-foreground">
          chromewebstore.google.com
        </span>
      </div>

      <div className="px-5 py-6">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-foreground font-mono text-lg font-black text-background">
            //
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Patkan — Instant expert prompts</p>
            <p className="truncate text-xs text-muted-foreground">
              Featured · Free · Zero retention
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={open}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: added ? "#188038" : "#1a73e8" }}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" />
              Added to Desktop
            </>
          ) : mobile ? (
            "Add to Desktop"
          ) : (
            "Add to Chrome — It's Free"
          )}
        </button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          {mobile
            ? "✓ Installs automatically via Google Account Sync"
            : "Official Google-verified listing"}
        </p>

        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-1 text-xs font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Open store listing <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
