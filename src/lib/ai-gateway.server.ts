import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Provider helper connecting the AI SDK to the Lovable AI Gateway.
 * Server-only: never import this from client code.
 */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}
