import { visiblePrompt, type Dialect, type Intensity } from "@/lib/patkan-core";

export interface TransformRequest {
  text: string;
  persona: string;
  dialect: Dialect;
  intensity: Intensity;
  deviceId: string;
  accessToken?: string | undefined;
  refinement?: string | null | undefined;
  customInstruction?: string | null | undefined;
  host?: string | null | undefined;
  surface?: string | undefined;
}


export type EngineId = "primary" | "fallback" | "local";

export interface TransformResult {
  prompt: string;
  engine: EngineId;
  assumptions: string[];
  clarifiers: { label: string; refinement: string }[];
  used?: number | undefined;
  limit?: number | undefined;
}

/**
 * Streams a transform. `onText` receives the prompt as it materialises, so the
 * UI never shows a spinner over an empty box.
 */
export async function streamTransform(
  req: TransformRequest,
  onText: (visible: string) => void,
  onEngine?: (engine: EngineId) => void,
): Promise<TransformResult> {
  const res = await fetch("/api/public/transform", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(req.accessToken ? { Authorization: `Bearer ${req.accessToken}` } : {}),
    },
    body: JSON.stringify({
      text: req.text,
      persona: req.persona,
      dialect: req.dialect,
      intensity: req.intensity,
      deviceId: req.deviceId,
      refinement: req.refinement ?? null,
      customInstruction: req.customInstruction ?? null,
      host: req.host ?? null,
      surface: req.surface ?? "web",
    }),
  });


  if (!res.ok || !res.body) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Transform failed.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let raw = "";
  let result: TransformResult | null = null;
  let failure: string | null = null;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      let event: Record<string, unknown>;
      try {
        event = JSON.parse(trimmed.slice(5).trim()) as Record<string, unknown>;
      } catch {
        continue;
      }
      if (event["type"] === "delta" && typeof event["delta"] === "string") {
        raw += event["delta"];
        onText(visiblePrompt(raw));
      } else if (event["type"] === "engine") {
        onEngine?.(event["engine"] as EngineId);
      } else if (event["type"] === "done") {
        result = {
          prompt: String(event["prompt"] ?? ""),
          engine: (event["engine"] as EngineId) ?? "local",
          assumptions: Array.isArray(event["assumptions"]) ? (event["assumptions"] as string[]) : [],
          clarifiers: Array.isArray(event["clarifiers"])
            ? (event["clarifiers"] as { label: string; refinement: string }[])
            : [],
          used: typeof event["used"] === "number" ? event["used"] : undefined,
          limit: typeof event["limit"] === "number" ? event["limit"] : undefined,
        };
      } else if (event["type"] === "error") {
        failure = String(event["error"] ?? "Transform failed.");
      }
    }
  }

  if (failure) throw new Error(failure);
  if (!result) throw new Error("The transform ended unexpectedly. Try again.");
  onText(result.prompt);
  return result;
}
