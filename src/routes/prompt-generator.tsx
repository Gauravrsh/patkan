import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowRight } from "lucide-react";
import patkanMark from "@/assets/patkan-mark.svg";
import { Playground } from "@/components/Playground";
import { Button } from "@/components/ui/button";
import { CWS_URL, faqLd, ldScript, organizationLd, pageLd, softwareLd } from "@/lib/seo";

const TITLE = "AI Prompt Generator for ChatGPT, Claude & Gemini | Patkan";
const DESCRIPTION = "Type a rough sentence in your AI chat, end it with //, and Patkan turns it into a structured prompt. Works in ChatGPT, Claude, Gemini and more.";
const PATH = "/prompt-generator";
const APPS = ["ChatGPT", "Claude", "Gemini", "Google AI Studio", "Microsoft Copilot", "Perplexity", "Grok", "DeepSeek", "Mistral", "Poe", "Kimi", "Qwen", "Meta AI", "Notion AI"];
const CARDS = [
  { to: "/chatgpt-prompt-generator", title: "ChatGPT prompt generator", body: "Turn rough requests into clear Markdown prompts for ChatGPT." },
  { to: "/claude-prompt-generator", title: "Claude prompt generator", body: "Turn rough requests into labeled XML prompts for Claude." },
  { to: "/gemini-prompt-generator", title: "Gemini prompt generator", body: "Turn rough requests into structured prompts for Gemini." },
  { to: "/copilot-prompt-generator", title: "Copilot prompt generator", body: "Turn rough requests into clear prompts for Microsoft Copilot." },
  { to: "/perplexity-prompt-generator", title: "Perplexity prompt generator", body: "Turn rough research questions into focused prompts for Perplexity." },
  { to: "/deepseek-prompt-generator", title: "DeepSeek prompt generator", body: "Turn rough requests into clear prompts for DeepSeek." },
] as const;
const STEPS = [
  ["Add Patkan to your browser", "Patkan appears inside supported AI chat inputs."],
  ["Write naturally. End with //", "Type the outcome you need in your own words, then add //."],
  ["Review, edit, and send", "Patkan replaces the rough request with a structured prompt. You stay in control before sending it."],
] as const;
const FAQS = [
  ["What is an AI prompt generator?", "An AI prompt generator helps turn a rough request into clearer instructions for an AI assistant. Patkan does this inside supported AI chat inputs when you end a sentence with //."],
  ["How is Patkan different from a copy-paste prompt builder?", "Patkan works inside the chat where you are already writing. You do not need to open a separate prompt library, copy a template, or move between tabs."],
  ["Which AI assistants does Patkan support?", "Patkan supports ChatGPT, Claude, Gemini, Google AI Studio, Microsoft Copilot, Perplexity, Grok, DeepSeek, Mistral, Poe, Kimi, Qwen, Meta AI and Notion AI in the browser."],
  ["Does Patkan store prompts?", "Patkan sends the text you transform to its server and on to a model to be rewritten. To make repeat requests faster, the prompt and its result are kept on our server. Don’t enter passwords or sensitive personal details. Usage is a per-day count tied to an anonymous device ID or your account."],
] as const;
const shell = "mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8";

export const Route = createFileRoute("/prompt-generator")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `https://patkan.in${PATH}` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `https://patkan.in${PATH}` }],
    scripts: [ldScript([organizationLd, softwareLd, pageLd({ name: TITLE, path: PATH, description: DESCRIPTION, dateModified: "2026-10-21" }), faqLd(FAQS)])],
  }),
  component: PromptGeneratorPage,
});

function InstallButton() {
  return <Button asChild><a href={CWS_URL} target="_blank" rel="noopener noreferrer"><ArrowDownToLine className="size-4" aria-hidden />Add to Desktop</a></Button>;
}

function PromptGeneratorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur-md">
        <div className={`${shell} flex h-16 items-center justify-between gap-3`}>
          <Link to="/" className="flex items-center gap-2.5"><img src={patkanMark} alt="" className="size-8" width={32} height={32} /><span className="text-lg font-semibold">Patkan</span></Link>
          <InstallButton />
        </div>
      </header>
      <main>
        <section className={`${shell} py-8 sm:py-12`}>
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-xs text-primary">AI PROMPT GENERATOR</p>
            <h1 className="mt-3 text-2xl font-semibold leading-tight sm:text-4xl">Turn rough thoughts into structured prompts where you already work.</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">Write what you need in plain English inside your AI chat. End the sentence with <span className="font-mono text-primary">//</span>, and Patkan rewrites it as a structured prompt you can review, edit, and send.</p>
            <div className="my-5 flex flex-wrap gap-3"><InstallButton /><Button variant="outline" asChild><a href="#playground">Try the playground<ArrowRight className="size-4" aria-hidden /></a></Button></div>
          </div>
          <div id="playground" className="scroll-mt-20"><Playground /></div>
        </section>
        <section className="border-y bg-card py-10 sm:py-16">
          <div className={shell}>
            <h2 className="text-2xl font-semibold sm:text-3xl">Works inside the AI chats you already use.</h2>
            <p className="mt-4 text-sm text-muted-foreground sm:text-base">Patkan supports the following AI chat sites in the browser:</p>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-4">{APPS.map((app) => <li key={app} className="flex items-center gap-2"><span aria-hidden className="font-mono text-primary">//</span>{app}</li>)}</ul>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">Prompt formatting adapts to the chat: Claude uses labeled XML sections; ChatGPT, Copilot, Perplexity, Grok, DeepSeek, Mistral, Poe, Kimi, Qwen and Notion use clear Markdown sections; Gemini, Google AI Studio and Meta AI use structured sections.</p>
          </div>
        </section>
        <section className={`${shell} py-10 sm:py-16`}>
          <h2 className="text-2xl font-semibold sm:text-3xl">Start with the AI assistant you use.</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{CARDS.map(({ to, title, body }) => <Link key={to} to={to} className="group rounded-lg border bg-card p-5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><h3 className="flex items-start justify-between gap-3 text-base font-semibold">{title}<ArrowRight className="size-4 shrink-0 text-primary" aria-hidden /></h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p></Link>)}</div>
        </section>
        <section className="border-y py-10 sm:py-16">
          <div className={shell}>
            <h2 className="text-2xl font-semibold sm:text-3xl">From rough request to structured prompt.</h2>
            <ol className="mt-8 grid gap-7 md:grid-cols-3">{STEPS.map(([title, body], i) => <li key={title}><span className="font-mono text-xl text-primary">{String(i + 1).padStart(2, "0")}</span><h3 className="mt-3 text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p></li>)}</ol>
          </div>
        </section>
        <section className={`${shell} py-10 sm:py-16`} aria-label="FAQs">
          <div className="divide-y rounded-lg border">{FAQS.map(([q, a]) => <details key={q} className="group p-5 sm:p-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">{q}<span className="font-mono text-primary group-open:rotate-45" aria-hidden>+</span></summary><p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{a}</p></details>)}</div>
        </section>
        <section className="border-t py-10 sm:py-16"><div className={`${shell} flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center`}><h2 className="text-2xl font-semibold sm:text-3xl">Write the thought. Let Patkan add the structure.</h2><InstallButton /></div></section>
      </main>
      <footer className="border-t"><nav aria-label="Footer" className={`${shell} flex flex-wrap gap-x-5 gap-y-3 py-8 text-xs text-muted-foreground`}><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><a href="https://www.gnu.org/licenses/agpl-3.0.html" target="_blank" rel="noopener noreferrer">AGPL-3.0</a><a href={CWS_URL} target="_blank" rel="noopener noreferrer">Chrome Web Store</a><Link to="/promptperfect-alternative">PromptPerfect alternative</Link></nav></footer>
    </div>
  );
}