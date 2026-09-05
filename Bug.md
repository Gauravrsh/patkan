# Bug log

Every bug raised becomes one entry below. Rules:

1. Reproduce or corroborate the symptom before writing the entry.
2. Diagnose the root cause by reading the actual failing line, and note the file and line.
3. Ship the fix in the same session as the diagnosis.
4. Every `status: fixed` entry must carry a `verification` line that actually proves it.
5. Append only. Never reuse or skip a serial. Never edit an older entry — append a new one that supersedes it and reference the older serial.

Entry template:

```yaml
- id: BUG-000
  date: YYYY-MM-DD
  title: short summary
  reported: what the user saw, in their words
  repro: steps or conditions that show it
  root_cause: file:line and the actual reason
  fix: what changed
  verification: the check that proves the fix
  status: open | fixed | superseded-by BUG-000
```

---

```yaml
- id: BUG-001
  date: 2026-09-05
  title: Header nav links invisible on mobile and tablet
  reported: "Playground, Install Guide and Sign in are visible on desktop but not on a mobile browser."
  repro: Load / at 393px or 834px wide; the header shows only the logo and the Get button.
  root_cause: >
    src/routes/index.tsx header nav container used `hidden items-center ... lg:flex`,
    so the three links were display:none below the 1024px breakpoint. There was no
    alternative navigation for smaller screens, leaving those sections unreachable
    from the header on phones, tablets, and the 834px Lovable preview.
  fix: >
    Nav row now appears from 768px up, and a menu button (md:hidden) opens a right-side
    sheet containing Playground, Install Guide, Sign in and Get Extension. Selecting an
    item closes the sheet and performs the same action as the desktop link.
  verification: >
    Playwright at 393px: menu button click opens the sheet with all three links plus
    Get Extension visible (/tmp/browser/hdr/menu.png). At 834px and 1440px the inline
    links render. No horizontal overflow and no console errors at any of the three widths.
  status: fixed

- id: BUG-002
  date: 2026-09-05
  title: Hindi pronunciation badge /पट्कन/ missing on mobile and in preview
  reported: "The patkan in Hindi is on the desktop masthead but not on mobile, and not even in the Lovable preview."
  repro: Load / at 393px; the badge next to the wordmark is absent.
  root_cause: >
    src/routes/index.tsx badge span used `hidden ... sm:inline`, hiding it below 640px.
    In the 834px preview the badge was technically eligible but competed for space in a
    tight single-row header alongside the nav and CTA.
  fix: >
    Badge is rendered at every width with a smaller font and tighter padding below 640px;
    the wordmark truncates before the badge, so the row stays on one line.
  verification: >
    Playwright asserted the badge visible at 393px, 834px and 1440px with
    document.documentElement.scrollWidth === window.innerWidth (no overflow) at all three.
  status: fixed
```
