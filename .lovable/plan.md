# Patkan trigger keystroke — research and decision

Research only. No code changes are made by this document.

## The problem, precisely

Typing `https://patkan.in` fires Patkan at the `//` in the scheme, mid-thought. The
current rule (in the extension content script) fires whenever the text *ends* with
`//` plus optional whitespace. While typing a URL, the text momentarily ends with
`https://` — so it fires. The same happens with file paths (`C:— no), `//` comments
in pasted code, and `and/or //` style typos.

Two separable questions:

1. Is `//` the wrong trigger? (choice question)
2. Is the *detection rule* wrong? (engineering question)

The evidence below says the trigger is fine and the detection rule is the defect —
but a second, code-safe trigger is worth offering.

## Evidence: how often does each candidate pair appear in real writing?

Measured locally over 1,967,127 characters of English prose (Project Gutenberg:
*Pride and Prejudice* + *Moby-Dick*), counting raw occurrences:

| Pair | Occurrences | Verdict |
|---|---|---|
| `//` | 0 | clean in prose |
| `;;` | 0 | clean in prose |
| `,,` | 0 | clean in prose |
| `::` | 0 | clean in prose |
| `??` `!!` `++` `~~` `>>` | 0 | clean but emotionally loaded / rare reach |
| `..` | 18 | collides with ellipsis typing |
| `...` | 10 | collides with ellipsis |
| `--` | 498 | disqualified — em-dash substitute |

So in prose, `//` is already collision-free. Its **only** collision class is
machine text: URLs (`://`), protocol-relative links (`//cdn...`), and C-family
comments. That is a narrow, fully detectable class — a URL's `//` is always
preceded by `:` and is always mid-token with typing continuing after it.

Punctuation-sequence usage in natural text is a studied signal
([2](https://www.math.ucla.edu/~mason/papers/darmon-published-final-nov2021.pdf));
the practical rule from the text-expansion world matches the table above: pick a
trigger that is "difficult to expand accidentally"
([1](https://textexpander.com/blog/the-abbreviation-prefixes-textexpander-experts-use)),
and expect conflicts when the trigger overlaps real text
([2](https://textexpander.com/learn/using/snippets/conflicting-snippet-abbreviations)).

## Evidence: finger cost on a desktop keyboard

US QWERTY, unshifted, one hand, no modifier:

| Pair | Key row | Finger | Travel from home position |
|---|---|---|---|
| `;;` | home row | right pinky | zero — the pinky rests on `;` |
| `//` | bottom row | right pinky | one row down, slight reach |
| `,,` | bottom row | right middle | one row down |
| `..` | bottom row | right ring | one row down |

`;;` is strictly cheaper than `//`. Both are same-finger double taps, which is the
fastest kind of repeat (no finger change, no shift).

International caveat: on German QWERTZ, `/` requires Shift+7 and `;` requires
Shift+`,`, so both cost a modifier; on French AZERTY `;` is unshifted and `/` is
shifted ([3](https://en.wikipedia.org/wiki/German_keyboard_layout),
[4](https://www.typingtesttool.com/learn/azerty-vs-qwerty-keyboard-guide)). No
single ASCII pair is free on every layout — this argues for trigger *choice*, not
for a specific replacement.

## The candidates

| Option | Cost | Collision risk | Brand impact |
|---|---|---|---|
| A. `//` with context guards | zero (no user relearning) | near zero after guards | none — mark stays |
| B. `;;` | lowest travel | none in prose; rare in code (`;;` ends a statement pair) | logo redraw, domain/marketing copy rewrite |
| C. `,,` | low | used as opening quotes in German/Polish typing | logo redraw |
| D. `..` | low | collides with ellipsis — 18 hits in corpus | logo redraw |
| E. `//` + `;;` both accepted | zero | near zero | none — `//` stays the mark |

## Decision (recommended)

**Option E: keep `//` as the brand mark and the default trigger, fix the detection
rule, and ship `;;` as a selectable alternate.**

Reasoning:

1. The corpus shows `//` is not a prose collider. The bug is that the current rule
   ignores context, not that the characters are wrong.
2. `//` is load-bearing brand: the mark, the domain story, the extension listing,
   the carousel, the landing copy. Retiring it costs real equity to solve a bug
   that a 3-line condition solves.
3. `;;` is genuinely cheaper on the hand and is the right escape hatch for people
   who type URLs and code constantly. Offering it as a setting captures the
   ergonomic win without paying the brand cost.
4. Nothing here changes if adoption grows — guards get better with scale, a
   rename gets more expensive with scale. Fixing now, renaming never, is the
   asymmetric bet.

## What the fix would be (for a later build turn)

Fire only when **all** of these hold:

- the `//` is at the very end of the text, and
- the character before the `//` is a space, newline, or start-of-field (kills
  `https://`, `//cdn`, `path//x`, and `and/or//`), and
- the text before it has at least ~4 words, and
- ~400ms of typing idle has passed (kills the moment mid-URL where the text
  transiently ends in `//`).

Plus an explicit escape: if the trigger fires when unwanted, the existing Undo
chip restores the original text and reports a rejection, and typing `\//` never
fires.

Alternate trigger `;;` would be a stored setting read by the content script, with
the same guard rules, defaulting to `//`.

## Files this would touch when approved

- `extension/content.js` — detection rule and alternate-trigger read
- `extension/options.html` / `extension/options.js` — trigger picker
- `extension/manifest.json`, landing copy — only if the default ever changes

## Open decision for you

Only one: do you want the `;;` alternate shipped alongside the guard fix, or the
guard fix alone first?
