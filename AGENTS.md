<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Structured data (JSON-LD) for pages comes from src/lib/seo.ts — one shared definition keeps Patkan described identically everywhere.
- Generator hub and onboarding pages reuse the homepage Playground component so trigger, quota, and selector behavior stay consistent.
- Keep superseded homepage source in a private .lovable/archive snapshot, never a public route, so the founder can reference it without exposing outdated copy to visitors or crawlers.
- Stage extension archives in the system temporary directory and serve completed ZIPs from public/ so packaging does not leave staging files in the project.
- Advisory usage reads return an explicit unavailable result on configuration or database failure, never a fabricated zero count; transformation quota enforcement remains independent.
- Keep Bun regression tests in tests/ outside src/routes so the file router does not treat test files as pages.
