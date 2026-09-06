import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/events")({
  head: () => ({
    meta: [
      { title: "Patkan event taxonomy" },
      {
        name: "description",
        content: "Every signal Patkan records, what it means, and which metric it feeds.",
      },
      { property: "og:title", content: "Patkan event taxonomy" },
      {
        property: "og:description",
        content: "Every signal Patkan records, what it means, and which metric it feeds.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EventsPage,
});

interface Row {
  name: string;
  when: string;
  carries: string;
  feeds: string;
  tag: "oxygen" | "water";
}

const website: Row[] = [
  {
    name: "page_viewed",
    when: "Once, the first time someone opens the site in a session.",
    carries: "Device type, which site referred them.",
    feeds: "Sessions, the top of every funnel.",
    tag: "water",
  },
  {
    name: "section_seen",
    when: "A section is at least half on screen, once per session.",
    carries: "Section name.",
    feeds: "Reach — how far down the story people actually get.",
    tag: "water",
  },
  {
    name: "section_dwell",
    when: "When a section leaves the screen, or the tab is closed.",
    carries: "Section name, milliseconds visible.",
    feeds: "Hold — how long a section keeps attention.",
    tag: "water",
  },
  {
    name: "scroll_depth",
    when: "The page passes 25, 50, 75 and 100 percent.",
    carries: "The depth reached.",
    feeds: "How much of the page is ever seen.",
    tag: "water",
  },
  {
    name: "playground_input_started",
    when: "The first character is typed in the playground.",
    carries: "Nothing typed — only that typing began.",
    feeds: "Playground engagement rate.",
    tag: "water",
  },
  {
    name: "playground_compiled",
    when: "A prompt is successfully built on the site.",
    carries: "Which engine served it.",
    feeds: "Engagement, and the site half of daily active use.",
    tag: "oxygen",
  },
  {
    name: "playground_copied",
    when: "The compiled prompt is copied.",
    carries: "Nothing else.",
    feeds: "Value taken away without installing.",
    tag: "water",
  },
  {
    name: "download_clicked",
    when: "Any download button is pressed.",
    carries: "Which browser build.",
    feeds: "Playground-to-download conversion.",
    tag: "oxygen",
  },
  {
    name: "privacy_modal_viewed",
    when: "The approved-URLs list is opened.",
    carries: "Nothing else.",
    feeds: "Whether the privacy proof is being read.",
    tag: "water",
  },
  {
    name: "share_clicked",
    when: "The share button is pressed.",
    carries: "Nothing else.",
    feeds: "Word of mouth.",
    tag: "water",
  },
  {
    name: "nav_clicked",
    when: "A menu link is used.",
    carries: "Destination section.",
    feeds: "Whether navigation or scrolling is how people move.",
    tag: "water",
  },
  {
    name: "exit_section",
    when: "The last section on screen before leaving.",
    carries: "Section name.",
    feeds: "Drop — where the story loses people.",
    tag: "water",
  },
];

const extension: Row[] = [
  {
    name: "extension_initialized",
    when: "The extension is installed and starts for the first time.",
    carries: "Version.",
    feeds: "Installs, and install-friction drop-off.",
    tag: "oxygen",
  },
  {
    name: "trigger_detected",
    when: "Someone types // in a supported AI site.",
    carries: "Which site.",
    feeds: "Daily active triggers, and the denominator for failures.",
    tag: "oxygen",
  },
  {
    name: "injection_failed",
    when: "Patkan cannot write into the composer.",
    carries: "Which site, why.",
    feeds: "Host breakage — the fastest way a site update kills the product.",
    tag: "oxygen",
  },
  {
    name: "transform_rejected",
    when: "The rewrite is undone straight after it lands.",
    carries: "Which site.",
    feeds: "Quality: how often the output is not wanted.",
    tag: "water",
  },
  {
    name: "quota_limit_reached",
    when: "The daily allowance runs out.",
    carries: "Which site.",
    feeds: "Free quota exhaustion, and the sign-up funnel.",
    tag: "oxygen",
  },
  {
    name: "account_connect_viewed",
    when: "The sign-in prompt is shown. Planned.",
    carries: "Nothing else.",
    feeds: "Account conversion rate.",
    tag: "water",
  },
  {
    name: "account_connect_success",
    when: "An account is linked to the extension. Planned.",
    carries: "Nothing else.",
    feeds: "Account conversion rate.",
    tag: "water",
  },
];

const server: Row[] = [
  {
    name: "transform (ok / empty / error / limited)",
    when: "Every prompt build, from anywhere.",
    carries: "Site, persona, dialect, engine, sizes, timings, cached or not.",
    feeds: "Success rate, latency, engine mix, cost, acceptance.",
    tag: "oxygen",
  },
  {
    name: "accepted / discarded",
    when: "Reported back once the rewrite is kept and sent, or undone.",
    carries: "Yes or no, against the last build.",
    feeds: "Acceptance rate — the single best quality signal.",
    tag: "water",
  },
  {
    name: "usage counter",
    when: "Every non-cached build.",
    carries: "Anonymous subject, day, count.",
    feeds: "Daily allowance and the shared per-address ceiling.",
    tag: "oxygen",
  },
];

function Table({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-xs uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="mt-2 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[46rem] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-2 font-normal">Signal</th>
              <th className="px-4 py-2 font-normal">Tag</th>
              <th className="px-4 py-2 font-normal">Fires when</th>
              <th className="px-4 py-2 font-normal">Carries</th>
              <th className="px-4 py-2 font-normal">Feeds</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-border last:border-b-0 align-top">
                <td className="px-4 py-2 font-mono text-xs">{r.name}</td>
                <td className="px-4 py-2">
                  <span
                    className={
                      r.tag === "oxygen"
                        ? "rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                        : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    }
                  >
                    {r.tag}
                  </span>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{r.when}</td>
                <td className="px-4 py-2 text-muted-foreground">{r.carries}</td>
                <td className="px-4 py-2 text-muted-foreground">{r.feeds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EventsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Event taxonomy</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Every signal Patkan records, exactly once each, with no overlap. Nothing anyone types — on the
        site or inside an AI chat — is ever stored. <strong className="text-foreground">Oxygen</strong> means
        the product is dead within a minute if it breaks;{" "}
        <strong className="text-foreground">water</strong> means nothing breaks today but growth stops.
      </p>
      <Table title="Website" rows={website} />
      <Table title="Extension" rows={extension} />
      <Table title="Server" rows={server} />
    </main>
  );
}
