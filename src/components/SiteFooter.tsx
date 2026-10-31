import { Link } from "@tanstack/react-router";

const col = "flex flex-col gap-2";
const head = "mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground";
const item = "transition-colors hover:text-foreground";

/** Shared footer so every public page links to every other public page. */
export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 text-sm text-muted-foreground sm:grid-cols-3 sm:px-6 lg:px-8">
        <nav className={col} aria-label="Product">
          <p className={head}>Product</p>
          <Link to="/noghaan" className="font-mono font-semibold text-primary hover:underline">/noghaan</Link>
          <Link to="/" className={item}>Patkan</Link>
          <Link to="/about" className={item}>About</Link>
          <Link to="/library" className={item}>Your Library</Link>
        </nav>
        <nav className={col} aria-label="Free Tools">
          <p className={head}>Free Tools</p>
          <Link to="/chatgpt-prompt-generator" className={item}>ChatGPT prompt generator</Link>
          <Link to="/claude-prompt-generator" className={item}>Claude prompt generator</Link>
          <Link to="/gemini-prompt-generator" className={item}>Gemini prompt generator</Link>
          <Link to="/copilot-prompt-generator" className={item}>Copilot prompt generator</Link>
          <Link to="/perplexity-prompt-generator" className={item}>Perplexity prompt generator</Link>
          <Link to="/deepseek-prompt-generator" className={item}>DeepSeek prompt generator</Link>
          <Link to="/promptperfect-alternative" className={item}>PromptPerfect alternative</Link>
        </nav>
        <nav className={col} aria-label="Legal & Privacy">
          <p className={head}>Legal &amp; Privacy</p>
          <Link to="/privacy" className={item}>Privacy Policy</Link>
          <Link to="/terms" className={item}>Terms of Use</Link>
          <a href="mailto:contact@patkan.in" className={item}>contact@patkan.in</a>
        </nav>
      </div>
    </footer>
  );
}
