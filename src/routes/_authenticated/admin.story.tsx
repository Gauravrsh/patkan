import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getStoryStats, type StoryStats } from "@/lib/story.functions";

export const Route = createFileRoute("/_authenticated/admin/story")({
  head: () => ({
    meta: [
      { title: "Patkan story engagement" },
      {
        name: "description",
        content: "Which parts of the Patkan landing page hold attention and which get scrolled past.",
      },
      { property: "og:title", content: "Patkan story engagement" },
      {
        property: "og:description",
        content: "Which parts of the Patkan landing page hold attention and which get scrolled past.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StoryPage,
});

const pct = (n: number | null) => (n === null ? "—" : `${Math.round(n * 100)}%`);
const pts = (n: number | null) =>
  n === null ? "—" : `${n >= 0 ? "+" : ""}${Math.round(n * 100)} pts`;
const secs = (n: number | null) => (n === null ? "—" : `${Math.round(n / 1000)} s`);

const SECTION_LABEL: Record<string, string> = {
  hero: "Hero",
  playground: "Playground",
  pillars: "How it works",
  install: "Install guide",
  privacy: "Privacy",
};

function verdict(row: StoryStats["sections"][number]) {
  if (row.reach < 0.2) return "move up";
  if ((row.holdMs ?? 0) < 4000) return "rewrite";
  if (row.drop > 0.25) return "losing people";
  if ((row.assist ?? 0) > 0.05) return "the win";
  return "keep";
}

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function StoryPage() {
  const [days, setDays] = useState(14);
  const fetchStats = useServerFn(getStoryStats);
  const { data, isLoading, error } = useQuery<StoryStats>({
    queryKey: ["admin-story", days],
    queryFn: () => fetchStats({ data: { days } }),
    retry: false,
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center text-sm text-muted-foreground">
        Couldn&apos;t load engagement data.
      </main>
    );
  }

  const top = Math.max(1, ...data.funnel.map((f) => f.count));

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Story</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Last {data.windowDays} days · {data.sessions} sessions · {data.visitors} people. No text is
            collected.
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <Button key={d} size="sm" variant={d === days ? "default" : "outline"} onClick={() => setDays(d)}>
              {d}d
            </Button>
          ))}
        </div>
      </header>

      <section className="mt-6 rounded-lg border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Funnel</p>
        <ul className="mt-3 space-y-2">
          {data.funnel.map((f) => (
            <li key={f.step} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 text-muted-foreground">{f.step}</span>
              <span className="h-2 rounded-sm bg-primary" style={{ width: `${(f.count / top) * 70}%` }} />
              <span className="tabular-nums">{f.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-lg border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Section by section</p>
        <table className="mt-2 w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr>
              <th className="py-1 font-normal">Section</th>
              <th className="py-1 font-normal">Reach</th>
              <th className="py-1 font-normal">Hold</th>
              <th className="py-1 font-normal">Drop</th>
              <th className="py-1 font-normal">Assist</th>
              <th className="py-1 font-normal">Read</th>
            </tr>
          </thead>
          <tbody>
            {data.sections.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-2 text-muted-foreground">
                  No data yet — visits will start appearing here.
                </td>
              </tr>
            ) : (
              data.sections.map((s) => (
                <tr key={s.section} className="border-t border-border">
                  <td className="py-1.5">{SECTION_LABEL[s.section] ?? s.section}</td>
                  <td className="py-1.5 tabular-nums">{pct(s.reach)}</td>
                  <td className="py-1.5 tabular-nums">{secs(s.holdMs)}</td>
                  <td className="py-1.5 tabular-nums">{pct(s.drop)}</td>
                  <td className="py-1.5 tabular-nums">{pts(s.assist)}</td>
                  <td className="py-1.5 text-muted-foreground">{verdict(s)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.scrollDepth.map((d) => (
          <Card key={d.depth} label={`Scrolled ${d.depth}%`} value={pct(d.share)} />
        ))}
      </section>

      <section className="mt-6">
        <h2 className="text-xs uppercase tracking-wide text-muted-foreground">Extension</h2>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card label="Installs" value={String(data.extension.initialized)} />
          <Card label="Triggers" value={String(data.extension.triggers)} hint="// detected" />
          <Card
            label="Injection failures"
            value={pct(data.extension.injectionFailureRate)}
            hint={`${data.extension.injectionFailures} of ${data.extension.triggers}`}
          />
          <Card label="Hit the wall" value={String(data.extension.quotaWalls)} />
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Devices</p>
          <ul className="mt-2 space-y-1 text-sm">
            {data.devices.length === 0 ? (
              <li className="text-muted-foreground">No data yet.</li>
            ) : (
              data.devices.map((d) => (
                <li key={d.key} className="flex justify-between">
                  <span>{d.key}</span>
                  <span className="tabular-nums text-muted-foreground">{d.count}</span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Referrers</p>
          <ul className="mt-2 space-y-1 text-sm">
            {data.referrers.length === 0 ? (
              <li className="text-muted-foreground">Direct only, so far.</li>
            ) : (
              data.referrers.map((r) => (
                <li key={r.key} className="flex justify-between">
                  <span className="truncate">{r.key}</span>
                  <span className="tabular-nums text-muted-foreground">{r.count}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}
