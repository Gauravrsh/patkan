import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/carousel")({
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
  component: CarouselPage,
});

/* ------------------------------------------------------------------ */
/*  SLIDE COPY — one entry per `----` fragment. Edit text here only.    */
/* ------------------------------------------------------------------ */

type Slide =
  | {
      layout: "cover";
      headline: string;
      subline?: string;
      dictionary?: { word: string; meta: string; def: string };
      hint?: string;
      headlineSize?: number;
    }
  | { layout: "content"; label: string; headline: string; body?: string }
  | { layout: "cta"; headline: string; body?: string }
  | { layout: "closing"; headline: string; body?: string };

const SLIDES: Slide[] = [
  // 01
  {
    layout: "cover",
    headline: '"Kya ch***ya hai ye AI"',
    subline: "(with an exhausted sigh!!)",
  },
  // 02
  { layout: "cover", headline: "OR" },
  // 03
  {
    layout: "cover",
    headline: '"This AI sucks!!"',
    subline: "— if you are more Maya than Monisha (#IFKYK)",
  },
  // 04
  {
    layout: "content",
    label: "the question",
    headline: "is that you, more often than not?",
    body: "I surely am.",
  },
  // 05
  {
    layout: "content",
    label: "the premise",
    headline: "writing a good opening prompt is a game changer for any work with AI",
  },
  // 06
  {
    layout: "content",
    label: "what it gives",
    headline: "it gives right context, guardrails, do's and don'ts, output format to AI.",
  },
  // 07
  {
    layout: "content",
    label: "the leverage",
    headline: "it can ask you all the right questions before even getting started.",
  },
  // 08
  {
    layout: "content",
    label: "the result",
    headline: "the outputs suddenly starts to get so much..",
    body: "how you always wanted it..\nhow an AI should be",
  },
  // 09
  { layout: "cover", headline: "Intelligent!" },
  // 10
  {
    layout: "content",
    label: "the turn",
    headline: "so, what's the problem?",
  },
  // 11
  { layout: "cover", headline: "bas ek." },
  // 12
  { layout: "cover", headline: "Itna type kaun karega!!" },
  // 13
  {
    layout: "content",
    label: "the promise",
    headline:
      "what if your rough first idea converts into a surgical prompt, even before it goes into your AI chat?",
  },
  // 14
  {
    layout: "content",
    label: "the shift",
    headline: "and sets your conversation on a totally different track.",
  },
  // 15
  {
    layout: "content",
    label: "the payoff",
    headline: "the track that gets you 100X from your AI.",
    body: "things that you had not thought of.\nareas which you had overlooked.\nscenarios you had not imagined.",
  },
  // 16
  {
    layout: "cover",
    headline: "presenting patkan",
    headlineSize: 48,
    dictionary: {
      word: "patkan",
      meta: "/pʌtˈkʌn/ · verb",
      def: "turn a rough thought into a surgical prompt.",
    },
    hint: "dictionary screen",
  },
  // 17
  {
    layout: "cta",
    headline: "just type in your rough thought and end the sentence with a [//]",
    body: "see the magic for yourself.",
  },
  // 18
  { layout: "closing", headline: "website link", body: "www.patkan.in" },
];

const FOOTER_LEFT = "made with patkan · speak. polish. post.";
const TAGLINE = "speak. polish. post.";

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
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`pk-slide layout-${slide.layout}${i === current ? " active" : ""}`}
            >
              <div className="slide-header">
                <div className="wordmark">patkan</div>
                <div className="slide-number">№ {pad(i + 1)}</div>
              </div>

              {slide.layout === "cover" && (
                <>
                  <div
                    className="cover-headline"
                    style={
                      slide.headlineSize
                        ? { fontSize: slide.headlineSize, marginBottom: 24 }
                        : undefined
                    }
                  >
                    {slide.headline}
                  </div>
                  {slide.subline && (
                    <div className="cover-subline">{slide.subline}</div>
                  )}
                  {slide.dictionary && (
                    <div className="dictionary-card">
                      <div className="dictionary-word">{slide.dictionary.word}</div>
                      <div className="dictionary-meta">{slide.dictionary.meta}</div>
                      <div className="dictionary-def">{slide.dictionary.def}</div>
                    </div>
                  )}
                  <div
                    className="cover-hint"
                    style={slide.dictionary ? { marginTop: 36 } : undefined}
                  >
                    <span className="dot" />
                    <span>{slide.hint ?? "swipe →"}</span>
                  </div>
                </>
              )}

              {slide.layout === "content" && (
                <>
                  <div className="section-label">
                    <span className="number">{pad(i + 1)}</span>
                    <span className="rule" />
                    <span className="label">{slide.label}</span>
                  </div>
                  <div className="content-headline">{slide.headline}</div>
                  {slide.body && <div className="content-body">{slide.body}</div>}
                </>
              )}

              {slide.layout === "cta" && (
                <>
                  <div className="content-headline">{slide.headline}</div>
                  {slide.body && <div className="content-body">{slide.body}</div>}
                  <div className="cta-wordmark">patkan</div>
                  <div className="cta-tagline">{TAGLINE}</div>
                </>
              )}

              {slide.layout === "closing" && (
                <>
                  <div className="closing-headline">{slide.headline}</div>
                  <div className="closing-rule" />
                  {slide.body && <div className="closing-body">{slide.body}</div>}
                  <div className="closing-wordmark">patkan</div>
                  <div className="closing-tagline">{TAGLINE}</div>
                </>
              )}

              <div className="slide-footer">
                <div className="footer-left">{FOOTER_LEFT}</div>
                <div className="footer-right">
                  {pad(i + 1)} / {pad(total)}
                </div>
              </div>
            </div>
          ))}
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
  width: min(100%, calc(100vh * 0.62));
  max-width: 460px;
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
  padding: 64px 72px 56px;
  opacity: 0; pointer-events: none;
  transition: opacity 320ms ease;
  background: var(--paper);
}
.pk-slide.active { opacity: 1; pointer-events: auto; z-index: 1; }
.pk-slide .slide-header {
  display: flex; align-items: center; justify-content: space-between;
  align-self: stretch; border-bottom: 1px solid var(--rule); padding-bottom: 18px;
}
.pk-slide .wordmark { font-size: 18px; font-weight: 500; letter-spacing: 0.04em; color: var(--ink); text-transform: lowercase; }
.pk-slide .slide-number { font-size: 16px; color: var(--muted); letter-spacing: 0.06em; }
.pk-slide .slide-footer {
  margin-top: auto; border-top: 1px solid var(--rule); padding-top: 18px;
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  align-self: stretch; font-size: 14px; color: var(--muted);
}
.pk-slide .footer-left { text-transform: lowercase; letter-spacing: 0.02em; }
.pk-slide .footer-right { letter-spacing: 0.04em; }

.pk-slide.layout-cover, .pk-slide.layout-closing { justify-content: center; align-items: center; text-align: center; }
.pk-slide.layout-cover .slide-header,
.pk-slide.layout-closing .slide-header,
.pk-slide.layout-cta .slide-header { position: absolute; top: 64px; left: 72px; right: 72px; }
.pk-slide.layout-cover .slide-footer,
.pk-slide.layout-closing .slide-footer,
.pk-slide.layout-cta .slide-footer { position: absolute; bottom: 56px; left: 72px; right: 72px; }

.pk-slide .cover-headline { font-family: 'Fraunces', serif; font-style: italic; font-size: 48px; line-height: 1.18; font-weight: 500; color: var(--ink); }
.pk-slide .cover-subline { font-size: 20px; line-height: 1.45; color: var(--muted); margin-top: 24px; max-width: 84%; }
.pk-slide .cover-hint { display: inline-flex; align-items: center; gap: 10px; margin-top: 40px; font-size: 15px; color: var(--muted); }
.pk-slide .cover-hint .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--orange); }

.pk-slide.layout-content { align-items: stretch; padding-top: 120px; }
.pk-slide.layout-content .section-label,
.pk-slide.layout-content .content-headline,
.pk-slide.layout-content .content-body { align-self: flex-start; }

.pk-slide.layout-cta { align-items: center; justify-content: center; text-align: center; padding-top: 140px; padding-bottom: 140px; }
.pk-slide.layout-cta .content-headline { font-family: 'Fraunces', serif; font-style: italic; font-size: 38px; line-height: 1.22; font-weight: 500; color: var(--ink); max-width: 92%; margin-bottom: 0; }
.pk-slide.layout-cta .content-body { font-size: 20px; color: var(--muted); margin-top: 24px; max-width: 84%; }
.pk-slide.layout-cta .cta-wordmark { font-size: 32px; font-weight: 500; letter-spacing: 0.04em; color: var(--ink); text-transform: lowercase; margin-top: 44px; }
.pk-slide.layout-cta .cta-tagline { font-size: 15px; color: var(--muted); margin-top: 10px; letter-spacing: 0.06em; }

.pk-slide .section-label { display: flex; align-items: center; gap: 14px; width: 100%; margin-bottom: 32px; }
.pk-slide .section-label .number { font-size: 20px; font-weight: 600; color: var(--orange); }
.pk-slide .section-label .rule { flex: 1; height: 1px; background: var(--rule); }
.pk-slide .section-label .label { font-size: 14px; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }

.pk-slide .content-headline { font-family: 'Fraunces', serif; font-style: italic; font-size: 36px; line-height: 1.2; font-weight: 500; color: var(--ink); margin-bottom: 24px; }
.pk-slide .content-body { font-size: 20px; line-height: 1.55; color: var(--ink); white-space: pre-line; }

.pk-slide .closing-headline { font-family: 'Fraunces', serif; font-style: italic; font-size: 46px; line-height: 1.2; font-weight: 500; color: var(--ink); max-width: 90%; white-space: pre-line; }
.pk-slide .closing-rule { width: 64px; height: 3px; background: var(--orange); margin: 32px auto; }
.pk-slide .closing-body { font-size: 24px; line-height: 1.55; color: var(--ink); max-width: 84%; margin-bottom: 44px; white-space: pre-line; }
.pk-slide .closing-wordmark { font-size: 32px; font-weight: 500; letter-spacing: 0.04em; color: var(--ink); text-transform: lowercase; }
.pk-slide .closing-tagline { font-size: 15px; color: var(--muted); margin-top: 10px; letter-spacing: 0.06em; }

.pk-slide .dictionary-card { width: 100%; border: 1px solid var(--rule); border-radius: 2px; padding: 36px; text-align: left; background: rgba(255,255,255,0.25); }
.pk-slide .dictionary-word { font-family: 'Fraunces', serif; font-style: italic; font-size: 52px; font-weight: 600; color: var(--ink); margin-bottom: 8px; }
.pk-slide .dictionary-meta { font-size: 16px; color: var(--orange); font-weight: 500; margin-bottom: 20px; }
.pk-slide .dictionary-def { font-size: 20px; line-height: 1.55; color: var(--ink); }

.pk-nav { margin-top: 20px; display: flex; align-items: center; gap: 16px; color: rgba(255,255,255,0.8); }
.pk-nav button { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.9); width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 200ms ease; }
.pk-nav button:hover { background: rgba(255,255,255,0.2); }
.pk-nav button:disabled { opacity: 0.35; cursor: not-allowed; }
.pk-nav .counter { font-size: 14px; min-width: 64px; text-align: center; letter-spacing: 0.04em; }
.pk-dots { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; justify-content: center; max-width: 80%; }
.pk-dots .dot-item { width: 8px; height: 8px; border: none; padding: 0; border-radius: 50%; background: rgba(255,255,255,0.25); cursor: pointer; transition: background 200ms ease; }
.pk-dots .dot-item.active { background: var(--orange); }
.pk-hint { margin-top: 10px; font-size: 12px; color: rgba(255,255,255,0.45); }

@media (max-width: 640px) {
  .pk-app { padding: 12px; }
  .pk-stage { max-width: 100%; width: 100%; }
  .pk-slide { padding: 44px 32px 40px; }
  .pk-slide.layout-content { padding-top: 92px; }
  .pk-slide.layout-cover .slide-header,
  .pk-slide.layout-closing .slide-header,
  .pk-slide.layout-cta .slide-header { top: 44px; left: 32px; right: 32px; }
  .pk-slide.layout-cover .slide-footer,
  .pk-slide.layout-closing .slide-footer,
  .pk-slide.layout-cta .slide-footer { bottom: 40px; left: 32px; right: 32px; }
  .pk-slide.layout-cta { padding-top: 104px; padding-bottom: 104px; }
  .pk-slide.layout-cta .content-headline { font-size: 26px; }
  .pk-slide.layout-cta .content-body { font-size: 16px; }
  .pk-slide.layout-cta .cta-wordmark { font-size: 24px; }
  .pk-slide .cover-headline { font-size: 32px; }
  .pk-slide .cover-subline { font-size: 16px; }
  .pk-slide .content-headline { font-size: 24px; }
  .pk-slide .content-body { font-size: 16px; }
  .pk-slide .closing-headline { font-size: 30px; }
  .pk-slide .closing-body { font-size: 20px; }
  .pk-slide .closing-wordmark { font-size: 24px; }
  .pk-slide .dictionary-card { padding: 24px; }
  .pk-slide .dictionary-word { font-size: 38px; }
  .pk-slide .dictionary-def { font-size: 16px; }
  .pk-slide .slide-footer { font-size: 11px; }
}
`;
