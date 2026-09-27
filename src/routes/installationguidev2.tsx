import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const STORE_URL =
  "https://chromewebstore.google.com/detail/patkan-%E2%80%94-instant-expert-p/jcgkfecfliophjfnkokjnifcmalfbnnn";

export const Route = createFileRoute("/installationguidev2")({
  head: () => ({
    meta: [
      { title: "Installation — Patkan" },
      {
        name: "description",
        content: "Two clicks. Confirm with Google. You're done.",
      },
      { property: "og:title", content: "Installation — Patkan" },
      {
        property: "og:description",
        content: "Two clicks. Confirm with Google. You're done.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InstallSection,
});

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return mobile;
}

function InstallSection() {
  const mobile = useIsMobile();

  const copy = mobile
    ? {
        headline: "On your phone?",
        sub: "Tap below to add Patkan to your computer.",
        cta: "Add to Desktop — Verified by Google",
        foot: "Ready on your laptop the next time you open it.",
      }
    : {
        headline: "Two clicks.",
        sub: "Click below. Confirm with Google. You're done.",
        cta: "Add to Chrome — Verified by Google",
        foot: "Free. Works in Chrome, Brave, Edge & Opera.",
      };

  return (
    <section className="bg-background px-5 py-14 text-foreground">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl">
          {copy.headline}
        </h2>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          {copy.sub}
        </p>
        <button
          type="button"
          onClick={() => window.open(STORE_URL, "_blank", "noopener,noreferrer")}
          className="mt-6 rounded-full bg-primary px-7 py-3.5 text-sm font-bold tracking-tight text-primary-foreground transition-opacity hover:opacity-90"
        >
          {copy.cta}
        </button>
        <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
          {copy.foot}
        </p>
      </div>
    </section>
  );
}
