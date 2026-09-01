import { createFileRoute } from "@tanstack/react-router";

import { McpConsentPage } from "@/routes/mcp-consent";

export const Route = createFileRoute("/oauth/consent")({
  head: () => ({ meta: [{ title: "Connect Patkan" }] }),
  component: McpConsentPage,
});