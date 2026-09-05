# Lock the carousel behind admin-only sign-in

Goal: the 18-slide carousel disappears from public reach entirely. Only you, signed in with your admin account, can open it — in preview and on the live site.

## What changes for you

- The carousel moves from `/carousel` (public) to `/admin/carousel` (protected).
- Anyone not signed in is sent to the sign-in page first.
- Anyone signed in who is not an admin sees a "Not your page" message — no slides, no hint the carousel exists.
- The old `/carousel` link stops working (404), so nothing is left exposed by chance.
- You edit slides exactly as before — tell me "slide 7, change the line to X" and I update it.

## How it works

1. The carousel page moves inside the sign-in-protected area of the app (same mechanism that already protects `/admin`).
2. On top of sign-in, the page asks the backend "is this person an admin?" using the existing admin check — the same one your usage dashboard uses. Non-admins get turned away.
3. The public carousel route file is deleted in the same step, so the old URL dies immediately.

## Verification

- Signed out → visiting `/admin/carousel` redirects to sign-in.
- Signed in as a non-admin → blocked message, no slides.
- Signed in as you → all 18 slides render, arrows/swipe work, at desktop and phone sizes.
- Old `/carousel` URL returns 404.

## Technical notes

- Move `src/routes/carousel.tsx` to `src/routes/_authenticated/carousel.tsx` (path becomes `/carousel` under the auth gate; I will mount it as `/admin/carousel` via the route path so it sits inside your admin section).
- Reuse the existing `getMyAdminAccess` server function (already verifies the `admin` role server-side against your account) and render the block screen when `isAdmin` is false.
- Keep `noindex, nofollow` metadata; the route was never in the sitemap, so no sitemap change needed.
- No changes to slide content, styling, or navigation — pure access-control move.
