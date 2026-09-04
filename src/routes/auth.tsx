import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Patkan" },
      {
        name: "description",
        content: "Sign in to Patkan to save your prompt frameworks and sync your Library across devices.",
      },
      { property: "og:title", content: "Sign in to Patkan" },
      {
        property: "og:description",
        content: "Sign in to Patkan to save your prompt frameworks and sync your Library across devices.",
      },
    ],
  }),
  component: AuthPage,
});

const PUBLIC_ORIGIN = "https://patkan.lovable.app";

/**
 * Auth emails and OAuth callbacks must land on the public site. The editor
 * preview host sits behind its own access gate, so a link pointing there asks
 * the user for a completely unrelated login.
 */
function authOrigin() {
  const origin = window.location.origin;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || origin.startsWith("http://127.0.0.1")) {
    return origin;
  }
  return origin.includes(".lovable.app") && origin !== PUBLIC_ORIGIN ? PUBLIC_ORIGIN : origin;
}

function AuthPage() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function safeNext() {
    const value = new URLSearchParams(window.location.search).get("next");
    if (!value) return "/library";
    try {
      const url = new URL(value, window.location.origin);
      if (url.origin !== window.location.origin || !url.pathname.startsWith("/")) return "/library";
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return "/library";
    }
  }


  useEffect(() => {
    if (!loading && session) {
      window.location.assign(safeNext());
    }
  }, [loading, session]);

  async function withGoogle() {
    setMessage(null);
    const next = safeNext();
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth?next=${encodeURIComponent(next)}`,
    });
    if (result.error) setMessage(result.error.message);
  }

  async function withEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const fn =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(safeNext())}` },
          });
    const { error } = await fn;
    setBusy(false);
    if (error) {
      setMessage(error.message);
    } else if (mode === "signup") {
      setMessage("Check your inbox to confirm your address, then sign in.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <span className="text-base">✦</span> Patkan
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Sign in" : "Create an account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your Library of saved frameworks syncs to the extension on every device.
        </p>

        <Button onClick={withGoogle} variant="outline" className="mt-6 w-full">
          Continue with Google
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={withEmail} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>

        {message ? <p className="mt-4 text-sm text-destructive">{message}</p> : null}

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {mode === "signin" ? "No account yet? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
