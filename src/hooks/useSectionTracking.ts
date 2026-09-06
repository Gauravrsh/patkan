import { useEffect } from "react";

import { flushEvents, referrerHost, trackEvent } from "@/lib/telemetry";

/**
 * Measures the landing-page story: which sections people actually reach, how
 * long each one holds them, how far they scroll, and where they leave.
 *
 * Sections opt in with `data-section="name"`. Nothing about the visitor is
 * collected beyond that.
 */
export function useSectionTracking(path = "/") {
  useEffect(() => {
    if (typeof window === "undefined") return;

    trackEvent("page_viewed", { path, referrerHost: referrerHost() });

    const seen = new Set<string>();
    const visibleSince = new Map<string, number>();
    const dwell = new Map<string, number>();
    let lastSection: string | null = null;

    const flushDwell = (name: string) => {
      const since = visibleSince.get(name);
      if (since === undefined) return;
      visibleSince.delete(name);
      const total = (dwell.get(name) ?? 0) + (Date.now() - since);
      dwell.set(name, total);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const name = (entry.target as HTMLElement).dataset["section"];
          if (!name) continue;
          if (entry.isIntersecting) {
            visibleSince.set(name, Date.now());
            lastSection = name;
            if (!seen.has(name)) {
              seen.add(name);
              trackEvent("section_seen", { section: name, path });
            }
          } else {
            flushDwell(name);
          }
        }
      },
      { threshold: 0.5 },
    );

    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    targets.forEach((el) => observer.observe(el));

    const depths = [25, 50, 75, 100];
    const hit = new Set<number>();
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = Math.min(100, Math.round((window.scrollY / max) * 100));
      for (const d of depths) {
        if (pct >= d && !hit.has(d)) {
          hit.add(d);
          trackEvent("scroll_depth", { value: d, path });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const finish = () => {
      targets.forEach((el) => {
        const name = el.dataset["section"];
        if (name) flushDwell(name);
      });
      for (const [name, ms] of dwell) {
        if (ms >= 500) trackEvent("section_dwell", { section: name, value: ms, path });
      }
      dwell.clear();
      if (lastSection) trackEvent("exit_section", { section: lastSection, path });
      flushEvents(true);
    };

    const onHide = () => {
      if (document.visibilityState === "hidden") finish();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", finish);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", finish);
      finish();
    };
  }, [path]);
}
