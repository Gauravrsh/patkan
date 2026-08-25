import { Plus, X, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BASE_GUARDRAILS, type PromptDraft } from "@/lib/prompt-draft";

type FieldProps = {
  label: string;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
};

function Field({ label, hint, required, htmlFor, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
        <label
          htmlFor={htmlFor}
          className="min-w-0 truncate text-[13px] font-medium text-foreground"
        >
          {label}
          {required && (
            <span className="ml-1 text-destructive" aria-hidden>
              *
            </span>
          )}
        </label>
        {!required && (
          <span className="shrink-0 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
            Optional
          </span>
        )}
      </div>
      {children}
      {hint && <p className="text-[11.5px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SectionHeading({ index, title }: { index: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-1">
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent font-mono text-[10px] text-accent-foreground">
        {index}
      </span>
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h3>
      <span className="h-px min-w-0 flex-1 bg-border" />
    </div>
  );
}

function ListEditor({
  items,
  onChange,
  placeholder,
  addLabel,
  ordered,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  addLabel: string;
  ordered?: boolean;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {ordered && (
            <span className="w-4 shrink-0 text-right font-mono text-[11px] text-muted-foreground">
              {index + 1}
            </span>
          )}
          <Input
            value={item}
            placeholder={placeholder}
            onChange={(event) => {
              const next = [...items];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Remove item"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            <X />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={() => onChange([...items, ""])}>
        <Plus />
        {addLabel}
      </Button>
    </div>
  );
}

export function PromptForm({
  draft,
  onChange,
}: {
  draft: PromptDraft;
  onChange: (patch: PromptDraft) => void;
}) {
  const set = <K extends keyof PromptDraft>(key: K, value: PromptDraft[K]) =>
    onChange({ [key]: value } as PromptDraft);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-9 px-6 py-6">
      <section className="space-y-4">
        <SectionHeading index={1} title="Role & Persona" />
        <Field
          label="Domain / role"
          required
          htmlFor="role"
          hint="e.g. Senior Solutions Architect, growth copywriter, forensic data analyst"
        >
          <SuggestInput
            field="role"
            id="role"
            value={draft.role ?? ""}
            placeholder="Senior Solutions Architect"
            onChange={(next) => set("role", next)}
          />
        </Field>
        <Field
          label="Defining traits"
          htmlFor="traits"
          hint="How they think and communicate — comma separated."
        >
          <Input
            id="traits"
            value={draft.traits ?? ""}
            placeholder="pragmatic engineering, strict adherence to SOPs, concise technical communication"
            onChange={(event) => set("traits", event.target.value)}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <SectionHeading index={2} title="Context & Background" />
        <Field
          label="Project / scenario"
          required
          htmlFor="scenario"
          hint="Finish the sentence: “I am currently …”"
        >
          <Textarea
            id="scenario"
            rows={2}
            value={draft.scenario ?? ""}
            placeholder="building a full-stack collections app for enterprise banks"
            onChange={(event) => set("scenario", event.target.value)}
          />
        </Field>
        <Field label="Target users" htmlFor="targetUsers">
          <Input
            id="targetUsers"
            value={draft.targetUsers ?? ""}
            placeholder="Bank recovery agents and compliance officers"
            onChange={(event) => set("targetUsers", event.target.value)}
          />
        </Field>
        <Field label="Environment / stack" htmlFor="environment">
          <Input
            id="environment"
            value={draft.environment ?? ""}
            placeholder="React, Postgres, AWS, strict SOC2 constraints"
            onChange={(event) => set("environment", event.target.value)}
          />
        </Field>
        <Field label="Core problem" htmlFor="coreProblem">
          <Textarea
            id="coreProblem"
            rows={2}
            value={draft.coreProblem ?? ""}
            placeholder="Reconciliation breaks when partial payments arrive out of order"
            onChange={(event) => set("coreProblem", event.target.value)}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <SectionHeading index={3} title="Primary Objective" />
        <Field
          label="Deliverable"
          required
          htmlFor="objective"
          hint="Start with an action verb: design, audit, refactor, draft…"
        >
          <Textarea
            id="objective"
            rows={2}
            value={draft.objective ?? ""}
            placeholder="design a step-by-step database schema and API routing spec"
            onChange={(event) => set("objective", event.target.value)}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <SectionHeading index={4} title="Constraints & Guardrails" />
        <Field label="Extra constraints" hint="Three defaults are always included.">
          <div className="space-y-1.5 rounded-md border border-border bg-muted/40 px-3 py-2.5">
            {BASE_GUARDRAILS.map((rule) => (
              <div key={rule} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                <Lock className="mt-0.5 size-3 shrink-0" />
                <span className="min-w-0">{rule}</span>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <ListEditor
              items={draft.constraints ?? []}
              onChange={(next) => set("constraints", next)}
              placeholder="Do NOT use external libraries"
              addLabel="Add constraint"
            />
          </div>
        </Field>
      </section>

      <section className="space-y-4">
        <SectionHeading index={5} title="Output Format & Structure" />
        <Field label="Response hierarchy" hint="Numbered sections the answer must follow.">
          <ListEditor
            ordered
            items={draft.outputFormat ?? []}
            onChange={(next) => set("outputFormat", next)}
            placeholder="**Technical Specifications** (Markdown table)"
            addLabel="Add section"
          />
        </Field>
      </section>

      <section className="space-y-4">
        <SectionHeading index={6} title="Input Data / Reference" />
        <Field
          label="Reference material"
          htmlFor="referenceData"
          hint="Only added to the prompt when filled."
        >
          <Textarea
            id="referenceData"
            rows={5}
            className={cn("font-mono text-[12px]")}
            value={draft.referenceData ?? ""}
            placeholder="Paste code snippets, SOPs, roadmap details or raw context here"
            onChange={(event) => set("referenceData", event.target.value)}
          />
        </Field>
      </section>
    </div>
  );
}
