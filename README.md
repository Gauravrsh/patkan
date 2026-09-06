# Patkan

Turn a rough thought into a surgically crafted prompt, instantly.

Patkan is a web app plus a browser extension. Type a sloppy sentence, end it with `//`, and it is
rewritten into a structured prompt — role, context, task, constraints — before it ever reaches your
AI chat.

Live at **[patkan.in](https://patkan.in)**.

## Licence and what you may do

Patkan is free and open source under the **GNU AGPL-3.0** (see [`LICENSE`](./LICENSE)).

You may copy it, study it, change it, and run your own copy. If you run a modified copy as a network
service, the AGPL requires you to publish your changes under the same licence.

The **name "Patkan", the logo, the `/पट्कन/` wordmark and the domain patkan.in are not covered by
that licence** — see [`TRADEMARK.md`](./TRADEMARK.md). Fork the code, but ship it under your own name.

Nothing in this repository grants access to the hosted service at patkan.in, its database, or the
AI account behind it.

## Running your own copy

You need Node.js (or Bun) and your own accounts for the backend and the AI model.

```sh
git clone <this-repository-url>
cd patkan
bun install
cp .env.example .env   # fill in your own values
bun run dev
```

### Environment

| Variable | Required | What it is |
| --- | --- | --- |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | yes | Your own Supabase project (server side) |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | yes | The same project, browser side |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Your own service role key, server only |
| `NOUS_API_KEY` | one of these | Your own Nous Research inference key |
| `LOVABLE_API_KEY` | one of these | Your own Lovable AI gateway key |
| `PATKAN_ENGINE_MODEL`, `PATKAN_ENGINE_SECONDARY_MODEL` | no | Override the model ids |
| `PATKAN_ALLOWED_ORIGINS` | no | Comma-separated origins your API answers (defaults to Patkan's own) |
| `PATKAN_IP_DAILY_CEILING` | no | Daily transform ceiling per IP address (default 50) |

**There is no shared key.** With no AI key configured, the transform endpoint answers
"AI is not configured" — it never falls back to anyone else's account. The hosted Patkan agent is
not part of this licence and is not reachable from a fork.

Database schema lives in `supabase/migrations` and applies to your own project.

### Browser extension

```sh
PATKAN_API_BASE="https://your-own-host.example" bun scripts/build-extension.mjs
```

That writes `public/patkan-extension.zip` (Chromium) and `public/patkan-extension-firefox.zip`
(Firefox), pointed at your server. Without `PATKAN_API_BASE` the build targets patkan.in, which will
refuse requests from anything that is not Patkan's own site.

## Why the hosted API refuses you

`/api/public/*` on patkan.in accepts browser calls only from Patkan's own origins, and holds every
other caller under a per-IP daily ceiling. That is a cost control, not a restriction on the code —
run your own copy with your own key and there is no limit but your own bill.

## Built with

TanStack Start · TypeScript · React · Tailwind CSS · Supabase

## Contributing and security

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) and [`SECURITY.md`](./SECURITY.md).
