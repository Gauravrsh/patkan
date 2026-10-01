import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://patkan.in";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0", lastmod: "2026-09-30" },
          { path: "/about", changefreq: "monthly", priority: "0.7", lastmod: "2026-10-01" },
          { path: "/chatgpt-prompt-generator", changefreq: "monthly", priority: "0.8", lastmod: "2026-09-30" },
          { path: "/claude-prompt-generator", changefreq: "monthly", priority: "0.8", lastmod: "2026-09-30" },
          { path: "/gemini-prompt-generator", changefreq: "monthly", priority: "0.8", lastmod: "2026-09-30" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3", lastmod: "2026-09-27" },
          { path: "/terms", changefreq: "yearly", priority: "0.3", lastmod: "2026-09-27" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );


        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
