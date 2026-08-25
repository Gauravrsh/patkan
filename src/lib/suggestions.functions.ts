import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type SuggestField = "role" | "scenario" | "objective";

const FIELDS = new Set<SuggestField>(["role", "scenario", "objective"]);

function client() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function escapeLike(value: string) {
  return value.replace(/[%_\\]/g, (match) => `\\${match}`);
}

export type SuggestResult = {
  matches: string[];
  /** Word(s) that most likely continue what the user typed. */
  continuation: string | null;
};

export const suggestField = createServerFn({ method: "POST" })
  .inputValidator((input: { field: SuggestField; prefix: string }) => {
    if (!FIELDS.has(input.field)) throw new Error("Unsupported field");
    return { field: input.field, prefix: String(input.prefix ?? "").slice(0, 160) };
  })
  .handler(async ({ data }): Promise<SuggestResult> => {
    const prefix = normalize(data.prefix);
    if (prefix.length < 2) return { matches: [], continuation: null };

    const supabase = client();

    const [byPrefix, byContains] = await Promise.all([
      supabase
        .from("field_suggestions")
        .select("value, uses, last_used_at")
        .eq("field", data.field)
        .like("value_norm", `${escapeLike(prefix)}%`)
        .order("uses", { ascending: false })
        .order("last_used_at", { ascending: false })
        .limit(8),
      supabase
        .from("field_suggestions")
        .select("value, uses, last_used_at")
        .eq("field", data.field)
        .ilike("value_norm", `%${escapeLike(prefix)}%`)
        .order("uses", { ascending: false })
        .order("last_used_at", { ascending: false })
        .limit(8),
    ]);

    const matches: string[] = [];
    for (const row of [...(byPrefix.data ?? []), ...(byContains.data ?? [])]) {
      if (!matches.includes(row.value)) matches.push(row.value);
      if (matches.length === 8) break;
    }

    // Word continuation from the n-gram table.
    const words = prefix.split(" ");
    const endsWithSpace = /\s$/.test(data.prefix);
    let continuation: string | null = null;

    // Only continue when the last token looks complete (trailing space).
    if (endsWithSpace && words.length > 0) {
      const candidates = [
        words.slice(-2).join(" "),
        words[words.length - 1] as string,
      ].filter((p) => p.length > 0);

      for (const key of candidates) {
        const { data: rows } = await supabase
          .from("field_ngrams")
          .select("next_word, uses")
          .eq("field", data.field)
          .eq("prefix", key)
          .order("uses", { ascending: false })
          .limit(1);
        if (rows && rows.length > 0) {
          continuation = rows[0]!.next_word;
          break;
        }
      }
    }

    return { matches, continuation };
  });

export const recordFieldUsage = createServerFn({ method: "POST" })
  .inputValidator((input: { entries: { field: SuggestField; value: string }[] }) => ({
    entries: (input.entries ?? [])
      .filter((entry) => FIELDS.has(entry.field) && typeof entry.value === "string")
      .slice(0, 3)
      .map((entry) => ({ field: entry.field, value: entry.value.slice(0, 400) })),
  }))
  .handler(async ({ data }) => {
    const supabase = client();
    await Promise.all(
      data.entries.map((entry) =>
        supabase.rpc("record_field_usage", { _field: entry.field, _value: entry.value }),
      ),
    );
    return { ok: true };
  });
