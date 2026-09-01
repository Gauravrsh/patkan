import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";

import {
  DAILY_FREE_LIMIT,
  MAX_INPUT_CHARS,
  buildMetaSystemPrompt,
  buildMetaUserMessage,
  classifyLocal,
  getPersona,
  localScaffold,
  splitMeta,
  type Dialect,
  type Intensity,
} from "@/lib/patkan-core";

import { createUserSupabaseClient } from "../supabase-user";

const DIALECT_VALUES = ["xml", "markdown", "sectioned"] as const;
const INTENSITY_VALUES = ["light", "standard", "surgical"] as const;

async function loadTemplate(token: string, id: string) {
  const supabase = createUserSupabaseClient(token);
  const { data, error } = await supabase
    .from("prompt_templates")
    .select("title, system_instruction")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new ToolError("Could not load that Patkan framework.");
  if (!data) throw new ToolError("That framework does not exist in your Library.");
  return data;
}

export default defineTool({
  name: "transform_prompt",
  title: "Transform rough text into an expert prompt",
  description:
    "Compile a rough request into a precise, model-ready prompt using Patkan's intent-aware prompt engine and an optional saved framework.",
  inputSchema: {
    text: z.string().min(1).max(MAX_INPUT_CHARS),
    framework_id: z.string().uuid().optional(),
    dialect: z.enum(DIALECT_VALUES).optional(),
    intensity: z.enum(INTENSITY_VALUES).optional(),
    refinement: z.string().max(1000).optional(),
  },
  outputSchema: {},
  handler: async ({ text, framework_id, dialect: requestedDialect, intensity: requestedIntensity, refinement }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Sign in to Patkan before transforming prompts.");
    const token = ctx.getToken();
    const userId = ctx.getUserId();
    if (!token || !userId) throw new ToolError("Patkan could not verify your session.");

    const input = text.trim();
    if (!input) throw new ToolError("Nothing to transform.");
    const { intent, complexity } = classifyLocal(input);
    const dialect: Dialect = requestedDialect ?? "markdown";
    const intensity: Intensity = requestedIntensity ?? (complexity === "deep" ? "surgical" : "standard");
    const framework = framework_id ? await loadTemplate(token, framework_id) : null;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const day = new Date().toISOString().slice(0, 10);
    const subjectKey = `user:${userId}`;
    const { data: existing } = await supabaseAdmin
      .from("usage_counters")
      .select("id, count")
      .eq("subject_key", subjectKey)
      .eq("day", day)
      .maybeSingle();
    const used = existing?.count ?? 0;
    if (used >= DAILY_FREE_LIMIT) {
      throw new ToolError(`You've used all ${DAILY_FREE_LIMIT} transforms for today.`);
    }

    const apiKey = process.env["LOVABLE_API_KEY"];

    let prompt = "";
    let assumptions: string[] = [];
    let clarifiers: { label: string; refinement: string }[] = [];

    if (apiKey) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "google/gemini-3.7-flash",
          stream: false,
          messages: [
            { role: "system", content: buildMetaSystemPrompt(dialect) },
            {
              role: "user",
              content: buildMetaUserMessage(input, getPersona("auto"), {
                intensity,
                intent,
                complexity,
                customInstruction: framework?.system_instruction,
                refinement,
              }),
            },
          ],
        }),
      }).catch(() => null);

      if (response?.ok) {
        const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const parsed = splitMeta(data.choices?.[0]?.message?.content ?? "");
        prompt = parsed.prompt;
        assumptions = parsed.assumptions;
        clarifiers = parsed.clarifiers;
      }
    }

    if (!prompt) {
      prompt = localScaffold(input, { dialect, intensity, persona: "auto" });
    }
    if (!prompt) throw new ToolError("Patkan could not create a prompt from that input.");

    const nextCount = used + 1;
    if (existing) {
      await supabaseAdmin
        .from("usage_counters")
        .update({ count: nextCount, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("usage_counters").insert({ subject_key: subjectKey, day, count: 1 });
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            prompt,
            assumptions,
            clarifiers,
            dialect,
            intent,
            intensity,
            framework: framework?.title ?? null,
            usage: { used: nextCount, limit: DAILY_FREE_LIMIT },
          }),
        },
      ],
    };
  },
});