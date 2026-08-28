import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Patkan" },
      { name: "description", content: "Patkan — a new project, starting fresh." },
      { property: "og:title", content: "Patkan" },
      { property: "og:description", content: "Patkan — a new project, starting fresh." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <h1 className="text-sm text-muted-foreground">Blank slate.</h1>
    </main>
  );
}
