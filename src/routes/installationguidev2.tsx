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
        lead: "Send directly to your computer's browser.",
        foot: "Google syncs across your signed-in devices.",
      }
    : {
        lead: "2-Click Download",
        foot: "Works in Chrome, Brave, Edge & Opera.",
      };

  return (
    <section className="bg-background px-6 py-20 text-foreground sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xl font-black tracking-tight sm:text-2xl">
          {copy.lead}
        </p>
        <button
          type="button"
          onClick={() => window.open(STORE_URL, "_blank", "noopener,noreferrer")}
          className="mt-6 rounded-full bg-primary px-8 py-4 text-sm font-bold tracking-tight text-primary-foreground transition-opacity hover:opacity-90 sm:text-base"
        >
          Add to Chrome — Verified by Google
        </button>
        <p className="mt-4 text-xs text-muted-foreground sm:text-sm">
          {copy.foot}
        </p>
      </div>
    </section>
  );
}

