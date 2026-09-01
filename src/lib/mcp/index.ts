import { auth, defineMcp } from "@lovable.dev/mcp-js";

import templatesTool from "./tools/templates";
import transformTool from "./tools/transform";

const supabaseUrl = (process.env["SUPABASE_URL"] ?? "https://supabase.invalid").replace(/\/+$/, "");

export default defineMcp({
  name: "patkan-mcp",
  title: "Patkan",
  version: "0.1.0",
  instructions:
    "Patkan turns rough natural-language requests into precise, model-ready prompts. Use transform_prompt for prompt compilation and list_prompt_templates to inspect the signed-in user's Library.",
  auth: auth.oauth.issuer({
    issuer: `${supabaseUrl}/auth/v1`,
    acceptedAudiences: "authenticated",
    jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
  }),
  tools: [transformTool, templatesTool],
});