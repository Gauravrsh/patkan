# Making Patkan open source without opening the front door

Short answer: making the repo public does **not** let anyone change patkan.in. Code and site are
separate — the live site only ever ships what you build from your own project. What *does* need work
is the API: right now the transform endpoint accepts requests from anywhere, so once the code is
public, a forked site or extension could point at patkan.in and spend your Hermes credits.

## What's already safe (verified in the code)

- No API keys live in the code. `NOUS_API_KEY` and `LOVABLE_API_KEY` are read from the server secret
  store at request time, never bundled, never sent to the browser.
- The Hermes call happens only on the server (`src/lib/patkan-engines.server.ts`).
- The only keys in `.env` are the publishable/anon ones, which are designed to be public.

## What needs fixing before the repo goes public

### 1. Lock the public API to your own surfaces
`/api/public/transform`, `/usage`, `/templates`, `/feedback` currently send
`Access-Control-Allow-Origin: *` and identify free users only by a device id the caller invents. A
fork can call them freely.

Changes:
- Allow browser calls only from patkan.in, www.patkan.in and your Lovable preview domains; every
  other origin gets rejected instead of a wildcard.
- Accept extension calls only from your published extension ids.
- Reject calls with no recognised origin and no valid signed-in token.
- Keep the daily quota, but add a per-IP ceiling so invented device ids can't multiply the free
  allowance.
- Return a clear message on refusal: "This Patkan server only serves patkan.in. Run your own copy
  with your own AI key."

### 2. Make a fork bring its own key
- The extension currently defaults to your server (`DEFAULT_API_BASE`). Keep that for your published
  build, but make it a build-time setting so a fork points at its own server by default.
- Document the required environment variables (`NOUS_API_KEY` or a Lovable key) so a self-hoster is
  running entirely on their own account.
- When no key is configured, the server already answers "AI is not configured" — keep that as the
  honest self-host default rather than any fallback to your key.

### 3. Repo hygiene before flipping to public
- Scan the whole git history for any secret ever committed; rotate anything found.
- Confirm every database table has row-level security and correct grants, since the anon key becomes
  publicly readable. Anything that leans on the key being unknown must be fixed.
- Decide whether `.env` stays in the repo (it holds only publishable values) or is removed and
  documented in `.env.example`.

### 4. Protect the repository itself
Public means readable, not writable. On GitHub: nobody outside your account gets write access,
protect `main` (no direct pushes, pull request review required), and keep Lovable as the only path
that deploys. Outside contributions arrive as pull requests you approve or ignore.

### 5. Licence and name
- Add a `LICENSE`. Suggested: **Apache-2.0** — permissive, plus an explicit patent and trademark
  clause. If you'd rather force anyone running a modified copy as a service to publish their
  changes, **AGPL-3.0** is the stricter choice. Tell me which you want.
- Add a trademark line: the code is open, but the name "Patkan", the logo and patkan.in are yours
  and not licensed for reuse. A fork must rename.
- Add `README` (what it is, how to self-host with your own key), `CONTRIBUTING`, `SECURITY.md`
  (how to report a vulnerability privately).

## Build order

1. API lockdown (origin + extension allowlist, per-IP ceiling, clear refusal message).
2. Self-host configuration and environment documentation.
3. Secret-history scan and database access review.
4. Licence, trademark notice, README, contributing and security docs.
5. You flip the repo to public and set branch protection.

## Open question

Which licence: Apache-2.0 (permissive) or AGPL-3.0 (forks running a service must publish changes)?
