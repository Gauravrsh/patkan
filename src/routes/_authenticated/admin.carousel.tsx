import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getMyAdminAccess } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/carousel")({
  head: () => ({
    meta: [
      { title: "Patkan — LinkedIn Carousel Preview" },
      {
        name: "description",
        content:
          "Private preview of the Patkan LinkedIn carousel slides, in brand layout.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500;1,9..144,600&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  component: CarouselGate,
});

function CarouselGate() {
  const checkAccess = useServerFn(getMyAdminAccess);
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-admin-access"],
    queryFn: () => checkAccess(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error || !data?.isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-xl font-semibold tracking-tight">Not your page</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This page is limited to Patkan admins.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link to="/">Back to Patkan</Link>
          </Button>
        </div>
      </main>
    );
  }

  return <CarouselPage />;
}

/* ------------------------------------------------------------------ */
/*  SLIDE COPY — one entry per `----` fragment. Edit text here only.    */
/* ------------------------------------------------------------------ */

type Slide = {
  label: string;
  headline: string;
  body?: string;
  bullets?: string[];
};

const SLIDES: Slide[] = [
  {
    label: "\n",
    headline: "Kya ch***ya hai ye AI!",
    body: "..with an exhausted sigh!!",
  },
  { label: "\n", headline: "OR" },
  {
    label: "\n",
    headline: "This AI sucks!",
    body: "- If you are more Maya than Monisha \n\n\n#IFKYK",
  },
  {
    label: "\n",
    headline: "Is that you, more often than not?",
    body: "I surely am.",
  },
  {
    label: "\n",
    headline: "writing a good opening prompt is a game changer for any work with AI",
  },
  {
    label: "\n",
    headline: "it gives right context,\nguardrails, \ndo's and don'ts, \noutput format to AI.",
  },
  {
    label: "\n",
    headline: "it can ask you all the right questions before even getting started.",
  },
    {
      label: "\n",
    headline: "the outputs suddenly starts to get so much..",
    bullets: ["how you always wanted it..", "how an AI should be.."],
  },
  { label: "in one word", headline: "Intelligent!" },
  { label: "\n", headline: "so, what's the problem?" },
  { label: "just one", headline: "bas ek." },
  { label: "\n", headline: "Itna type kaun karega!!" },
  {
    label: "\n",
    headline:
      "what if your rough first idea converts into a surgical prompt,\n\n\neven before it goes into your AI chat?",
  },
  {
    label: "\n",
    headline: "and sets your conversation on a totally different track.",
  },
  {
    label: "\n",
    headline: "the track that gets you 100X from your AI.",
    bullets: [
      "things that you had not thought of.",
      "areas which you had overlooked.",
      "scenarios you had not imagined.",
    ],
  },
  {
    label: "presenting",
    headline: "patkan",
    body: "/pʌtˈkʌn/ · verb",
    bullets: ["turn a rough thought into a surgical prompt."],
  },
  {
    label: "how to use",
    headline: "just type in your rough thought and end the sentence with  //",
    body: "see the magic for yourself.",
  },
  {
    label: "\n",
    headline: "www.patkan.in",
    body: "\n",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

function CarouselPage() {
  const total = SLIDES.length;
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= total) return;
      setCurrent(index);
    },
    [total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(current - 1);
      if (e.key === "ArrowRight") goTo(current + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current, goTo]);

  return (
    <div className="pk-app">
      <style>{CAROUSEL_CSS}</style>
      <div
        className="pk-stage"
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0]?.screenX ?? 0;
        }}
        onTouchEnd={(e) => {
          const endX = e.changedTouches[0]?.screenX ?? 0;
          const diff = touchStartX.current - endX;
          if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
        }}
      >
        <div className="pk-slides">
          {SLIDES.map((slide, i) => {
            const len = slide.headline.length;
            const size = len <= 18 ? "xl" : len <= 45 ? "lg" : len <= 80 ? "md" : "sm";
            return (
              <div
                key={i}
                className={`pk-slide${i === current ? " active" : ""}`}
              >
                <div className="section-label">
                  <span className="number">{pad(i + 1)}</span>
                  <span className="rule" />
                  <span className="label">{slide.label}</span>
                </div>

                <div className="slide-body">
                  <div className={`content-headline size-${size}`}>
                    {slide.headline}
                  </div>
                  {slide.body && <div className="content-body">{slide.body}</div>}
                  {slide.bullets && (
                    <ul className="content-bullets">
                      {slide.bullets.map((b, bi) => (
                        <li key={bi}>
                          <span className="marker" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="slide-footer">
                   <div className="footer-left">{"\n"}</div>
                  <div className="footer-right">
                    {pad(i + 1)} / {pad(total)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pk-nav">
        <button
          type="button"
          aria-label="Previous slide"
          disabled={current === 0}
          onClick={() => goTo(current - 1)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="counter">
          {pad(current + 1)} / {pad(total)}
        </div>
        <button
          type="button"
          aria-label="Next slide"
          disabled={current === total - 1}
          onClick={() => goTo(current + 1)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      <div className="pk-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            className={`dot-item${i === current ? " active" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
      <div className="pk-hint">use arrow keys or swipe to navigate</div>
    </div>
  );
}

const CAROUSEL_CSS = `
.pk-app {
  --paper: #F3EFE4;
  --ink: #1C1917;
  --orange: #D96C2C;
  --muted: rgba(28, 25, 23, 0.55);
  --rule: rgba(28, 25, 23, 0.15);
  position: fixed;
  inset: 0;
  z-index: 60;
  background: #121212;
  font-family: 'Inter', sans-serif;
  color: var(--ink);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: hidden;
}
.pk-app *, .pk-app *::before, .pk-app *::after { box-sizing: border-box; }
.pk-stage {
  position: relative;
  container-type: inline-size;
  width: min(100%, calc((100vh - 150px) * 0.8));
  max-width: 520px;
  aspect-ratio: 1080 / 1350;
  background: var(--paper);
  border-radius: 4px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.45);
  overflow: hidden;
}
.pk-slides { width: 100%; height: 100%; position: relative; }
.pk-slide {
  position: absolute; inset: 0; width: 100%; height: 100%;
  display: flex; flex-direction: column;
  padding: 5.9cqw 6.7cqw 5.2cqw;
  opacity: 0; pointer-events: none;
  transition: opacity 320ms ease;
  background: var(--paper);
}
.pk-slide.active { opacity: 1; pointer-events: auto; z-index: 1; }
.pk-slide .slide-footer {
  margin-top: auto; border-top: 1px solid var(--rule); padding-top: 2cqw;
  display: flex; align-items: baseline; justify-content: space-between; gap: 1.8cqw;
  align-self: stretch; color: var(--muted); white-space: nowrap;
}
.pk-slide .footer-left { font-family: 'Fraunces', serif; font-size: 3cqw; font-weight: 500; color: var(--ink); text-transform: lowercase; letter-spacing: 0.01em; }
.pk-slide .footer-right { font-size: 1.8cqw; letter-spacing: 0.04em; }

.pk-slide .section-label { display: flex; align-items: center; gap: 1.6cqw; width: 100%; margin-bottom: 4cqw; }
.pk-slide .section-label .number { font-size: 2.6cqw; font-weight: 600; color: var(--orange); }
.pk-slide .section-label .rule { flex: 1; height: 1px; background: var(--rule); }
.pk-slide .section-label .label { font-size: 1.8cqw; font-weight: 400; color: var(--muted); letter-spacing: 0.02em; }

.pk-slide .slide-body { display: flex; flex-direction: column; justify-content: center; flex: 1; min-height: 0; }
.pk-slide .content-headline { font-family: 'Fraunces', serif; font-weight: 500; line-height: 1.12; color: var(--ink); max-width: 100%; }
.pk-slide .content-headline.size-xl { font-size: 10cqw; }
.pk-slide .content-headline.size-lg { font-size: 8cqw; }
.pk-slide .content-headline.size-md { font-size: 6.4cqw; }
.pk-slide .content-headline.size-sm { font-size: 5.4cqw; }
.pk-slide .content-body { font-size: 3.1cqw; line-height: 1.5; color: var(--ink); white-space: pre-line; max-width: 100%; margin-top: 3.4cqw; }
.pk-slide .content-bullets { list-style: none; margin: 4cqw 0 0; padding: 0; display: flex; flex-direction: column; gap: 2.4cqw; }
.pk-slide .content-bullets li { display: flex; align-items: baseline; gap: 2cqw; font-size: 3cqw; line-height: 1.4; color: var(--ink); }
.pk-slide .content-bullets .marker { flex: none; width: 0; height: 0; border-left: 1.5cqw solid var(--orange); border-top: 0.9cqw solid transparent; border-bottom: 0.9cqw solid transparent; }


.pk-nav { margin-top: 20px; display: flex; align-items: center; gap: 16px; color: rgba(255,255,255,0.8); }
.pk-nav button { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.9); width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 200ms ease; }
.pk-nav button:hover { background: rgba(255,255,255,0.2); }
.pk-nav button:disabled { opacity: 0.35; cursor: not-allowed; }
.pk-nav .counter { font-size: 14px; min-width: 64px; text-align: center; letter-spacing: 0.04em; }
.pk-dots { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; justify-content: center; max-width: 80%; }
.pk-dots .dot-item { width: 8px; height: 8px; border: none; padding: 0; border-radius: 50%; background: rgba(255,255,255,0.25); cursor: pointer; transition: background 200ms ease; }
.pk-dots .dot-item.active { background: var(--orange); }
.pk-hint { margin-top: 10px; font-size: 12px; color: rgba(255,255,255,0.45); }

@media (max-width: 640px) {
  .pk-app { padding: 12px; }
  .pk-stage { max-width: 100%; width: 100%; }
}
`;
