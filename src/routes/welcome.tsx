import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Playground } from "@/components/Playground";
import { trackEvent } from "@/lib/telemetry";
import patkanMark from "@/assets/patkan-mark.svg";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to Patkan - Extension Installed" },
      { name: "description", content: "Patkan is installed. Type anything, end it with // and watch it turn into a prompt." },
      { property: "og:title", content: "Welcome to Patkan - Extension Installed" },
      { property: "og:description", content: "Patkan is installed. Type anything, end it with // and watch it turn into a prompt." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: Welcome,
});

const LAUNCH = [
  ["Open ChatGPT", "https://chatgpt.com"],
  ["Open Claude", "https://claude.ai"],
  ["Open Gemini", "https://gemini.google.com"],
  ["Other", "chrome://newtab"],
] as const;

function open(label: string, url: string) {
  trackEvent("welcome_launch_clicked", { meta: { target: label } });
  // Browsers block web pages from linking to chrome://newtab, so "Other" opens a fresh empty tab.
  if (url.startsWith("chrome://")) window.open("", "_blank");
  else window.open(url, "_blank", "noopener,noreferrer");
}

function Welcome() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-6xl px-5 pb-12 pt-8 sm:px-6 sm:pt-14 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-2">
            <img src={patkanMark} alt="Patkan" width={816} height={816} className="size-8 rounded-[0.55rem]" />
            <span className="text-lg font-semibold tracking-tight">Patkan</span>
          </div>
          <span className="mt-6 inline-block rounded-full border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Extension Installed
          </span>
          <h1 className="mt-4 text-balance text-[1.4rem] font-semibold leading-snug tracking-tight sm:text-4xl sm:leading-[1.15]">
            Just type anything, end your sentence with <span className="font-mono text-primary">//</span> to transform it
            to a prompt.
          </h1>
        </div>

        <Playground />

        <div className="mt-8 text-center">
          <p className="text-sm font-medium sm:text-base">Ready to use it in your daily work?</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {LAUNCH.map(([label, url]) => (
              <Button key={label} variant="outline" onClick={() => open(label, url)}>
                {label} <ArrowUpRight className="size-4" aria-hidden />
              </Button>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground sm:text-sm">
            Works right inside the composer on 14+ AI assistants.
          </p>
        </div>
      </main>
    </div>
  );
}
