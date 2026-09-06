import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/docs")({
  head: () => ({
    meta: [
      { title: "Patkan product handbook" },
      {
        name: "description",
        content: "Plain-language reference for how Patkan works, what it measures, and what to do next.",
      },
      { property: "og:title", content: "Patkan product handbook" },
      {
        property: "og:description",
        content: "Plain-language reference for how Patkan works, what it measures, and what to do next.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DocsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function DocsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Product handbook</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Everything about Patkan in plain language — what it is, how the numbers are built, and what each
        number should make you do.
      </p>

      <Section title="What Patkan is">
        <p>
          Patkan turns a rough thought into a carefully built prompt. Two ways to use it: the playground on
          the website, or the browser add-on that works inside ChatGPT, Claude and Gemini — you type your
          thought, end it with <code className="rounded bg-muted px-1">//</code>, and the rough line is
          replaced with a proper prompt in place.
        </p>
      </Section>

      <Section title="How someone becomes a user">
        <p>
          They land on the site, try the playground, download the add-on, install it, and get their first
          rewrite inside a real chat. Each of those steps is counted on the Story page, so you can see
          exactly which step is leaking.
        </p>
      </Section>

      <Section title="Oxygen and water">
        <p>
          <strong className="text-foreground">Oxygen</strong> numbers are the ones where a failure is fatal
          within a minute: the site being down, the download link broken, the add-on failing to write into a
          chat, prompts erroring out. If one of these goes red, drop everything.
        </p>
        <p>
          <strong className="text-foreground">Water</strong> numbers do not kill anything today, but if they
          dry up there is no growth and the end is a few weeks out: people not scrolling past the hero, not
          downloading, not coming back next week, never hitting the free ceiling.
        </p>
      </Section>

      <Section title="The three screens">
        <p>
          <strong className="text-foreground">Usage</strong> — the running product: volume, engines, speed,
          errors, cost, accounts.
        </p>
        <p>
          <strong className="text-foreground">Story</strong> — the landing page: how far people get, how long
          each part holds them, where they leave, and which parts actually push downloads.
        </p>
        <p>
          <strong className="text-foreground">Events</strong> — the dictionary: every signal collected, what
          it means, and which number it feeds.
        </p>
      </Section>

      <Section title="How to read the Story table">
        <p>
          <strong className="text-foreground">Reach</strong> — the share of visits that ever saw the section.
          Low reach means it is too far down.
        </p>
        <p>
          <strong className="text-foreground">Hold</strong> — the typical time it stayed on screen. Under a
          few seconds means it was scrolled past, not read.
        </p>
        <p>
          <strong className="text-foreground">Drop</strong> — the share of visits that ended there. High drop
          is where the story breaks.
        </p>
        <p>
          <strong className="text-foreground">Assist</strong> — how much more likely someone is to download
          after seeing this section versus the average visit. Positive means it is doing the selling; near
          zero means it is decoration.
        </p>
        <p>
          The <strong className="text-foreground">Read</strong> column turns those four into one instruction:
          move it up, rewrite it, it is losing people, it is the win, or leave it alone.
        </p>
      </Section>

      <Section title="What is never collected">
        <p>
          No prompt text, no output text, no free text of any kind, no names, no addresses. Devices are
          recorded as a one-way scramble, so the same device can be counted twice without ever being
          identified. Anyone with the browser &ldquo;do not track&rdquo; setting on is not counted at all.
        </p>
      </Section>
    </main>
  );
}
