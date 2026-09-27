# Patkan Architecture Dossier V1

## What you get
Two files saved to the Files section. Both have the same content:
- `patkan-architecture-dossier-v1.md`: the version to upload to Gemini Notebook
- `patkan-architecture-dossier-v1.pdf`: the version for reading and sharing

The site and app stay exactly as they are. Nothing in the code changes.

## Structure of the dossier
1. **Cover and how to use it:** version, date (27 Sep 2026), and the repo link.
2. **Architecture overview:** a short map of the four parts:
   - website
   - Chrome extension
   - server endpoints
   - database
   It also shows how a `//` transform moves through them: local draft, then the AI engine, then a fallback.
3. **File index:** every file with its path, what it does, and its line count.
4. **Full source, file by file:** every line of every file, grouped by area:
   - website pages
   - shared logic
   - server endpoints
   - extension
   - database migrations
   - config
   - docs (README, AGENTS, CONTRIBUTING, SECURITY, LICENSE, TRADEMARK)
   - past plans
5. **Database schema:** tables, access rules and permissions, taken from the migrations.

## What is left out, and why
- **Secret values (`.env`):** leaving these out keeps passwords and keys safe. The dossier only lists the setting names.
- **Auto-generated files:** the route tree, the lockfile and the generated database types. They are machine output, not real source, and each is noted in one line.
- **Third-party packages and build output:** these are not Patkan code.
- **Images, icons and the extension zip files:** these can't be shown as text. They are listed by name only.

## Technical details
- A script walks through the project files and puts each file under a heading with a code block that names its language. This makes the file easy for Gemini to split up and cite.
- The PDF is made from the same file using a monospace font that handles long lines. It has page numbers and a list of files with links to each section.
- Every page of the PDF is checked for:
  - code cut off at the edge
  - broken characters
  - missing files
- Both files are saved in Files. The PDF is likely to run to several hundred pages.
