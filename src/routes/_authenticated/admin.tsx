import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getMyAdminAccess } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminShell,
});

function AdminShell() {
  const checkAccess = useServerFn(getMyAdminAccess);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-admin-access"],
    queryFn: () => checkAccess(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error || !data?.isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-xl font-semibold tracking-tight">Not your page</h1>
          <p className="mt-2 text-sm text-muted-foreground">This page is limited to Patkan admins.</p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/">Back to Patkan</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur print:hidden">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-1 px-6 py-2 text-sm">
          <Link
            to="/admin"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-foreground font-medium" }}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Usage
          </Link>
          <Link
            to="/admin/story"
            activeProps={{ className: "text-foreground font-medium" }}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Story
          </Link>
          <Link
            to="/admin/events"
            activeProps={{ className: "text-foreground font-medium" }}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Events
          </Link>
          <Link
            to="/admin/docs"
            activeProps={{ className: "text-foreground font-medium" }}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Docs
          </Link>
          <Link
            to="/admin/carousel"
            activeProps={{ className: "text-foreground font-medium" }}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Carousel
          </Link>
          <span className="ml-auto flex items-center gap-4">
            <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
              Back to Patkan
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign out
            </button>
          </span>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
