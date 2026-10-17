import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/linkedin-cover")({
  head: () => ({
    meta: [
      { title: "Patkan LinkedIn Cover Preview" },
      { name: "description", content: "Private preview of the Patkan LinkedIn company page cover." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Patkan LinkedIn Cover Preview" },
      { property: "og:description", content: "Private preview of the Patkan LinkedIn company page cover." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LinkedInCover,
});

const C = { bg: "#F5F2EB", ink: "#1C1917", muted: "#78716C", sub: "#57534E", line: "#E7E5E4", orange: "#FF6B00" };

const HOSTS = [
  { name: "ChatGPT", icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/openai.svg" },
  { name: "Claude", icon: "https://cdn.simpleicons.org/claude/D97757" },
  { name: "Gemini", icon: "https://cdn.simpleicons.org/googlegemini/8E75B2" },
  { name: "Copilot", icon: "https://cdn.simpleicons.org/githubcopilot/1C1917" },
  { name: "Perplexity", icon: "https://cdn.simpleicons.org/perplexity/1FB8CD" },
  { name: "DeepSeek", icon: "https://www.google.com/s2/favicons?domain=deepseek.com&sz=64" },
];

function Slashes({ size = 1 }: { size?: number }) {
  return <span style={{ color: C.orange, fontWeight: 700, fontSize: `${size}em` }}>//</span>;
}

function LinkedInCover() {
  const [zoom, setZoom] = useState(1);
  return (
    <div style={{ minHeight: "100vh", background: "#2A2724", padding: 32, fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[1, 2].map((z) => (
          <button key={z} onClick={() => setZoom(z)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #57534E", background: zoom === z ? C.orange : "transparent", color: "#F5F2EB", fontSize: 13 }}>
            {z}×
          </button>
        ))}
        <span style={{ color: "#A8A29E", fontSize: 13, alignSelf: "center" }}>1128 × 191 px</span>
      </div>
      <div style={{ overflow: "auto" }}>
        <div style={{ width: 1128 * zoom, height: 191 * zoom }}>
          <div
            id="cover"
            style={{ width: 1128, height: 191, background: C.bg, position: "relative", transform: `scale(${zoom})`, transformOrigin: "top left", overflow: "hidden" }}
          >
            {/* Center copy */}
            <div style={{ position: "absolute", left: 230, top: 30, width: 510 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: C.muted }}>YOUR PERSONAL PROMPT ENGINEER</div>
              <div style={{ marginTop: 10, fontSize: 30, fontWeight: 800, lineHeight: 1.1, color: C.ink, letterSpacing: -0.5 }}>
                Turn rough thoughts into
                <br />
                expert prompts.
              </div>
              <div style={{ marginTop: 16, fontSize: 14, fontWeight: 500, color: C.sub }}>
                End any sentence with <Slashes /> right inside your AI composer.
              </div>
            </div>
            {/* Right grid */}
            <div style={{ position: "absolute", left: 770, top: 22, width: 300 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: C.muted, marginBottom: 8 }}>WORKS DIRECTLY INSIDE</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {HOSTS.map((h) => (
                  <div key={h.name} style={{ height: 40, background: "#FFFFFF", border: `1px solid ${C.line}`, borderRadius: 8, display: "flex", alignItems: "center", gap: 7, padding: "0 10px" }}>
                    <img src={h.icon} alt="" width={18} height={18} style={{ objectFit: "contain" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{h.name}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                  <Slashes />
                </div>
                <span style={{ fontSize: 12, color: C.muted }}>patkan.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
