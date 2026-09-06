# Contributing to Patkan

Thanks for looking. A few things worth knowing before you spend time.

## How this repository works

Patkan is developed inside Lovable and synced to GitHub. `main` is the branch that powers
patkan.in. Nobody outside the maintainer has write access, and the live site only ever deploys what
the maintainer builds — a pull request never touches production by itself.

## Pull requests

- Open an issue first for anything larger than a small fix. Patkan is opinionated; a change may be
  declined on taste alone, and it's better to find that out before you write it.
- Keep the change focused. One concern per pull request.
- Match the existing style: TypeScript, no new dependencies without a reason, comments that explain
  *why* rather than *what*.
- Run `bunx tsgo --noEmit` before pushing.
- Do not change branding, copy on patkan.in, or the licence.

By contributing you agree that your contribution is licensed under the AGPL-3.0, the same as the
rest of the project.

## Running it

See the setup section in [`README.md`](./README.md). You need your own backend project and your own
AI key — the hosted Patkan agent is not available to forks or contributors.

## Reporting bugs

Bugs in the hosted site are tracked in `Bug.md`. For security issues, follow
[`SECURITY.md`](./SECURITY.md) instead of opening a public issue.
