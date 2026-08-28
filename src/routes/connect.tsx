import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "Connect Patkan to your browser" },
      {
        name: "description",
        content: "Link your signed-in Patkan account to the browser extension so your Library syncs.",
      },
      { property: "og:title", content: "Connect Patkan to your browser" },
      {
        property: "og:description",
        content: "Link your signed-in Patkan account to the browser extension so your Library syncs.",
      },
    ],
  }),
  component: ConnectPage,
});

function ConnectPage() {
  const { session, loading } = useAuth();
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!session) return;
    window.postMessage(
      {
        source: "patkan-web",
        type: "PATKAN_SESSION",
        payload: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          email: session.user.email,
        },
      },
      window.location.origin,
    );
    setSent(true);
  }, [session]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        {loading ? (
          <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
        ) : !session ? (
          <>
            <h1 className="text-xl font-semibold tracking-tight">Sign in first</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in, then come back to this page and the extension will pick up your account.
            </p>
            <Button asChild className="mt-5">
              <Link to="/auth">Sign in</Link>
            </Button>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto size-7 text-primary" />
            <h1 className="mt-3 text-xl font-semibold tracking-tight">
              {sent ? "Extension connected" : "Connecting…"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Signed in as {session.user.email}. You can close this tab — the Patkan extension now has
              access to your Library.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/library">Open your Library</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
