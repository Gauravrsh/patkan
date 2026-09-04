import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAdminStats, type AdminStats, type Breakdown } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Patkan usage & performance" },
      {
        name: "description",
        content: "Internal dashboard for Patkan transform volume, engine mix, latency and cost.",
      },
      { property: "og:title", content: "Patkan usage & performance" },
      {
        property: "og:description",
        content: "Internal dashboard for Patkan transform volume, engine mix, latency and cost.",
      },
    ],
  }),
  component: AdminPage,
});

const pct = (n: number | null) => (n === null ? "—" : `${Math.round(n * 100)}%`);
const ms = (n: number | null) => (n === null ? "—" : `${n} ms`);

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function List({ title, rows }: { title: string; rows: Breakdown[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm">
          {rows.map((r) => (
            <li key={r.key} className="flex justify-between gap-4">
              <span className="truncate">{r.key}</span>
              <span className="tabular-nums text-muted-foreground">{r.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AdminPage() {
  const [days, setDays] = useState(14);
  const fetchStats = useServerFn(getAdminStats);
  const { data, isLoading, error } = useQuery<AdminStats>({
    queryKey: ["admin-stats", days],
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

  if (error) {
    const forbidden = String(error.message).includes("Forbidden");
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-xl font-semibold tracking-tight">
            {forbidden ? "Not your dashboard" : "Couldn't load analytics"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {forbidden
              ? "This page is limited to Patkan admins."
              : "Something went wrong reading the analytics."}
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/">Back to Patkan</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const maxDay = Math.max(1, ...data.perDay.map((d) => d.ghost + d.signedIn));

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usage &amp; performance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Last {data.windowDays} days · {data.total} transforms. No prompt text is stored.
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <Button
              key={d}
              size="sm"
              variant={d === days ? "default" : "outline"}
              onClick={() => setDays(d)}
            >
              {d}d
            </Button>
          ))}
        </div>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Transforms" value={String(data.total)} />
        <Card label="Cache hit rate" value={pct(data.cacheHitRate)} hint="Served without inference" />
        <Card
          label="Acceptance"
          value={pct(data.acceptanceRate)}
          hint={`${data.acceptanceSample} rated`}
        />
        <Card label="Est. spend" value={`$${data.estimatedUsd.toFixed(2)}`} hint="Model cost estimate" />
        <Card label="Error rate" value={pct(data.errorRate)} />
        <Card label="Empty output" value={pct(data.emptyRate)} />
        <Card label="Hit the wall" value={String(data.limitedCount)} hint="429 responses" />
        <Card
          label="Ghosts at limit"
          value={String(data.ghostWallDevices)}
          hint="Unique devices — sign-up funnel"
        />
      </section>

      <section className="mt-6 rounded-lg border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Per day</p>
        <div className="mt-3 flex items-end gap-1.5">
          {data.perDay.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            data.perDay.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${d.day}: ${d.signedIn} signed-in, ${d.ghost} ghost`}>
                <div className="flex h-28 w-full flex-col justify-end">
                  <div
                    className="w-full rounded-t-sm bg-primary"
                    style={{ height: `${(d.signedIn / maxDay) * 100}%` }}
                  />
                  <div
                    className="w-full bg-muted-foreground/40"
                    style={{ height: `${(d.ghost / maxDay) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.day.slice(5)}</span>
              </div>
            ))
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Solid = signed-in · muted = ghost
        </p>
      </section>

      <section className="mt-6 rounded-lg border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Engines</p>
        <table className="mt-2 w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr>
              <th className="py-1 font-normal">Engine</th>
              <th className="py-1 font-normal">Served</th>
              <th className="py-1 font-normal">p50</th>
              <th className="py-1 font-normal">p95</th>
              <th className="py-1 font-normal">First token</th>
            </tr>
          </thead>
          <tbody>
            {data.engines.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-2 text-muted-foreground">
                  No data yet.
                </td>
              </tr>
            ) : (
              data.engines.map((e) => (
                <tr key={e.engine} className="border-t border-border">
                  <td className="py-1.5">{e.engine}</td>
                  <td className="py-1.5 tabular-nums">{e.count}</td>
                  <td className="py-1.5 tabular-nums">{ms(e.p50)}</td>
                  <td className="py-1.5 tabular-nums">{ms(e.p95)}</td>
                  <td className="py-1.5 tabular-nums">{ms(e.ttfbP50)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <List title="Top hosts" rows={data.hosts} />
        <List title="Personas" rows={data.personas} />
        <List title="Dialects" rows={data.dialects} />
      </section>
    </main>
  );
}
