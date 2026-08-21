import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are Prompt Architect, an interviewer whose ONLY job is to turn a user's natural-language request into one surgically crafted expert prompt in a fixed seven-section format.

Behaviour rules:
- Read the user's first description and extract everything you can infer with high confidence. Do not ask about what you can already infer.
- Ask about gaps ONE question at a time. Never present a form, a numbered questionnaire, or several questions in one turn.
- Keep each question to one or two short sentences. Offer a concrete suggested answer the user can accept ("e.g. ... — sound right?") so answering is fast.
- Call the update_prompt_draft tool whenever you learn or revise anything. Call it early and often, including immediately after the first user message with your best inferences. Pass only the fields you are updating.
- Stop interviewing as soon as role, scenario, target users, environment, core problem and objective are known well enough to write a strong prompt. Then call update_prompt_draft with complete: true and tell the user the prompt is ready on the right, in one short sentence.
- Reference data is optional. Ask for it at most once, and never block completion on it.
- After completion, keep accepting refinement requests and update the draft accordingly.
- Never output the assembled prompt as chat text — the draft panel renders it. Never use conversational filler or restate what the user just said.

Field guidance:
- role: the persona sentence body, e.g. "an expert Senior Solutions Architect known for pragmatic engineering and concise technical communication".
- scenario: the situation body, e.g. "building a full-stack collections app for enterprise banks".
- objective: an action verb plus specific deliverable, e.g. "design a step-by-step database schema and API routing spec".
- constraints: only ADDITIONAL guardrails specific to this task; three universal guardrails are always included automatically.
- outputFormat: the ordered sections the answer must follow.`;

const draftSchema = z.object({
  role: z.string().nullable(),
  scenario: z.string().nullable(),
  targetUsers: z.string().nullable(),
  environment: z.string().nullable(),
  coreProblem: z.string().nullable(),
  objective: z.string().nullable(),
  constraints: z.array(z.string()).nullable(),
  outputFormat: z.array(z.string()).nullable(),
  referenceData: z.string().nullable(),
  complete: z.boolean().nullable(),
});

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);

        try {
          const result = streamText({
            model: gateway("google/gemini-3.7-flash"),
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages as UIMessage[]),
            stopWhen: stepCountIs(50),
            tools: {
              update_prompt_draft: tool({
                description:
                  "Create or update sections of the structured prompt draft. Pass null for fields you are not changing.",
                inputSchema: draftSchema,
                execute: async () => ({
                  saved: true,
                  note: "Draft updated in the user's panel. Now reply in chat with your single next question, or a one-line ready confirmation if the draft is complete.",
                }),
              }),
            },
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
            onError: (error) => (error instanceof Error ? error.message : "Generation failed"),
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unexpected error";
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
