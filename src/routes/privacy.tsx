import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import patkanMark from "@/assets/patkan-mark.svg";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy · Patkan" },
      {
        name: "description",
        content:
          "What Patkan collects, why, and what happens to it. A plain-language privacy policy for patkan.in and the official Patkan extension.",
      },
      { property: "og:title", content: "Privacy Policy · Patkan" },
      {
        property: "og:description",
        content:
          "What Patkan collects, why, and what happens to it. A plain-language privacy policy for patkan.in and the official Patkan extension.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://patkan.in/privacy" }],
  }),
  component: PrivacyPolicy,
});

const shell = "mx-auto w-full max-w-3xl px-5 sm:px-6 lg:px-8";

const sections: { heading: string; body: string[] }[] = [
  {
    heading: "Who we are",
    body: [
      "Patkan is built and run by Gaurav Sharma, a sole owner based in India. He is the person responsible for your personal data under this policy.",
      "You can reach him at contact@patkan.in. Our postal address is available on request — write to the same email and it will be sent to you.",
      "This policy covers patkan.in and the official Patkan browser extension published by us. It does not cover copies or forks of the open-source code run by anyone else — those operators are responsible for their own data practices.",
    ],
  },
  {
    heading: "The extension",
    body: [
      "The extension runs only on the AI sites listed in its manifest. It does not watch your browsing, read other tabs, or log your keystrokes anywhere else.",
      "When you finish a sentence with //, the extension reads the text of that input box and sends it to our server to be compiled into a structured prompt. The request carries a device identifier so daily limits can be enforced. If you are signed in, it also carries your sign-in token, so the transform is linked to your account.",
      "A small connector script on patkan.in passes your sign-in session to the extension when you are signed in there. That is how the extension and the website know you are the same person.",
      "The extension sends an event the first time it is installed or updated, so we can count installations. It includes a hashed device identifier and the extension version.",
    ],
  },
  {
    heading: "Prompt processing",
    body: [
      "Your prompt and the compiled output are processed on our server. To make repeated transforms faster, the full prompt text and its output are stored in a cache, in plain text, with no expiry.",
      "The cache is keyed on the exact input text and is not linked to your account. If another person submits the very same input text, they may be served the stored output. Do not enter sensitive personal data — passwords, health details, identity numbers, anything you would not paste into a public search box.",
      "Prompts are also logged as aggregate events (which engine was used, how long it took, whether it succeeded) so we can keep the service reliable.",
    ],
  },
  {
    heading: "Saved prompts",
    body: [
      "If you save a prompt to your library, its text is stored against your account so it is there the next time you sign in. You can delete any saved prompt, and deleting your account removes it.",
    ],
  },
  {
    heading: "Usage measurement",
    body: [
      "On this website, we record page and section views to understand what is useful — a browser identifier kept in your own browser, a session identifier, the page and section viewed, device type, and the site that referred you. No advertising trackers are involved.",
      "In the extension, we record events tied to a hashed device identifier — which AI site a transform happened on, which event occurred, and which version of the extension you run. This tells us what breaks and where to fix.",
      "We keep this measurement deliberately small: counts and coarse events, not your conversations.",
    ],
  },
  {
    heading: "Fair-use limits",
    body: [
      "To stop abuse of the free service, each device gets a daily transform limit. The count is keyed to a shortened hash of your IP address — an irreversible digest, not the address itself — but it can still be linked back to you with effort, so under the law we treat it as personal data.",
      "The counter resets each calendar day at midnight UTC, not on a rolling 24-hour window. The current limit is 50 transforms a day for signed-in use, and we may change that number as the service evolves.",
      "The hashed IP counters have no automatic expiry.",
    ],
  },
  {
    heading: "Accounts",
    body: [
      "Signing in with Google gives us your email address, and the name and photo Google attaches to your profile. Your account record also stores a display name, your usage tier, and a preference flag.",
      "We use your email only to identify your account, for support, and for service notices. We do not sell it and we do not run marketing lists on it.",
    ],
  },
  {
    heading: "AI providers",
    body: [
      "Compiling a prompt is our own code, but we pass your input text to third-party AI model providers whose models generate parts of the compiled prompt. Their handling of that text is governed by their own API terms, including their training and retention terms.",
      "These providers process data in India, the United States and other countries where they operate, so your prompt text may be transferred internationally.",
    ],
  },
  {
    heading: "Chrome Web Store Limited Use",
    body: [
      "Patkan's use of information received, and Patkan's use of other information received from localized applications, will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.",
      "In plain terms: the data the extension gathers is used only to run and improve Patkan's single purpose — turning your rough thought into a structured prompt — never for advertising, lending, or selling data.",
    ],
  },
  {
    heading: "Security",
    body: [
      "Everything travels encrypted in transit over HTTPS. The database uses row-level security so an account can only read its own rows.",
      "Patkan's source code is open — you can verify every claim in this policy against the code itself (see the open-source section below).",
      "If a breach of your personal data ever occurs, we will notify the affected users and the Data Protection Board of India within the timelines the law requires.",
    ],
  },
  {
    heading: "Legal basis (GDPR)",
    body: [
      "For users in the EU and UK: we process your prompt text to perform the service you asked for (contract). We count and hash IPs, and keep service telemetry, in our legitimate interest of keeping the service fair, secure and working. Website analytics run on your consent, which you can withdraw by clearing the site's browser identifier from your browser or asking us to do it.",
    ],
  },
  {
    heading: "Retention",
    body: [
      "We keep things simple and honest: most data — cached prompts, hashed-IP counters, telemetry — is kept until you ask us to delete it, because the code currently has no automatic deletion. Write to contact@patkan.in and we will erase what is linked to you. Prompts saved to your library are deleted when you delete them or your account.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "You can ask to see your data, correct it, delete it, restrict or object to its processing, or withdraw consent for analytics — write to contact@patkan.in and you will get a reply from a person, typically within 30 days.",
      "If you are in India, you may also nominate another person to exercise these rights on your behalf, and you can escalate a complaint to the Data Protection Board of India. If you are in the EU or UK, you can complain to your local supervisory authority.",
    ],
  },
  {
    heading: "Children",
    body: [
      "Patkan is not directed at children under 18, and we do not knowingly collect their personal data. If we learn that we have, we delete it.",
    ],
  },
  {
    heading: "Open source",
    body: [
      "Patkan's code is licensed under the GNU AGPL-3.0 and published at github.com/Gauravrsh/patkan. Anyone can read the code and check this policy against it — that transparency is the point.",
      "The licence covers the code, not the name or brand. And it covers the code only: running a modified copy as your own service makes you the data controller for that service, not us.",
    ],
  },
  {
    heading: "Changes and languages",
    body: [
      "This is version 1.0, last updated on 27 September 2026 — the first published version of this policy. If it changes, we will post the update here and change the date at the top.",
      "You can ask for this policy in any language listed in the Eighth Schedule of India's Constitution by emailing contact@patkan.in.",
    ],
  },
];

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className={`${shell} flex h-14 items-center justify-between gap-3 sm:h-16`}>
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <img
              src={patkanMark}
              alt="Patkan"
              width={816}
              height={816}
              className="size-8 shrink-0 rounded-[0.55rem] sm:size-9"
            />
            <span className="truncate text-lg font-semibold tracking-tight sm:text-xl">Patkan</span>
          </Link>
          <Link
            to="/"
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent sm:px-4"
          >
            Back to patkan.in <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </header>

      <main className="pb-20 sm:pb-24">
        <section className={`${shell} pt-14 sm:pt-20 lg:pt-24`}>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Privacy Policy</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            What we collect. What it does. Nothing more.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            This policy describes exactly what patkan.in and the official Patkan extension collect, why, and what
            happens to it. Patkan is open source, so every line here can be checked against the code.
          </p>
          <span className="mt-8 block h-px w-16 bg-primary" aria-hidden />
        </section>

        <div className={`${shell} mt-4 sm:mt-6`}>
          {sections.map(({ heading, body }, index) => (
            <section key={heading} className="border-b py-10 last:border-b-0 sm:py-12">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-sm tracking-widest text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{heading}</h2>
              </div>
              <div className="mt-5 space-y-4 pl-0 sm:pl-9">
                {body.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <section className="py-12">
            <div className="rounded-lg border bg-card p-6 sm:p-8">
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                Questions about any of this — a request to see, correct or delete your data — go to{" "}
                <a
                  href="mailto:contact@patkan.in"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  contact@patkan.in
                </a>
                . A person answers, not a queue.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t">
        <div className={`${shell} flex flex-wrap items-center justify-between gap-3 py-8 text-xs text-muted-foreground`}>
          <p>patkan.in</p>
          <nav className="flex flex-wrap items-center gap-4" aria-label="Site">
            <Link to="/chatgpt-prompt-generator" className="transition-colors hover:text-foreground">
              ChatGPT prompt generator
            </Link>
            <Link to="/claude-prompt-generator" className="transition-colors hover:text-foreground">
              Claude prompt generator
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
