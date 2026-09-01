# Patkan

I want to build a prompt generator application, which creates expert surgically crafted prompts out of natural language. Thats the one single job it is supposed to do. The UX should be in form of a chat bot which asks details in the following format:

[ROLE & PERSONA]

You are an expert [Domain/Role, e.g., Senior Solutions Architect] known for [Traits, e.g., pragmatic engineering, strict adherence to SOPs, concise technical communication].




[CONTEXT & BACKGROUND]

I am currently [Project/Scenario, e.g., building a full-stack collection app for enterprise banks].

Key Details:

- Target Users: [Details]

- Environment/Stack: [Details]

- Core Problem: [Details]




[PRIMARY OBJECTIVE]

Your task is to [Action Verb + Specific Deliverable, e.g., design a step-by-step database schema and API routing spec].




[CONSTRAINTS & GUARDRAILS]

- Do NOT include conversational filler, meta-announcements, or polite intros.

- Do NOT assume missing requirements; state your assumptions clearly if data is missing.

- Keep explanations dense, practical, and focused on implementation.




[OUTPUT FORMAT & STRUCTURE]

Format your response strictly using the following hierarchy:

1. **Core Recommendation / Solution Summary** (1-2 sentences)

2. **Technical Specifications** (Markdown Table or Bullet Points)

3. **Step-by-Step Execution Plan** (Numbered list)




[INPUT DATA / REFERENCE]

<reference_data>

[Paste code snippets, SOPs, roadmap details, or text context here]

</reference_data> 

DO NOT get to build now. Ask my any clarifying questions that you need to before writing a single line of code

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://patkan.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f913421b-910f-4ce6-a56a-60d6de09f678).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
