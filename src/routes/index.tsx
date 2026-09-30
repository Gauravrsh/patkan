import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ldScript, organizationLd, pageLd, PATKAN_DEFINITION, softwareLd } from "@/lib/seo";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronDown,
  EyeOff,
  Headphones,
  Loader2,
  LockKeyhole,
  Menu,
  MousePointer2,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRound,
  Volume2,
  Zap,
} from "lucide-react";

import { toast } from "sonner";

import { useSectionTracking } from "@/hooks/useSectionTracking";
import { useIsMobile } from "@/hooks/use-mobile";
import { trackEvent } from "@/lib/telemetry";

import {
  DAILY_FREE_LIMIT,
  DAILY_SIGNED_IN_LIMIT,
  type Dialect,
  type Intensity,
  localScaffold,
} from "@/lib/patkan-core";
import { streamTransform, type EngineId } from "@/lib/patkan-stream";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import patkanMark from "@/assets/patkan-mark.svg";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Patkan — Prompt generator for ChatGPT, Gemini and Claude" },
      {
        name: "description",
        content:
          "Turn a rough thought into a clear, well-structured prompt without leaving your AI chat. End your line with // and Patkan rewrites it for ChatGPT, Gemini or Claude.",
      },
      { property: "og:title", content: "Patkan — Prompt generator for ChatGPT, Gemini and Claude" },
      {
        property: "og:description",
        content:
          "Turn a rough thought into a clear, well-structured prompt without leaving your AI chat. End your line with // and Patkan rewrites it.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://patkan.in/" },
      { property: "og:image", content: "https://patkan.in/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://patkan.in/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://patkan.in/" }],
    scripts: [
      ldScript([
        organizationLd,
        softwareLd,
        { "@type": "WebSite", "@id": "https://patkan.in/#website", name: "Patkan", url: "https://patkan.in/", publisher: { "@id": "https://patkan.in/#organization" } },
        pageLd({ name: "Patkan — Prompt generator for ChatGPT, Gemini and Claude", path: "/", description: PATKAN_DEFINITION, dateModified: "2026-09-30" }),
      ]),
    ],
  }),
  component: Landing,
});

function deviceId() {
  const key = "patkan_device_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

type Phase = "idle" | "drafting" | "sharpening" | "ready";

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Compiled prompt",
  drafting: "Drafting…",
  sharpening: "Sharpening this…",
  ready: "Ready",
};

const shell = "mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8";

// Ordered by real-world usage scale, biggest first.
const targetAis = [
  ["ChatGPT", "markdown", "OpenAI ChatGPT — structured markdown with headings"],
  ["Gemini", "sectioned", "Google Gemini — sectioned format with clear prompt boundaries"],
  ["Claude", "xml", "Anthropic Claude — XML tags for prompt boundaries"],
  ["Microsoft Copilot", "markdown", "Microsoft Copilot — structured reasoning with markdown"],
  ["Perplexity", "markdown", "Perplexity — structured markdown with headings"],
  ["DeepSeek", "markdown", "DeepSeek — structured markdown with headings"],
  ["Grok", "markdown", "Grok — structured markdown with headings"],
  ["Meta AI", "sectioned", "Meta AI — sectioned format with clear prompt boundaries"],
  ["Mistral", "markdown", "Mistral — structured markdown with headings"],
  ["Poe", "markdown", "Poe — structured markdown with headings"],
  ["Notion AI", "markdown", "Notion AI — structured markdown with headings"],
  ["Qwen", "markdown", "Qwen — structured markdown with headings"],
  ["Kimi", "markdown", "Kimi — structured markdown with headings"],
] as const;

/** Everyday tasks that warm the visitor up instead of a blank box. */
const GHOST_TASKS = [
  "Draft a 1-page PRD for our new user onboarding flow",
  "Write 3 microcopy options for an empty checkout screen",
  "Rewrite an error message to sound friendly and under 60 characters",
  "Outline a 3-email nurture sequence for inbound demo leads",
  "Turn bullet notes from a team call into a 600-word blog draft",
  "Group 25 competitor keywords into 4 core search intent clusters",
  "Turn this case study into a 5-slide LinkedIn carousel script",
  "Write a cold outbound email to a VP of Operations about our demo",
  "Draft an agenda for a renewal meeting with a quiet client",
  "Write a polite reply declining a refund outside our 30-day policy",
  "Write a punchy job post for a Senior Operations Lead",
  "Draft an announcement explaining our updated remote work guidelines",
  "Create a 5-question quiz on workplace cybersecurity",
  "Draft a mutual non-disclosure agreement for a prospective vendor",
  "Prepare a chronological summary of facts from these witness notes",
  "Explain tax deductions under Section 80C in plain, simple terms",
  "Write a 3-bullet commentary on our Q3 marketing budget variance",
  "Summarize key headwinds and margin trends from this earnings report",
  "Structure a 4-part hypothesis deck framework for market entry",
  "Turn rough updates from 5 teams into a weekly executive summary",
  "Write a standard operating procedure for vendor onboarding",
  "Draft a polite response declining a speaking invite for the CEO",
  "Create a 45-minute lesson plan on photosynthesis for 8th graders",
  "Suggest 5 sharp, curiosity-driven headlines for an interview article",
  "Draft a press release announcing our new regional partnership",
  "Write a friendly WhatsApp reply confirming a custom order date",
  "Write a listing description for a 3-bedroom apartment",
  "Draft an email comparing term insurance vs endowment plans",
  "Draft a discharge note explaining home medication instructions",
  "Draft a 200-word problem statement for an education grant proposal",
] as const;

/** Types a task out, holds it, erases it, moves on. Pauses the moment it is not needed. */
function useGhostTyping(active: boolean) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!active) {
      setText("");
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let taskIndex = Math.floor(Math.random() * GHOST_TASKS.length);
    let charIndex = 0;
    let erasing = false;

    const tick = () => {
      if (cancelled) return;
      const task = GHOST_TASKS[taskIndex]!;
      if (!erasing) {
        charIndex += 1;
        setText(task.slice(0, charIndex));
        if (charIndex >= task.length) {
          erasing = true;
          timer = setTimeout(tick, 2200);
          return;
        }
        timer = setTimeout(tick, 38);
      } else {
        charIndex -= 6;
        if (charIndex <= 0) {
          charIndex = 0;
          erasing = false;
          taskIndex = (taskIndex + 1) % GHOST_TASKS.length;
          setText("");
          timer = setTimeout(tick, 400);
          return;
        }
        setText(task.slice(0, charIndex));
        timer = setTimeout(tick, 18);
      }
    };

    timer = setTimeout(tick, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active]);

  return text;
}

/**
 * The 30 non-tech professions Patkan is built for. Third value is an extra
 * role instruction for professions without a dedicated engine persona
 * ("" = the mapped persona's own treatment is enough).
 */
const PROFESSIONS: PersonaOption[] = [
  ["Chartered Accountant", "auto", "Write as a chartered accountant."],
  ["Content Writer", "auto", "Write as a professional content writer."],
  ["Corporate Lawyer", "auto", "Write as a corporate lawyer."],
  ["Customer Success Manager", "auto", "Write as a customer success manager."],
  ["Customer Support Agent", "auto", "Write as a customer support agent."],
  ["Doctor", "auto", "Write as a doctor."],
  ["Equity Research Analyst", "analyst", ""],
  ["Executive Assistant", "auto", "Write as an executive assistant."],
  ["Financial Analyst", "analyst", ""],
  ["HR Business Partner", "auto", "Write as an HR business partner."],
  ["Insurance Advisor", "auto", "Write as an insurance advisor."],
  ["Journalist", "auto", "Write as a journalist."],
  ["Learning & Development Specialist", "auto", "Write as a learning and development specialist."],
  ["Litigation Advocate", "auto", "Write as a practising litigation advocate."],
  ["Management Consultant", "auto", "Write as a management consultant."],
  ["Marketing", "marketer", ""],
  ["Non-profit Grant Writer", "auto", "Write as a non-profit grant writer."],
  ["Operations Manager", "auto", "Write as an operations manager."],
  ["PR Manager", "auto", "Write as a public relations manager."],
  ["Product Manager", "product-manager", ""],
  ["Project Manager", "auto", "Write as a project manager."],
  ["Real Estate Agent", "auto", "Write as a real estate agent."],
  ["Recruiter", "auto", "Write as a talent recruiter."],
  ["Sales Representative", "auto", "Write as an experienced B2B sales representative."],
  ["SEO Specialist", "auto", "Write as an experienced SEO specialist."],
  ["Small Business Owner", "auto", "Write as a small business owner."],
  ["Social Media Manager", "auto", "Write as a social media manager."],
  ["Teacher", "auto", "Write as an experienced teacher."],
  ["UX / Product Designer", "auto", "Write as a senior UX/product designer."],
  ["UX Writer", "ux-writer", ""],
];

type PersonaOption = readonly [string, string, string];
const MARKETER_INDEX = PROFESSIONS.findIndex(([name]) => name === "Marketing");

const pillars = [
  {
    number: "01",
    icon: MousePointer2,
    heading: "Invisible Execution",
    body: 'No prompt libraries. No copy-pasting. No switching tabs. No endless typing. Ridiculously frictionless. Unbelievably precise. Leaves you "WTF!" the first time, and with a satisfying smile every time after.',
  },
  {
    number: "02",
    icon: Zap,
    heading: "100X your AI.",
    body: "Turn a raw thought into a surgical instruction in a flash. Patkan automatically injects the personas, constraints, and output formats that frontier models actually respect. Stop arguing with the AI to fix its mistakes. Get crazy good output on the very first prompt.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    heading: "A tool, not a toll.",
    body: "No pricing tiers. No credit limits. No monthly subscriptions. Foundational utilities should be a public good. Patkan is open-source, absolutely free, and built with zero interest in your data. Our contribution to the FOSS community.",
  },
] as const;

export const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/patkan-%E2%80%94-instant-expert-p/jcgkfecfliophjfnkokjnifcmalfbnnn";


const approvedUrls = [
  "https://chatgpt.com/*",
  "https://chat.openai.com/*",
  "https://claude.ai/*",
  "https://gemini.google.com/*",
  "https://aistudio.google.com/*",
  "https://www.perplexity.ai/*",
  "https://perplexity.ai/*",
  "https://copilot.microsoft.com/*",
  "https://grok.com/*",
  "https://chat.deepseek.com/*",
  "https://www.meta.ai/*",
  "https://meta.ai/*",
  "https://chat.mistral.ai/*",
  "https://poe.com/*",
  "https://www.notion.so/*",
  "https://kimi.com/*",
  "https://www.kimi.com/*",
  "https://chat.qwen.ai/*",
] as const;

const privacy = [
  {
    icon: Headphones,
    heading: "Deaf until //",
    body: "No keyloggers. No background daemons listening to keystrokes. Patkan takes no action until you type `//` at the end of a sentence.",
  },
  {
    icon: EyeOff,
    heading: "Blind to the rest of the web",
    body: "Patkan cannot see your other tabs, bank logins, emails, or browsing history. The browser sandbox strictly confines it to the AI sites in its approved list — `ChatGPT`, `Claude`, `Gemini`, `Microsoft Copilot`, `Perplexity`, and more.",
  },
] as const;



function Landing() {
  const { session } = useAuth();
  const isAdmin = useIsAdmin(!!session);
  const mobile = useIsMobile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOutEverywhere() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/", replace: true });
  }

  const [input, setInput] = useState("");
  const [targetIndex, setTargetIndex] = useState(0);
  const [personaIndex, setPersonaIndex] = useState(MARKETER_INDEX);
  const [output, setOutput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [clarifiers, setClarifiers] = useState<{ label: string; refinement: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number } | null>(null);
  const [customPersonas, setCustomPersonas] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputStarted = useRef(false);
  const outRef = useRef<HTMLPreElement>(null);

  const personaList: PersonaOption[] = [
    ...PROFESSIONS,
    ...customPersonas.map((name) => [name, "auto", `Write as ${name}.`] as PersonaOption),
  ];

  const target = targetAis[targetIndex]!;
  const persona = personaList[personaIndex] ?? personaList[MARKETER_INDEX]!;
  const dialect = target[1] as Dialect;
  const personaId = persona[1];
  const customInstruction = persona[2] || null;
  const intensity: Intensity = "standard";

  function addCustomPersona(name: string) {
    const clean = name.trim().slice(0, 40);
    if (!clean) return;
    const existing = customPersonas.indexOf(clean);
    if (existing >= 0) {
      setPersonaIndex(PROFESSIONS.length + existing);
      return;
    }
    setCustomPersonas([...customPersonas, clean]);
    setPersonaIndex(PROFESSIONS.length + customPersonas.length);
  }


  useSectionTracking("/");

  useEffect(() => {
    if (textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = `${Math.max(el.scrollHeight, 96)}px`;
    }
  }, [input]);

  // The allowance shown on load must be the real one, not an optimistic 10.
  useEffect(() => {
    let cancelled = false;
    const token = session?.access_token;
    fetch(`/api/public/usage?deviceId=${encodeURIComponent(deviceId())}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { used?: number; limit?: number } | null) => {
        if (cancelled || !data || typeof data.used !== "number" || typeof data.limit !== "number") return;
        setUsage({ used: data.used, limit: data.limit });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  async function transform(refinement?: string) {
    if (!input.trim() || busy) return;
    setBusy(true);
    setPhase("drafting");
    setAssumptions([]);
    setClarifiers([]);
    setOutput(localScaffold(input, { persona: personaId, dialect, intensity }));
    try {
      const result = await streamTransform(
        {
          text: input,
          persona: personaId,
          dialect,
          intensity,
          deviceId: deviceId(),
          accessToken: session?.access_token,
          refinement: refinement ?? null,
          customInstruction,
          surface: "web",
        },

        (visible) => {
          setPhase("sharpening");
          setOutput(visible);
        },
      );
      setOutput(result.prompt);
      trackEvent("playground_compiled", { meta: { engine: result.engine } });
      setPhase("ready");
      setAssumptions(result.assumptions);
      setClarifiers(result.clarifiers);
      if (typeof result.used === "number" && typeof result.limit === "number") {
        setUsage({ used: result.used, limit: result.limit });
      }
    } catch (err) {
      setPhase("ready");
      toast.error(err instanceof Error ? err.message : "Transform failed.");
    } finally {
      setBusy(false);
    }
  }

  /**
   * Quality signal. A copy is the strongest "this was good" a visitor gives us;
   * the thumbs-down is the only way a bad compile becomes visible at all.
   */
  function rate(accepted: boolean) {
    void fetch("/api/public/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ deviceId: deviceId(), accepted }),
      keepalive: true,
    }).catch(() => {});
  }

  async function copy() {
    if (!output) return;
    trackEvent("playground_copied");
    rate(true);
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function getExtension() {
    trackEvent("download_clicked", { meta: { file: "chrome-web-store" } });
    window.open(CHROME_WEB_STORE_URL, "_blank", "noopener,noreferrer");
  }

  async function sharePatkan() {
    trackEvent("share_clicked");
    const url = "https://www.patkan.in";
    const text = "Patkan — turn a rough thought into a surgically crafted prompt, instantly.";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Patkan", text, url });
      } catch {
        // User cancelled the share sheet — do nothing.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  function scrollToPlayground() {
    const el = document.getElementById("playground");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => textareaRef.current?.focus(), 400);
    }
  }

  function speak() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance("patkan");
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  const limit = usage?.limit ?? (session ? DAILY_SIGNED_IN_LIMIT : DAILY_FREE_LIMIT);
  const used = usage?.used ?? 0;
  const remaining = Math.max(0, limit - used);
  const exhausted = used >= limit;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className={`${shell} grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:h-16`}>
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <img
              src={patkanMark}
              alt="Patkan"
              width={816}
              height={816}
              className="size-8 shrink-0 rounded-[0.55rem] sm:size-9"
            />
            <span className="truncate text-lg font-semibold tracking-tight sm:text-xl">Patkan</span>
            <span className="shrink-0 rounded-full border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:px-2.5 sm:py-1 sm:text-[11px]">
              /पट्कन/
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden items-center gap-5 text-sm text-muted-foreground md:flex lg:gap-6">
              <a
                href="#playground"
                onClick={() => trackEvent("nav_clicked", { section: "playground" })}
                className="transition-colors hover:text-foreground"
              >
                Playground
              </a>
              <a
                href="#install"
                onClick={() => trackEvent("nav_clicked", { section: "install" })}
                className="transition-colors hover:text-foreground"
              >
                Install Guide
              </a>
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
                    <UserRound className="size-4" aria-hidden />
                    Account
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                      {session.user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/library">Your Library</Link>
                    </DropdownMenuItem>
                    {isAdmin ? (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">Admin</Link>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => void signOutEverywhere()}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth" className="transition-colors hover:text-foreground">
                  Sign in
                </Link>
              )}

            </div>

            <button
              onClick={sharePatkan}
              aria-label="Share Patkan"
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Share2 className="size-4" aria-hidden />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={getExtension}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:px-4"
            >
              <span className="hidden sm:inline">Add to Desktop</span>
              <span className="sm:hidden">Add</span>
              <ArrowDownToLine className="size-4" aria-hidden />
            </button>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label="Open menu"
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border text-foreground transition-colors hover:bg-muted md:hidden"
                >
                  <Menu className="size-5" aria-hidden />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[17rem]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-4 pb-6 text-base">
                  <a
                    href="#playground"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-2 py-2.5 transition-colors hover:bg-muted"
                  >
                    Playground
                  </a>
                  <a
                    href="#install"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-2 py-2.5 transition-colors hover:bg-muted"
                  >
                    Install Guide
                  </a>
                  {session ? (
                    <>
                      <Link
                        to="/library"
                        onClick={() => setMenuOpen(false)}
                        className="rounded-md px-2 py-2.5 transition-colors hover:bg-muted"
                      >
                        Your Library
                      </Link>
                      {isAdmin ? (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="rounded-md px-2 py-2.5 transition-colors hover:bg-muted"
                        >
                          Admin
                        </Link>
                      ) : null}
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          void signOutEverywhere();
                        }}
                        className="rounded-md px-2 py-2.5 text-left transition-colors hover:bg-muted"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setMenuOpen(false)}
                      className="rounded-md px-2 py-2.5 transition-colors hover:bg-muted"
                    >
                      Sign in
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      sharePatkan();
                    }}
                    className="flex items-center gap-2 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <Share2 className="size-4" aria-hidden />
                    Share
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      getExtension();
                    }}
                    className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                  >
                    Add to Desktop
                    <ArrowDownToLine className="size-4" aria-hidden />
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>


      <main>
        {/* Hero */}
        <section
          data-section="hero"
          className={`${shell} grid gap-10 pb-16 pt-10 sm:gap-12 sm:pb-20 sm:pt-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-20`}
        >
          <div className="order-2 lg:order-1">
            <div className="border-l-2 border-primary pl-4 sm:pl-6">
              <p className="text-balance text-xl font-medium leading-snug sm:text-2xl md:text-3xl">
                “Good prompts work better.
                <br />I know that, but its too much to type!”
              </p>
              <p className="mt-3 text-sm italic text-muted-foreground">— Is that you?</p>
            </div>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-9 sm:text-lg">
              Just type what you want to do in plain words and finish your sentence with{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">//</code>. Watch your
              rough thought turn into a surgically crafted prompt in the blink of an eye.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base">
              Patkan sits right inside <strong className="text-foreground">ChatGPT</strong>,{" "}
              <strong className="text-foreground">Claude</strong>, <strong className="text-foreground">Gemini</strong>,{" "}
              <strong className="text-foreground">Microsoft Copilot</strong>,{" "}
              <strong className="text-foreground">Perplexity</strong>, and more. You never have to switch tabs or leave
              your AI chat.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <button
                onClick={getExtension}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:h-10"
              >
                <ArrowDownToLine className="size-4" aria-hidden /> Add to Chrome
              </button>
              <button
                onClick={scrollToPlayground}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-background px-5 text-sm font-medium shadow-sm transition-colors hover:bg-accent sm:h-10"
              >
                Try it here first <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
            {session ? null : (
              <p className="mt-4 text-xs text-muted-foreground">
                No sign-up to start. 10 transforms a day in ghost mode, after that, sign-up and continue.
              </p>
            )}

          </div>

          <article className="order-1 overflow-hidden rounded-lg border bg-card shadow-sm lg:order-2">
            <div className="flex items-start justify-between gap-3 border-b p-5 sm:p-7 md:p-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h1 className="text-[2.6rem] font-semibold leading-none tracking-tight sm:text-5xl">patkan<span className="sr-only"> — prompt generator for ChatGPT, Gemini and Claude</span></h1>
                  <span className="text-xl text-muted-foreground sm:text-2xl">पट्कन</span>
                </div>
                <p className="mt-3 font-mono text-xs text-muted-foreground sm:text-sm">/ˈpʌʈ.kən/</p>
              </div>
              <button
                onClick={speak}
                className="inline-flex shrink-0 items-center gap-2 rounded-md border px-2.5 py-2 text-xs transition-colors hover:bg-accent sm:px-3 sm:text-sm"
              >
                <Volume2 className="size-4 text-primary" aria-hidden />
                <span className="hidden sm:inline">Listen</span>
              </button>
            </div>
            <div className="p-5 sm:p-7 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground sm:text-xs">
                <span className="italic">adverb | क्रियाविशेषण अव्यय</span>
                <span className="rounded-full bg-accent px-3 py-1 text-accent-foreground">Origin: Marathi [मराठी]</span>
              </div>
              <p className="mt-6 text-base leading-relaxed sm:mt-7 sm:text-lg">
                <span className="mr-3 font-mono text-sm text-primary">:</span>to perform, execute, or complete an action{" "}
                <strong>instantly, promptly, and without friction or delay</strong>; in a single swift motion.
              </p>
              <blockquote className="mt-6 border-l pl-4 text-sm italic leading-relaxed text-muted-foreground sm:mt-7">
                “Draft your raw thoughts, finish with <code className="font-mono text-foreground">//</code>, and watch it
                sharpen into an expert prompt <strong className="text-foreground">patkan</strong>.”
              </blockquote>
              <div className="mt-6 border-t pt-5 text-[11px] leading-relaxed text-muted-foreground sm:mt-7 sm:text-xs">
                <span className="font-semibold text-foreground">SYNONYMS:</span> promptly · instantly · swiftly · in a
                flash
              </div>
            </div>
          </article>
        </section>

        {/* Playground */}
        <section id="playground" data-section="playground" className="scroll-mt-16 border-y bg-card py-16 sm:py-20 md:py-28">
          <div className={shell}>
            <Playground
              input={input}
              setInput={(value: string) => {
                if (!inputStarted.current && value.trim()) {
                  inputStarted.current = true;
                  trackEvent("playground_input_started");
                }
                setInput(value);
              }}
              targetIndex={targetIndex}
              setTargetIndex={setTargetIndex}
              personaIndex={personaIndex}
              setPersonaIndex={setPersonaIndex}
              output={output}
              phase={phase}
              assumptions={assumptions}
              clarifiers={clarifiers}
              busy={busy}
              copied={copied}
              copy={copy}
              transform={transform}
              personaList={personaList}
              addCustomPersona={addCustomPersona}
              remaining={remaining}
              exhausted={exhausted}
              session={!!session}
              textareaRef={textareaRef}
              outRef={outRef}
            />
          </div>
        </section>

        {/* Install guide */}
        <section id="install" data-section="install" className="scroll-mt-16 border-y bg-card py-16 sm:py-20 md:py-28">
          <div className={shell}>
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">INSTALLATION GUIDE</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                  Browser Installation Guide
                </h2>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-primary bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    Google Chrome
                    <ChevronDown className="size-4" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                    also works on
                  </DropdownMenuLabel>
                  <DropdownMenuItem>Brave</DropdownMenuItem>
                  <DropdownMenuItem>Arc</DropdownMenuItem>
                  <DropdownMenuItem>Opera</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {["Microsoft Edge", "Mozilla Firefox", "Apple Safari"].map((name) => (
                <span
                  key={name}
                  className="inline-flex shrink-0 items-center rounded-full border px-4 py-2 text-sm text-muted-foreground"
                >
                  {name}
                  <span className="ml-1.5 font-mono text-[10px] uppercase tracking-wide">soon</span>
                </span>
              ))}
            </div>

            <div className="mx-auto max-w-2xl pt-12 text-center sm:pt-16">
              <p key={mobile ? "lead-m" : "lead-d"} className="text-xl font-black tracking-tight sm:text-2xl">
                <span>{mobile ? "Send directly to your computer's browser." : "2-Click Download"}</span>
              </p>
              <button
                type="button"
                onClick={getExtension}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-sm font-bold tracking-tight text-primary-foreground transition-opacity hover:opacity-90 sm:text-base"
              >
                Add to Chrome — Verified by Google
              </button>
              <p key={mobile ? "foot-m" : "foot-d"} className="mt-4 text-xs text-muted-foreground sm:text-sm">
                <span>{mobile ? "Google syncs across your signed-in devices." : "Works in Chrome, Brave, Arc & Opera."}</span>
              </p>
            </div>
          </div>

        </section>

        {/* Pillars */}
        <section data-section="pillars" className={`${shell} py-16 sm:py-20 md:py-24`}>
          <div aria-hidden className="h-[3px] w-full bg-primary" />
          <div className="border-b border-border md:grid md:grid-cols-[1fr_1.2fr_1fr] md:divide-x md:divide-border">
            {pillars.map(({ number, icon: Icon, heading, body }) => (
              <article
                key={heading}
                className="group flex gap-5 border-b border-border py-8 last:border-b-0 md:block md:border-b-0 md:px-10 md:py-12 md:first:pl-0 md:last:pr-0"
              >
                <div className="flex w-9 shrink-0 flex-col items-center gap-4 md:w-auto md:flex-row md:items-center md:justify-between">
                  <span className="font-mono text-xs tracking-widest text-muted-foreground md:text-3xl md:tracking-tight md:text-foreground/25 md:transition-colors md:duration-300 md:group-hover:text-primary">
                    {number}
                  </span>
                  <span aria-hidden className="w-px flex-1 bg-border md:hidden" />
                  <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-card md:size-10">
                    <Icon className="size-4 text-primary md:size-5" aria-hidden />
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl md:mt-10">{heading}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground md:mt-4">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>



        {/* Privacy */}
        <section data-section="privacy" className={`${shell} py-16 sm:py-20 md:py-28`}>
          <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-12">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Privacy &amp; Security</p>
              <h2 className="mt-3 max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Inside your AI tab. Nowhere else.
              </h2>
              <span className="mt-6 block h-px w-16 bg-primary" aria-hidden />
            </div>
            <div>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                No background tracking. No keystroke logging. No reading your chat history. Patkan is hardcoded strictly
                to <ApprovedUrlsTrigger /> and takes no action until you type{" "}
                <code className="font-mono text-foreground">//</code>. What you type compiles in RAM and vanishes.
              </p>
              <Link
                to="/privacy"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Read the full privacy policy <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>


          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border bg-border sm:mt-16 md:grid-cols-2">
            {privacy.map(({ icon: Icon, heading, body }, index) => (
              <article key={heading} className="bg-background p-6 sm:p-8 md:p-9">
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="font-mono text-xs tracking-widest text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight sm:text-xl">{heading}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{renderCode(body)}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Support */}
        <section data-section="support" id="support" className={`${shell} scroll-mt-24 pb-20 sm:pb-24 md:pb-28`}>
          <div className="rounded-lg border bg-card p-6 sm:p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-12">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Support</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  Need Help?
                </h2>
                <span className="mt-6 block h-px w-16 bg-primary" aria-hidden />
              </div>
              <div>
                <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Questions, bug reports, a site where Patkan should work but doesn&apos;t - send it across and
                  you&apos;ll get a reply from the person who builds Patkan.
                </p>
                <a
                  href="mailto:contact@patkan.in"
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Email: contact@patkan.in
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className={`${shell} flex flex-wrap items-center justify-between gap-3 py-8 text-xs text-muted-foreground`}>
          <p>patkan.in</p>
          <nav className="flex flex-wrap items-center gap-4" aria-label="Footer">
            <Link to="/chatgpt-prompt-generator" className="transition-colors hover:text-foreground">
              ChatGPT prompt generator
            </Link>
            <Link to="/claude-prompt-generator" className="transition-colors hover:text-foreground">
              Claude prompt generator
            </Link>
            <Link to="/privacy" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-foreground">
              Terms of Use
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function ApprovedUrlsTrigger() {
  return (
    <Popover onOpenChange={(open) => open && trackEvent("privacy_modal_viewed")}>
      <PopoverTrigger className="border-b border-primary text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
        these approved URLs ↗
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="font-mono text-xs font-medium">Hardcoded manifest.json Matches</span>
          <LockKeyhole className="size-4 text-primary" aria-hidden />
        </div>
        <div className="divide-y font-mono text-[11px]">
          {approvedUrls.map((url) => (
            <div key={url} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="truncate text-muted-foreground">{url}</span>
              <span className="flex shrink-0 items-center gap-1 text-primary">
                <Check className="size-3" aria-hidden /> VERIFIED
              </span>
            </div>
          ))}
        </div>
        <p className="border-t px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          Your browser strictly prevents content scripts from running on any domain not explicitly listed in this match array.
        </p>
      </PopoverContent>
    </Popover>
  );
}

const chipRow =
  "mt-3 flex gap-2 max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:pb-1 max-lg:[mask-image:linear-gradient(to_right,black_86%,transparent)] lg:flex-wrap";

function Chip({ name, active, onClick }: { name: string; active: boolean; onClick?: () => void }) {
  const base =
    "shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition-colors cursor-pointer select-none";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${active ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
    >
      {name}
    </button>
  );
}

interface PlaygroundProps {
  input: string;
  setInput: (v: string) => void;
  targetIndex: number;
  setTargetIndex: (i: number) => void;
  personaIndex: number;
  setPersonaIndex: (i: number) => void;
  personaList: PersonaOption[];
  addCustomPersona: (name: string) => void;
  output: string;
  phase: Phase;
  assumptions: string[];
  clarifiers: { label: string; refinement: string }[];
  busy: boolean;
  copied: boolean;
  copy: () => void;
  transform: (refinement?: string) => void;
  remaining: number;
  exhausted: boolean;
  session: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  outRef: React.RefObject<HTMLPreElement | null>;
}

function Playground(props: PlaygroundProps) {
  const {
    input,
    setInput,
    targetIndex,
    setTargetIndex,
    personaIndex,
    setPersonaIndex,
    personaList,
    addCustomPersona,
    output,
    phase,
    assumptions,
    clarifiers,
    busy,
    copied,
    copy,
    transform,
    remaining,
    exhausted,
    session,
    textareaRef,
    outRef,
  } = props;

  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState("");
  const target = targetAis[targetIndex]!;
  const persona = personaList[personaIndex] ?? personaList[MARKETER_INDEX]!;
  const settled = phase === "ready" || phase === "idle";
  const ghost = useGhostTyping(!input && !busy && !exhausted);

  return (
    <div>
      <div className="mx-auto mb-8 max-w-xl text-center sm:mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Playground</p>
      </div>
      <div className="relative flex flex-col lg:grid lg:grid-cols-[5fr_6fr] lg:gap-px lg:overflow-hidden lg:rounded-lg lg:border lg:bg-border lg:shadow-sm">
        {/* Input card */}
        <div className="rounded-lg border bg-background p-5 shadow-sm sm:p-7 lg:rounded-none lg:border-0 lg:pr-16 lg:shadow-none">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold tracking-wider">YOUR THOUGHTS</span>
            <span className="shrink-0 text-muted-foreground">
              {session
                ? exhausted
                  ? "0 left today"
                  : `${remaining} left today`
                : exhausted
                  ? "0 transforms left — sign in to keep going"
                  : `${remaining} more transforms, before you need to sign-in`}
            </span>
          </div>

          {exhausted ? (
            <div className="mt-5 min-h-24 border-b border-dashed pb-6 sm:min-h-28">
              <p className="text-sm text-muted-foreground">
                Daily limit reached.{" "}
                <Link to="/auth" className="text-primary underline underline-offset-4">
                  Sign in
                </Link>{" "}
                to keep going.
              </p>
            </div>
          ) : (
            <div className="relative mt-5 min-h-24 border-b border-dashed pb-6 sm:min-h-28">
              {!input && (
                <p
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 font-sans text-base text-muted-foreground sm:text-lg"
                >
                  {ghost || "I want to.."}
                  <span className="ml-0.5 inline-block w-px animate-pulse border-l border-muted-foreground align-middle text-transparent">
                    .
                  </span>
                </p>
              )}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                className="relative w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-sans text-base text-foreground focus:outline-none focus:ring-0 sm:text-lg"
                disabled={busy}
              />
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-start gap-x-12 gap-y-4">
            <div>
              <p className="font-mono text-[11px] tracking-widest text-muted-foreground">TARGET AI</p>
              <div className="mt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      {target[0]}
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
                    {targetAis.map(([name], index) => (
                      <DropdownMenuItem key={name} onSelect={() => setTargetIndex(index)}>
                        {name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest text-muted-foreground">SELECT ROLE</p>
              <div className="mt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      {persona[0]}
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
                    {personaList.map(([name], index) => (
                      <DropdownMenuItem key={name} onSelect={() => setPersonaIndex(index)}>
                        {name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem onSelect={() => setCustomOpen(true)}>Other</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {customOpen && (
            <form
              className="mt-4 flex max-w-sm gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addCustomPersona(customDraft);
                setCustomDraft("");
                setCustomOpen(false);
              }}
            >
              <input
                value={customDraft}
                onChange={(e) => setCustomDraft(e.target.value)}
                placeholder="Name your persona"
                maxLength={40}
                className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                className="h-9 shrink-0 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Add
              </button>
            </form>
          )}

          {/* Mobile CTA */}
          <button
            onClick={() => transform()}
            disabled={busy || !input.trim() || exhausted}
            className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 lg:hidden"
          >
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
            {busy ? "Patkan it…" : "Patkan it"}
          </button>
        </div>

        {/* Mobile connector */}
        <div className="flex flex-col items-center py-1 lg:hidden" aria-hidden>
          <span className="h-4 w-px bg-border" />
          <img src={patkanMark} alt="" width={816} height={816} className="my-1 size-8 rounded-[0.55rem] shadow-sm" />
          <span className="h-4 w-px bg-border" />
        </div>

        {/* Output card */}
        <div className="flex flex-col rounded-lg border bg-muted/40 p-5 shadow-sm sm:p-7 lg:rounded-none lg:border-0 lg:pl-16 lg:shadow-none">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider">
                {settled ? "UPGRADED PROMPT" : PHASE_LABEL[phase].toUpperCase()}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                Ready to paste into {target[0]}
              </p>
            </div>
            <button
              onClick={copy}
              disabled={!output || !settled}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              {copied ? <Check className="size-4" aria-hidden /> : <CopyIcon className="size-4" aria-hidden />}
              {copied ? "Copied" : "Copy Prompt"}
            </button>
          </div>
          <div className="relative mt-4 overflow-hidden rounded-md border bg-background">
            <pre
              ref={outRef}
              aria-busy={!settled}
              className={`max-h-72 space-y-2.5 overflow-auto p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words sm:max-h-96 sm:p-5 sm:text-xs ${
                settled ? "text-foreground/90 opacity-100" : "text-foreground/70 opacity-60"
              }`}
            >
              {output ? (
                <PromptOutput text={output} dialect={target[1] as Dialect} />
              ) : (
                <EmptySkeleton />
              )}
            </pre>
            {output && (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent"
                aria-hidden
              />
            )}
          </div>

          {assumptions.length > 0 && (
            <div className="mt-5 border-l-2 border-primary/60 pl-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                <strong className="font-mono text-[11px] tracking-wide text-foreground">Assumed:</strong>{" "}
                {assumptions.join(" · ")}
              </p>
            </div>
          )}

          {clarifiers.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 lg:mt-auto lg:pt-5">
              {clarifiers.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  disabled={busy || exhausted}
                  onClick={() => transform(c.refinement)}
                  className="rounded-full border border-dashed px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-50"
                >
                  + {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop bridge */}
        <button
          onClick={() => transform()}
          disabled={busy || !input.trim() || exhausted}
          className="absolute top-1/2 left-[45.45%] hidden h-11 -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium whitespace-nowrap text-primary-foreground shadow-lg ring-[6px] ring-background transition-colors hover:bg-primary/90 disabled:opacity-50 lg:inline-flex"
        >
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
          {busy ? "Patkan it…" : "Patkan it"}
        </button>
      </div>
    </div>
  );
}

function EmptySkeleton() {
  const rows: (number | string)[] = ["## Role", 70, 45, "## Context & Task", 85, 60, 40, "## Constraints", 55, 35];
  return (
    <span className="block select-none opacity-40" aria-hidden>
      {rows.map((row, i) =>
        typeof row === "string" ? (
          <span key={i} className="mt-3 block first:mt-0 text-primary/70">
            {row}
          </span>
        ) : (
          <span key={i} className="mt-2 block h-2 rounded bg-muted-foreground/25" style={{ width: `${row}%` }} />
        ),
      )}
    </span>
  );
}

function PromptOutput({ text, dialect }: { text: string; dialect: Dialect }) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        const isAccent = accentLine(line, dialect);
        return (
          <p key={i} className={isAccent ? "text-primary" : "text-foreground/90"}>
            {line || "\u00A0"}
          </p>
        );
      })}
    </>
  );
}

function accentLine(line: string, dialect: Dialect): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (dialect === "xml") {
    return /^<\/?[a-z_][a-z0-9_]*>$/i.test(trimmed);
  }
  if (dialect === "markdown") {
    return /^#{2,6}\s+/.test(trimmed);
  }
  return /^[A-Z][A-Z\s]{2,}$/.test(trimmed);
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}


function renderCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code key={part} className="font-mono text-foreground">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  );
}
