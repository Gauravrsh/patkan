import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
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

/** The canonical public home of Patkan. Every emailed link must land here. */
const PUBLIC_ORIGIN = "https://patkan.in";

/** Where people go once they are signed in: the playground on the landing page. */
const DEFAULT_NEXT = "/#playground";

/**
 * Confirmation and reset links must open on patkan.in. Any Lovable-hosted
 * address sits behind a separate access gate, which shows the visitor a
 * sign-in form for a product that is not Patkan.
 */
function authOrigin() {
  const origin = window.location.origin;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || origin.startsWith("http://127.0.0.1")) {
    return origin;
  }
  return PUBLIC_ORIGIN;
}

function AuthPage() {
  const { session, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    // A password-reset link opens a recovery session. Show a "set new
    // password" form instead of the signed-in panel, or the person can
    // never actually choose a new password.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function setNewPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    window.location.assign(safeNext());
  }

  function safeNext() {
    const value = new URLSearchParams(window.location.search).get("next");
    if (!value) return DEFAULT_NEXT;
    try {
      const url = new URL(value, window.location.origin);
      if (url.origin !== window.location.origin || !url.pathname.startsWith("/")) return DEFAULT_NEXT;
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return DEFAULT_NEXT;
    }
  }

  async function withEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const next = safeNext();
    const fn =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${authOrigin()}/auth?next=${encodeURIComponent(next)}` },
          });
    const { error, data } = await fn;
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (data.session) {
      window.location.assign(next);
      return;
    }
    if (mode === "signup") {
      setMessage("Check your inbox to confirm your address, then sign in.");
    }
  }

  async function forgotPassword() {
    if (!email) {
      setMessage("Enter your email address first, then tap this again.");
      return;
    }
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${authOrigin()}/auth?next=${encodeURIComponent(safeNext())}`,
    });
    setBusy(false);
    setMessage(error ? error.message : "Password reset link sent. Check your inbox.");
  }

  if (!loading && session && recovering) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <span className="text-base">✦</span> Patkan
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You opened a password-reset link. Set a new password to finish.
          </p>
          <form onSubmit={setNewPassword} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Working…" : "Save new password"}
            </Button>
          </form>
          {message ? <p className="mt-4 text-sm text-destructive">{message}</p> : null}
        </div>
      </main>
    );
  }

  if (!loading && session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
        <div className="w-full max-w-sm rounded-lg border bg-card p-8 text-center shadow-sm">
          <p className="text-base leading-relaxed">
            You&rsquo;re signed in as{" "}
            <span className="font-medium">{session.user.email}</span>. Get your best work done :)
          </p>
          <div className="mt-6 space-y-2">
            <Button asChild className="w-full">
              <a href="/#playground">Continue to Patkan</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/library">Your Library</Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={async () => {
                await supabase.auth.signOut();
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </main>
    );
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

        <form onSubmit={withEmail} className="mt-6 space-y-4">
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

        <div className="mt-6 flex flex-col items-start gap-2">
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {mode === "signin" ? "No account yet? Sign up" : "Already have an account? Sign in"}
          </button>
          {mode === "signin" ? (
            <button
              type="button"
              onClick={forgotPassword}
              disabled={busy}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Forgot your password?
            </button>
          ) : null}
        </div>
      </div>
    </main>
  );
}
