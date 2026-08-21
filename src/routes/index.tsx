import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { PromptDraftPanel } from "@/components/PromptDraftPanel";
import { mergeDraft, type PromptDraft } from "@/lib/prompt-draft";
import mark from "@/assets/prompt-architect-mark.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prompt Architect — Turn plain English into expert prompts" },
      {
        name: "description",
        content:
          "A focused chat that interviews you and assembles a surgically structured expert prompt: role, context, objective, guardrails and output format.",
      },
      { property: "og:title", content: "Prompt Architect — expert prompt generator" },
      {
        property: "og:description",
        content:
          "Describe your task in plain language. Prompt Architect asks only what's missing and builds a precision-engineered prompt you can copy or export.",
      },
    ],
  }),
  component: PromptArchitect,
});

const STARTERS = [
  "Help me write a prompt to design a multi-tenant billing schema",
  "I need a prompt that audits my React codebase for accessibility issues",
  "Build me a prompt for writing a cold outbound email sequence",
];

function PromptArchitect() {
  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, error } = useChat({ transport });

  const draft = useMemo<PromptDraft>(() => {
    let acc: PromptDraft = {};
    for (const message of messages) {
      for (const part of message.parts) {
        if (part.type === "tool-update_prompt_draft" && part.input) {
          acc = mergeDraft(acc, part.input as PromptDraft);
        }
      }
    }
    return acc;
  }, [messages]);

  const isBusy = status === "submitted" || status === "streaming";

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || isBusy) return;
    setInput("");
    void sendMessage({ text: value });
  };

  return (
    <main className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center gap-3 border-b border-border px-5 py-3">
        <img src={mark} alt="" width={512} height={512} className="h-6 w-6 object-contain" />
        <div className="leading-tight">
          <h1 className="text-sm font-semibold tracking-tight">Prompt Architect</h1>
          <p className="text-xs text-muted-foreground">
            Natural language in, surgically crafted prompt out.
          </p>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-r">
          <Conversation className="min-h-0 flex-1">
            <ConversationContent className="mx-auto w-full max-w-2xl px-5 py-6">
              {messages.length === 0 ? (
                <div className="py-10">
                  <h2 className="text-lg font-semibold tracking-tight">
                    Describe the task. I'll ask only what's missing.
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    One question at a time, then a complete prompt with role, context, objective,
                    guardrails and output structure.
                  </p>
                  <div className="mt-6 flex flex-col items-start gap-2">
                    {STARTERS.map((starter) => (
                      <button
                        key={starter}
                        type="button"
                        onClick={() => submit(starter)}
                        className="rounded-md border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent"
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const text = message.parts
                    .filter((part) => part.type === "text")
                    .map((part) => (part.type === "text" ? part.text : ""))
                    .join("");
                  if (!text.trim()) return null;
                  return (
                    <Message from={message.role} key={message.id}>
                      <MessageContent>
                        <MessageResponse>{text}</MessageResponse>
                      </MessageContent>
                    </Message>
                  );
                })
              )}

              {isBusy && (
                <div className="px-1 py-2">
                  <Shimmer className="text-sm">Thinking...</Shimmer>
                </div>
              )}

              {error && (
                <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>{error.message || "Something went wrong. Try sending again."}</span>
                </div>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="border-t border-border p-4">
            <div className="mx-auto w-full max-w-2xl">
              <PromptInput
                onSubmit={(message) => {
                  submit(message.text);
                }}
              >
                <PromptInputTextarea
                  onChange={(event) => setInput(event.currentTarget.value)}
                  placeholder="What do you want the AI to do?"
                />
                <PromptInputFooter className="justify-end">
                  <PromptInputSubmit status={status} disabled={!input.trim() || isBusy} />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </div>
        </div>

        <PromptDraftPanel draft={draft} />
      </div>
    </main>
  );
}
