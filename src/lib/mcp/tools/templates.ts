import { defineTool, ToolError } from "@lovable.dev/mcp-js";

import { createUserSupabaseClient } from "../supabase-user";

export default defineTool({
  name: "list_prompt_templates",
  title: "List prompt templates",
  description: "List the authenticated Patkan user's saved prompt frameworks, newest first.",
  inputSchema: {},
  outputSchema: {},
  handler: async (_args, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Sign in to Patkan to access your Library.");
    const token = ctx.getToken();
    if (!token) throw new ToolError("Patkan could not verify your session.");

    const supabase = createUserSupabaseClient(token);
    const { data, error } = await supabase
      .from("prompt_templates")
      .select("id, title, system_instruction, is_public, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("patkan MCP: template read failed", error);
      throw new ToolError("Could not load your Patkan Library.");
    }

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            templates: (data ?? []).map((template) => ({
              id: template.id,
              title: template.title,
              instruction: template.system_instruction,
              public: template.is_public,
              updatedAt: template.updated_at,
            })),
          }),
        },
      ],
    };
  },
});