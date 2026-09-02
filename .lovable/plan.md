# Patkan Mobile: PRD + a straight answer on MCP

## Answering Q1 and Q2 first, because they change the product

### Q1. Does prompt rewriting still add value?

Partly. Be honest about which part.

What frontier models already do well (and keep getting better at):
- Filling in obvious missing context inside one thread.
- Asking a clarifying question when the ask is ambiguous.
- Producing decent structure without being told to.

What they still do badly, and will keep doing badly because it is not a model
capability problem:
- They cannot know facts you never typed: your stack, your audience, your
  constraints, your definition of done, your house style, what you rejected
  last time.
- Cold starts. Turn 1 of a new chat has zero context, and mobile use is
  overwhelmingly cold-start, one-shot, short-session.
- They optimise for a pleasant answer, not for a *falsifiable* one. Nobody
  volunteers success criteria and output contracts.

So the defensible value is **not** "we add XML tags." Tag scaffolding is
commodity and shrinking. The defensible value is **your persistent context and
standards, injected into someone else's cold chat.** That is a memory product
with a formatting side effect, not a formatter.

Verdict: the formatting half of Patkan is depreciating. The memory/standards
half is appreciating. Mobile should be built around the second one, or skipped.

### Q2. Is MCP the right route to "@patkan" inside mobile apps?

No. Not for the stated goal. Two independent reasons.

**Reason 1 — distribution. The surface does not exist on most of the targets.**

| App (mobile) | Can an end user add a third-party remote MCP server? |
| --- | --- |
| Claude | Yes, custom connectors, paid tiers, desktop-ish setup flow |
| ChatGPT | Partially, developer-mode connectors, not a consumer path |
| Gemini | No user-installable MCP |
| Grok | No |
| Perplexity | No |

Three of the five named targets have no path at all. The one that works
requires a settings flow no everyday user completes on a phone.

**Reason 2 — mechanism. MCP fires too late to do the job.**

The Patkan desktop magic is *pre-send interception*: it edits the text box
before the model ever sees it. An MCP tool is *post-send*: the sloppy sentence
is already in context, the model has already interpreted it, and it decides
whether to call your tool. You get "the model asks Patkan to rewrite something
it already understood," which is a slower, more expensive round trip for a
result the model would have produced anyway. Worse, invocation is
non-deterministic, so the "magic" fails randomly.

The one thing MCP *does* do well here is Reason 1's exception: it is a clean
way to expose your **saved frameworks and library** to Claude/ChatGPT as
retrievable context. That is the memory half from Q1, and it is worth keeping
the existing server for exactly that. It is not the mobile answer.

**Verdict:** the current MCP server stays as a Claude/ChatGPT power-user
integration. Mobile "@patkan" is built at the **keyboard and OS text layer**,
which is the only place on a phone where you can intercept text before send,
and which works identically across Gemini, Grok, Perplexity, Claude and every
other app.

---

## PRD — Patkan Mobile

### Goal
A user typing a sloppy one-liner into any AI app on their phone gets a
surgical prompt in the composer before they hit send, with no app switching.

### Non-goals
- Being invoked as `@patkan` inside those apps. Not technically available;
  the trigger lives in the keyboard, not in the host app's mention system.
- Rebuilding chat UI in the mobile app. The mobile app is a settings and
  library shell.

### The mechanism, per platform

| Platform | Primary surface | Trigger | Fallback |
| --- | --- | --- | --- |
| Android | Custom IME (keyboard) | `//` at end of text, plus a Patkan key | Text-selection "Patkan" action (`PROCESS_TEXT`), share sheet |
| iOS | Custom keyboard extension (Full Access) | `//` plus a Patkan key | Share sheet extension, Shortcut on the Action button, clipboard |

Android's IME can read and replace composer text directly, so it reproduces the
desktop experience almost exactly. iOS keyboard extensions cannot read the
field's existing content, so the iOS flow is: user types, taps the Patkan key,
the keyboard deletes back over what it saw typed and inserts the rewrite.
Ship Android first; iOS is a materially weaker experience and should be
validated separately.

### Core flow
1. User types "write a cold email for my saas" and ends with `//`.
2. Patkan keyboard shows an inline chip: rewriting.
3. Local scaffold lands within ~50ms so the field is never empty.
4. Server call returns the enriched prompt and swaps it in, one undo tap available.
5. An assumptions line appears above the keyboard: "assumed B2B SaaS,
   founder-led sales. Change."

### What makes it not a formatter
Every rewrite is conditioned on the user's stored profile: their work, stack,
audience, tone, and their saved frameworks from the Library. This is the same
context the MCP server exposes to Claude. One memory, three delivery surfaces
(desktop extension, mobile keyboard, MCP).

### Scope, v1
- Android IME with `//` trigger, Patkan key, undo, assumptions line.
- Sign-in that reuses the existing web session; guest mode with the existing
  daily quota.
- Profile capture: three questions at onboarding that feed every rewrite.
- Library read access from the keyboard, one tap to apply a saved framework.
- Existing transform endpoint reused as-is; add a mobile client id for analytics.

### Out of scope, v1
iOS keyboard, voice input, per-app dialect detection beyond a simple
foreground-package hint, offline model.

### Success criteria
- Time from `//` to swapped text under 1.2s at p75 on 4G.
- Rewrite acceptance (not undone, message sent) above 70%.
- Week-4 retention of installers above 25%. Below that, the mobile bet is dead
  and the desktop extension plus MCP is the whole product.

### Kill criteria, stated up front
If acceptance is high but retention is low, users liked the trick, not the
tool, which means Q1's pessimistic case is true and Patkan should collapse into
a context/memory layer rather than a rewriter.

---

## Technical notes

- The keyboard is a native Android module, not part of this TanStack app. This
  repo keeps serving `/api/public/transform`, `/api/public/templates`, auth,
  the Library, and `/mcp`.
- Add a device-scoped token exchange so the keyboard can hold a long-lived
  credential without shipping a browser session.
- Add a stored user profile (role, domain, defaults) read by transform on every
  call, so all three surfaces share one context.
- No change to the MCP server is required for mobile; the recommendation is to
  keep it and market it as the Claude/ChatGPT integration, not as the phone story.

## What I would not build
An `@patkan` mention inside Gemini or Perplexity. There is no extension point,
and a workaround that asks users to paste a magic string is a worse version of
just opening the Patkan app.
