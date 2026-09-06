# Admin access & "run the business" journey — findings and fix plan

## What I checked

Your account (gaurav.rsh@gmail.com) is the only one with the admin role, and it signed in this morning. The two admin pages are the usage dashboard at `/admin` and the carousel at `/admin/carousel`. The database currently holds 6 transform records ever, all from Sep 5, none of them rated.

## Findings on your journey

**1. There is no way in except typing the address.**
Nothing anywhere in the app links to `/admin`. Not the homepage, not the menu, not the sign-in page. You have to remember and type the URL. Same for `/admin/carousel` — the dashboard doesn't link to it either.

**2. Signing in looks like nothing happened.**
When you're signed out the header shows "Sign in". When you're signed in the header shows nothing at all — no name, no account menu, no way to sign out, no shortcut to your Library or admin. And if you land on the sign-in page while already signed in, it tells you "there is nothing more to do here", which is a dead end rather than a doorway.

**3. Once inside, you're stranded.**
The dashboard has no sign-out, no "back to Patkan", and no link to the carousel. The only way to move is the browser's address bar or back button.

**4. The numbers you'd manage the business with mostly aren't there yet.**
Only 6 transforms have ever been recorded, all on a single day, and none rated. So acceptance shows "—" and spend shows ~$0. Either almost nobody has used it, or the recording isn't firing on every path. That needs confirming before you trust any of these charts — I have not confirmed which it is.

**5. The dashboard answers "is the product healthy", not "is the business growing".**
It shows volume, cache hits, latency, errors and cost. It does not show signups over time, how many ghosts convert after hitting the wall, returning users, extension installs, or Library usage. Those are the decisions you'd actually act on.

**6. Access is checked page by page, not once.**
Both admin pages ask the backend separately whether you're an admin. It works, but each new admin page has to remember to do it, and it's easy to add one that forgets.

## Proposed fixes

**A. A real signed-in identity in the header** — when you're signed in, the header shows an account menu (your email, Library, Sign out) and, for admins only, an "Admin" entry. Present on both desktop and the mobile menu. Non-admins never see the admin entry.

**B. Admin shell with navigation** — a small bar across all `/admin` pages: Usage · Carousel · Back to Patkan · Sign out.

**C. One access check for the whole admin section** — move the admin-role check to the admin layout so every current and future admin page is covered by default, with a single clean "Not your page" screen.

**D. Sign-in page stops being a dead end** — when already signed in it offers Continue to Patkan / Library / Admin instead of "nothing to do here".

**E. Confirm the recording gap before adding metrics** — check whether transforms from the site, the extension, and the ghost path all actually write a record. Report back with the answer; fix only if something is broken.

**F. Business panel on the dashboard** (after E) — signups per day, total accounts, ghost-wall → signup conversion, returning users, Library frameworks created, extension vs web split.

## Technical notes

- `src/routes/index.tsx`: session-aware header/menu; read admin status via `getMyAdminAccess`.
- `src/routes/_authenticated/admin.tsx`: gate the subtree with `getMyAdminAccess`, render nav + `<Outlet />`; drop the per-page checks in `admin.index.tsx` and `admin.carousel.tsx`.
- Sign-out follows the existing hygiene: cancel queries, clear cache, `signOut()`, navigate with replace.
- `src/routes/auth.tsx`: replace the signed-in dead-end block with links.
- E: audit write paths in `src/lib/patkan-telemetry.server.ts` and `src/routes/api/public/transform.ts`.
- F: new aggregates in `src/lib/admin.functions.ts` over `auth.users` + `transform_events` + templates, served through the existing admin server function.

## Suggested order

A + B + C + D together (access and navigation), then E, then F once the data is trustworthy.
