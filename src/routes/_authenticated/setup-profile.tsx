import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { PRIMARY_DOMAINS, safeNextPath } from "@/lib/onboarding";

export const Route = createFileRoute("/_authenticated/setup-profile")({
  head: () => ({
    meta: [
      { title: "Set up your Patkan profile" },
      { name: "description", content: "Tell Patkan what to call you and the work you do." },
      { property: "og:title", content: "Set up your Patkan profile" },
      { property: "og:description", content: "Tell Patkan what to call you and the work you do." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SetupProfile,
});

function SetupProfile() {
  const { user } = Route.useRouteContext();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = () => safeNextPath(new URLSearchParams(window.location.search).get("next"));

  useEffect(() => {
    if (user.user_metadata?.["onboarded"]) {
      window.location.replace(next());
      return;
    }
    void supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.display_name) setName(data.display_name);
    });
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const display = name.trim();
    if (!display || !domain) return;
    setBusy(true);
    setError(null);
    const { error: authErr } = await supabase.auth.updateUser({
      data: { onboarded: true, display_name: display, primary_domain: domain },
    });
    if (!authErr) await supabase.from("profiles").update({ display_name: display }).eq("id", user.id);
    setBusy(false);
    if (authErr) {
      setError(authErr.message);
      return;
    }
    window.location.assign(next());
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <form onSubmit={save} className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to Patkan</h1>
        <p className="mt-2 text-sm text-muted-foreground">Let&apos;s tailor your prompt transformations to your daily work.</p>

        <div className="mt-8 space-y-1.5">
          <Label htmlFor="display-name">What should we call you?</Label>
          <Input id="display-name" required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium">What is your primary domain?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRIMARY_DOMAINS.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={domain === d}
                onClick={() => setDomain(d)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  domain === d ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-accent"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </fieldset>

        <Button type="submit" className="mt-8 w-full" disabled={busy || !name.trim() || !domain}>
          {busy ? "Saving…" : "Save & Continue"}
        </Button>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </form>
    </main>
  );
}
