import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { OTHER_ROLE, ROLES, ROLE_TASKS } from "@/lib/profile-tasks";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Tailor Patkan to your daily work" },
      { name: "description", content: "Save your role and everyday tasks so your transformed prompts match how you actually work." },
      { property: "og:title", content: "Tailor Patkan to your daily work" },
      { property: "og:description", content: "Save your role and everyday tasks so your transformed prompts match how you actually work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { session, loading } = useAuth();
  const [role, setRole] = useState("");
  const [other, setOther] = useState("");
  const [tasks, setTasks] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("profiles")
      .select("work_role, work_role_other, daily_tasks")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setRole(data.work_role ?? "");
        setOther(data.work_role_other ?? "");
        setTasks(data.daily_tasks ?? []);
      });
  }, [session]);

  if (loading) return null;

  if (!session) {
    return (
      <Shell>
        <Button asChild className="w-full">
          <Link to="/auth" search={{ next: "/profile" } as never}>Set up profile</Link>
        </Button>
      </Shell>
    );
  }

  const taskList = ROLE_TASKS[role] ?? [];
  const toggle = (t: string) => setTasks((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  async function save() {
    if (!session || !role) return;
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.from("profiles").upsert({
      id: session.user.id,
      work_role: role,
      work_role_other: role === OTHER_ROLE ? other.trim().slice(0, 80) : null,
      daily_tasks: role === OTHER_ROLE ? [] : tasks.filter((t) => taskList.includes(t)),
    });
    setBusy(false);
    if (err) return setError(err.message);
    // Connect hands the session to the extension so transforms use this profile.
    window.location.assign("/connect");
  }

  return (
    <Shell>
      <label className="block text-xs font-semibold tracking-wider text-muted-foreground">YOUR ROLE</label>
      <select
        className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={role}
        onChange={(e) => {
          setRole(e.target.value);
          setTasks([]);
        }}
      >
        <option value="">Select your profession</option>
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
        <option value={OTHER_ROLE}>{OTHER_ROLE}</option>
      </select>

      {role === OTHER_ROLE && (
        <div className="mt-3">
          <label className="block text-xs text-muted-foreground">Enter your exact profession</label>
          <Input className="mt-1" maxLength={80} value={other} onChange={(e) => setOther(e.target.value)} placeholder="e.g. Underwriter, Supply Chain Analyst, Architect" />
        </div>
      )}

      {taskList.length > 0 && (
        <fieldset className="mt-6">
          <legend className="text-xs font-semibold tracking-wider text-muted-foreground">TASKS YOU PERFORM DAILY (Select all that apply)</legend>
          <div className="mt-3 space-y-2">
            {taskList.map((t) => (
              <label key={t} className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 accent-primary" checked={tasks.includes(t)} onChange={() => toggle(t)} />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 flex items-center gap-3">
        <Button onClick={save} disabled={busy || !role || (role === OTHER_ROLE && !other.trim())}>Save & Tailor Prompts</Button>
        <Button variant="ghost" asChild>
          <Link to="/">Maybe later</Link>
        </Button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-lg px-5 py-16">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">Tailor Patkan to your daily work</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Save your role and everyday tasks so your transformed prompts match how you actually work.
        </p>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
