import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Trash2, Globe, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: "Your Patkan Library" },
      {
        name: "description",
        content: "Save, edit and share the prompt frameworks Patkan applies to your rough input.",
      },
      { property: "og:title", content: "Your Patkan Library" },
      {
        property: "og:description",
        content: "Save, edit and share the prompt frameworks Patkan applies to your rough input.",
      },
    ],
  }),
  component: LibraryPage,
});

interface Template {
  id: string;
  title: string;
  system_instruction: string;
  is_public: boolean;
  user_id: string;
}

const EMPTY = { id: "", title: "", system_instruction: "", is_public: false };

function LibraryPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<typeof EMPTY | null>(null);

  const { data: userId } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null,
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompt_templates")
        .select("id, title, system_instruction, is_public, user_id")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Template[];
    },
  });

  const save = useMutation({
    mutationFn: async (t: typeof EMPTY) => {
      if (!userId) throw new Error("Not signed in");
      const payload = {
        title: t.title.trim(),
        system_instruction: t.system_instruction.trim(),
        is_public: t.is_public,
        user_id: userId,
      };
      const { error } = t.id
        ? await supabase.from("prompt_templates").update(payload).eq("id", t.id)
        : await supabase.from("prompt_templates").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft(null);
      void qc.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Framework saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("prompt_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Deleted");
    },
  });

  const mine = templates.filter((t) => t.user_id === userId);
  const shared = templates.filter((t) => t.user_id !== userId);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ✦ Patkan
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Your Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Frameworks the extension can apply on top of any transform.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              void navigate({ to: "/" });
            }}
          >
            Sign out
          </Button>
          <Button size="sm" onClick={() => setDraft({ ...EMPTY })}>
            <Plus /> New framework
          </Button>
        </div>
      </header>

      {draft ? (
        <form
          className="mt-8 space-y-4 rounded-lg border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(draft);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              placeholder="Strict PRD"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="instruction">System instruction</Label>
            <Textarea
              id="instruction"
              required
              rows={7}
              className="font-mono text-[13px]"
              placeholder="Always include a Risks table and an explicit out-of-scope list…"
              value={draft.system_instruction}
              onChange={(e) => setDraft({ ...draft, system_instruction: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="public"
                checked={draft.is_public}
                onCheckedChange={(v) => setDraft({ ...draft, is_public: v })}
              />
              <Label htmlFor="public" className="text-sm font-normal text-muted-foreground">
                Share publicly
              </Label>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </form>
      ) : null}

      <section className="mt-8">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Yours</h2>
        {isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        ) : mine.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Nothing saved yet. Create a framework, and the extension will offer it in its persona list.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {mine.map((t) => (
              <li key={t.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{t.title}</span>
                      {t.is_public ? (
                        <Globe className="size-3.5 text-muted-foreground" />
                      ) : (
                        <Lock className="size-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 font-mono text-xs text-muted-foreground">
                      {t.system_instruction}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setDraft({ ...t })}>
                      <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(t.id)}>
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {shared.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Public frameworks
          </h2>
          <ul className="mt-3 space-y-2">
            {shared.map((t) => (
              <li key={t.id} className="rounded-lg border bg-card p-4">
                <span className="font-medium">{t.title}</span>
                <p className="mt-1 line-clamp-2 font-mono text-xs text-muted-foreground">
                  {t.system_instruction}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
