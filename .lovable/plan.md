# Self-learning suggestions for the required fields

Give role, scenario and objective Google-style autocomplete that gets smarter the more the app is used — with no AI calls and no per-keystroke token cost. Everything is plain database lookups.

## How it works

1. When a user copies or exports a prompt, the three required field values are saved to a shared suggestion pool in the backend (one row per distinct value, with a usage counter).
2. While typing in one of those fields, the app queries that pool by prefix and shows:
   - **ghost text** completing the highest-ranked match inline (Tab or Right-arrow accepts)
   - **a dropdown** of up to 8 alternatives (arrow keys + Enter to pick, Esc to dismiss)
3. Ranking is recency- and frequency-weighted, so popular phrasings float to the top and the pool keeps improving on its own.
4. A shipped starter list of common roles, scenario patterns and objective verbs seeds the pool so suggestions are useful from day one.

The "string of last used keywords" behaviour comes from a second, lighter table of word-continuations: as you type `design a step-by-step`, it can suggest the next words even when no full stored phrase matches.

## Safeguards

Because the pool is shared and anyone can write to it, entries are normalised and filtered before they are stored:

- trimmed, whitespace-collapsed, capped at 160 characters
- values shorter than 3 characters or containing emails, URLs, long digit strings (phone/card-like) or API-key-looking tokens are dropped
- placeholder text and unedited seed values are not recorded
- a value only becomes suggestable after it has been seen at least twice, so one-off personal text never surfaces to others
- a small blocklist filters obvious profanity

## Technical notes

- Enable Lovable Cloud (first backend in this project).
- Tables:
  - `field_suggestions(field, value, value_norm, uses, last_used_at)` — unique on `(field, value_norm)`, index on `(field, value_norm text_pattern_ops)` plus a `pg_trgm` index for fuzzy matches.
  - `field_ngrams(field, prefix, next_word, uses)` — bigram/trigram continuations, unique on `(field, prefix, next_word)`.
- RLS: public `SELECT` limited to rows with `uses >= 2`; no direct client `INSERT`. Writes go through a server function (`record_field_usage`) that normalises, filters and upserts, so validation cannot be bypassed. Grants issued for `anon`, `authenticated` and `service_role` accordingly.
- Reads go through a server function `suggestField({ field, prefix })`, debounced ~120 ms client-side, results cached per prefix in a `Map` for the session, `limit 8`. Also returns the top continuation from `field_ngrams`.
- New `src/components/SuggestInput.tsx` — a wrapper over the existing `Input`/`Textarea` that renders ghost text plus a listbox with proper `aria-activedescendant` keyboard semantics. Used only for `role`, `scenario`, `objective`.
- `PromptDraftPanel` copy/export handlers call `record_field_usage` once per action (fire-and-forget).
- Seed values are inserted as literal `INSERT` rows in the migration with `uses = 2` so they are immediately visible.
- No AI gateway usage anywhere in this flow.
