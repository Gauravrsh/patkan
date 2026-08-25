import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { cn } from "@/lib/utils";
import { suggestField, type SuggestField, type SuggestResult } from "@/lib/suggestions.functions";

const cache = new Map<string, SuggestResult>();
const EMPTY: SuggestResult = { matches: [], continuation: null };

type Props = {
  field: SuggestField;
  value: string;
  onChange: (next: string) => void;
  id?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
};

/**
 * Input/Textarea with Google-style suggestions: inline ghost completion plus a
 * ranked dropdown, both served from the shared suggestion pool. No AI calls.
 */
export function SuggestInput({
  field,
  value,
  onChange,
  id,
  placeholder,
  multiline,
  rows = 2,
  className,
}: Props) {
  const fetchSuggestions = useServerFn(suggestField);
  const listId = useId();
  const [result, setResult] = useState<SuggestResult>(EMPTY);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(
    async (prefix: string) => {
      const key = `${field}|${prefix.toLowerCase()}`;
      const cached = cache.get(key);
      if (cached) {
        setResult(cached);
        return;
      }
      try {
        const next = await fetchSuggestions({ data: { field, prefix } });
        cache.set(key, next);
        setResult(next);
      } catch {
        setResult(EMPTY);
      }
    },
    [field, fetchSuggestions],
  );

  useEffect(() => {
    if (!focused) return;
    const prefix = value;
    if (prefix.trim().length < 2) {
      setResult(EMPTY);
      return;
    }
    const timer = setTimeout(() => void load(prefix), 140);
    return () => clearTimeout(timer);
  }, [value, focused, load]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const matches = result.matches.filter(
    (match) => match.toLowerCase() !== value.trim().toLowerCase(),
  );
  const showList = open && focused && matches.length > 0;

  // Ghost completion: either the rest of the top prefix match, or the next word.
  const topMatch = result.matches.find((match) =>
    match.toLowerCase().startsWith(value.trim().toLowerCase()),
  );
  let ghost = "";
  if (value.trim().length >= 2) {
    if (topMatch && topMatch.length > value.trim().length) {
      ghost = topMatch.slice(value.trim().length);
    } else if (result.continuation && /\s$/.test(value)) {
      ghost = result.continuation;
    }
  }

  const accept = () => {
    if (!ghost) return false;
    const next = topMatch && ghost === topMatch.slice(value.trim().length)
      ? topMatch
      : value + ghost;
    onChange(next);
    setOpen(false);
    return true;
  };

  const commit = (next: string) => {
    onChange(next);
    setOpen(false);
    setActive(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
      return;
    }
    if (event.key === "Tab" && ghost) {
      event.preventDefault();
      accept();
      return;
    }
    if (event.key === "ArrowRight" && ghost) {
      const el = event.currentTarget;
      if (el.selectionStart === value.length && el.selectionEnd === value.length) {
        event.preventDefault();
        accept();
      }
      return;
    }
    if (!showList) {
      if (event.key === "ArrowDown" && matches.length > 0) {
        setOpen(true);
        setActive(0);
        event.preventDefault();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i <= 0 ? matches.length - 1 : i - 1));
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      commit(matches[active] as string);
    }
  };

  const base =
    "w-full rounded-md border border-input bg-transparent shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-base md:text-sm";
  const sizing = multiline ? "min-h-[60px] px-3 py-2" : "h-9 px-3 py-1";
  const shared = cn(base, sizing, className);

  const commonProps = {
    id,
    placeholder,
    value,
    ref: inputRef as never,
    role: "combobox" as const,
    "aria-expanded": showList,
    "aria-controls": listId,
    "aria-autocomplete": "list" as const,
    "aria-activedescendant": active >= 0 ? `${listId}-${active}` : undefined,
    autoComplete: "off",
    onFocus: () => {
      setFocused(true);
      setOpen(true);
    },
    onBlur: () => {
      setFocused(false);
      setActive(-1);
    },
    onKeyDown: handleKeyDown,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      onChange(event.target.value);
      setOpen(true);
      setActive(-1);
    },
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {/* Ghost layer — mirrors the field's typography exactly. */}
        {ghost && focused && (
          <div
            aria-hidden
            className={cn(
              shared,
              "pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words border-transparent bg-transparent text-transparent shadow-none",
              multiline ? "" : "flex items-center whitespace-pre",
            )}
          >
            <span className="whitespace-pre-wrap">{value}</span>
            <span className="text-muted-foreground/55">{ghost}</span>
          </div>
        )}
        {multiline ? (
          <textarea {...commonProps} rows={rows} className={cn(shared, "relative bg-transparent")} />
        ) : (
          <input {...commonProps} type="text" className={cn(shared, "relative bg-transparent")} />
        )}
      </div>

      {ghost && focused && (
        <p className="mt-1 text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground/70">
          Tab to complete
        </p>
      )}

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-md border border-border bg-popover py-1 shadow-lg"
        >
          {matches.map((match, index) => (
            <li
              key={match}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className={cn(
                "cursor-pointer px-3 py-1.5 text-[13px] leading-snug",
                index === active ? "bg-accent text-accent-foreground" : "text-foreground",
              )}
              onMouseEnter={() => setActive(index)}
              onMouseDown={(event) => {
                event.preventDefault();
                commit(match);
              }}
            >
              {match}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
