import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/mcp-consent")({
  head: () => ({ meta: [{ title: "Connect Patkan" }] }),
  component: McpConsentPage,
});

function McpConsentPage() {
  const { session, loading } = useAuth();
  const [authorizationId, setAuthorizationId] = useState<string | null>(null);
  const [clientName, setClientName] = useState("MCP client");
  const [scope, setScope] = useState("your Patkan tools");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("authorization_id");
    setAuthorizationId(id);
    if (!id) return;
    if (loading) return;
    if (!session) {
      const next = `/mcp-consent?authorization_id=${encodeURIComponent(id)}`;
      window.location.assign(`/auth?next=${encodeURIComponent(next)}`);
      return;
    }

    void supabase.auth.oauth.getAuthorizationDetails(id).then(({ data, error }) => {
      if (error) {
        setMessage("This connection request is invalid or has expired.");
      } else if ("redirect_url" in data) {
        window.location.assign(data.redirect_url);
      } else {
        setClientName(data.client.name);
        setScope(data.scope || "your Patkan tools");
      }
    });
  }, [loading, session]);

  async function decide(action: "approve" | "deny") {
    if (!authorizationId) return;
    setBusy(true);
    setMessage(null);
    const result =
      action === "approve"
        ? await supabase.auth.oauth.approveAuthorization(authorizationId, { skipBrowserRedirect: true })
        : await supabase.auth.oauth.denyAuthorization(authorizationId, { skipBrowserRedirect: true });
    if (result.error) {
      setMessage(result.error.message);
      setBusy(false);
      return;
    }
    window.location.assign(result.data.redirect_url);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium text-primary">Patkan connection</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Allow {clientName} to use Patkan?</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This lets the connected agent transform prompts and read your saved Patkan frameworks.
        </p>
        <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium">Requested access</p>
          <p className="mt-1 text-muted-foreground">{scope}</p>
        </div>
        {message ? <p className="mt-4 text-sm text-destructive">{message}</p> : null}
        <div className="mt-8 flex gap-3">
          <Button variant="outline" className="flex-1" disabled={busy} onClick={() => void decide("deny")}>
            Deny
          </Button>
          <Button className="flex-1" disabled={busy || !authorizationId} onClick={() => void decide("approve")}>
            {busy ? "Connecting…" : "Allow access"}
          </Button>
        </div>
      </section>
    </main>
  );
}