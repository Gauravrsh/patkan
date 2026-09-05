# Share button in homepage masthead

## What we'll build

Add a Share button to the homepage header (`src/routes/index.tsx`) in two places:

1. **Header row (desktop + mobile):** a bordered button with a share icon and the label "Share" (icon-only on very small screens), placed immediately to the left of the orange Get Extension button.
2. **Mobile hamburger menu:** "Share" as one more full-width line item inside the Sheet menu (below the existing links / Get Extension row).

## Share behavior

- Tapping Share calls the browser's native share sheet (`navigator.share`) with:
  - URL: `https://patkan.in`
  - Text: "Patkan — turn a rough thought into a surgically crafted prompt, instantly."
- **Fallback** (desktop browsers without native share): copy the URL to the clipboard and show a "Link copied" toast (existing `sonner` toast).
- If the user cancels the native sheet, nothing happens (no error toast).

## No other changes

- No layout shift: desktop row gets one more compact button; mobile row swaps only if space allows — the pronunciation badge and Get Extension stay as they are.
- No copy, color, or routing changes anywhere else.
- Reuses existing tokens, `sonner` toast, and the existing Sheet menu. No new dependencies (share icon from lucide-react, already in use).

## Verification

- Typecheck.
- Playwright at 393px, 834px, 1440px: Share visible left of Get Extension; menu opens and contains Share row; no overflow.
- Simulate no-Web-Share environment: confirm clipboard fallback + toast fires without console errors.
