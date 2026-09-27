import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import patkanMark from "@/assets/patkan-mark.svg";

const DESC =
  "The terms that govern patkan.in and the official Patkan extension. Provided as is, used at your own risk, governed by the laws of India.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use · Patkan" },
      { name: "description", content: DESC },
      { property: "og:title", content: "Terms of Use · Patkan" },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://patkan.in/terms" }],
  }),
  component: TermsOfUse,
});

const shell = "mx-auto w-full max-w-3xl px-5 sm:px-6 lg:px-8";

const sections: { heading: string; body: string[] }[] = [
  {
    heading: "Agreement",
    body: [
      'These Terms of Use ("Terms") govern your use of the website patkan.in, the official Patkan browser extension, and every related feature, endpoint and output (together, the "Service"). The Service is operated by Gaurav Sharma, trading as Patkan ("Patkan", "we", "us"). By installing the extension, visiting the website, or using the Service in any way, you agree to these Terms and to our Privacy Policy at patkan.in/privacy, which forms part of these Terms. If you do not agree, do not use the Service.',
      "Under section 10A of the Information Technology Act, 2000, a contract formed by electronic means is not unenforceable merely because it was formed electronically.",
    ],
  },
  {
    heading: "What Patkan does",
    body: [
      "Patkan rewrites text you type into a more structured prompt for use with third-party AI tools. It sends your text to third-party AI models and returns a generated result. Patkan is a writing aid. It is not an AI assistant, an adviser or an agent, and it does not take actions on your behalf.",
    ],
  },
  {
    heading: "Eligibility",
    body: [
      'You must be legally capable of entering a binding contract in your country to accept these Terms. If you use the Service for an organisation, you confirm that you have authority to bind it, and "you" includes that organisation. The Service is not directed at children under 18. See the Privacy Policy.',
    ],
  },
  {
    heading: "Accounts",
    body: [
      "Some features, such as the Library, need you to sign in with a third-party provider like Google. You are responsible for all activity under your account and on your device. Tell us at contact@patkan.in if you suspect unauthorised use. We may suspend or delete any account at our discretion, including accounts that have been inactive for a long time.",
    ],
  },
  {
    heading: "Your content",
    body: [
      '"Your Content" means any text you enter and anything you save in the Library. You keep ownership of Your Content.',
      "You give us a worldwide, non-exclusive, royalty-free licence to host, process, cache, transmit and transform Your Content, only to operate, secure and improve the Service as described in the Privacy Policy. This includes sending it to third-party AI models and storing it in the response cache.",
      "You confirm that you have all the rights needed to submit Your Content, and that it does not break any law or anyone else's rights.",
      "Do not enter sensitive information. This includes passwords, financial or health data, government ID numbers, confidential business information, or other people's personal data. The Privacy Policy explains that prompts and outputs may be stored in a cache with no automatic expiry, and that an identical input may return the same output.",
      "You alone are fully responsible for everything you enter into Patkan. Patkan is only a conduit: it passes your text through automatically and does not decide what you submit. If you enter personal data, confidential information, or anything illegal, infringing or otherwise prohibited, you do so entirely at your own risk, and Patkan has no liability for it to you or to anyone else.",
      "We do not review Your Content before processing it, and we have no obligation to monitor it.",
    ],
  },
  {
    heading: "Outputs",
    body: [
      "Outputs are generated automatically by third-party AI models. They may be inaccurate, incomplete, biased, offensive, or similar to outputs given to other people.",
      "You are solely responsible for reviewing an output before you use it, and for any use you make of it. Outputs are not legal, medical, financial, tax or other professional advice.",
      "To the extent we hold any rights in an output, we assign them to you. We do not promise that outputs are original, can be protected by copyright, or do not infringe anyone's rights.",
    ],
  },
  {
    heading: "Acceptable use",
    body: [
      "You must not, and must not help anyone else to: (1) use the Service for any unlawful, fraudulent, harassing, defamatory, obscene or harmful purpose, or in breach of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021; (2) generate content that sexualises minors, promotes terrorism or violence, or infringes intellectual property; (3) get around rate limits, quotas or access controls, including by rotating devices, IP addresses or accounts; (4) scrape, resell, sublicense or offer the official hosted Service or its endpoints as an API; (5) overload, probe, reverse engineer, attack or disrupt the Service or its infrastructure (the published source code under section 12 is excepted); (6) use the Service to break the terms of any AI provider or website you use it with; (7) pretend to be Patkan, or suggest that we endorse you.",
      "We may block, rate-limit, suspend or terminate access at any time and without notice if we believe you have broken this section.",
    ],
  },
  {
    heading: "Free service, limits and changes",
    body: [
      "The Service is currently free of charge. We may add paid features later, under separate terms. Usage is subject to daily limits that we set and can change at any time.",
      "We may change, pause, restrict or discontinue any part of the Service, including support for any AI tool or website, at any time and without liability. Third-party websites such as AI chat tools may change in ways that stop the extension from working. This is not a fault of the Service.",
    ],
  },
  {
    heading: "Third-party services",
    body: [
      "The Service depends on third parties, including AI model providers, hosting, database, sign-in providers, browser platforms and the websites where you use the extension. Their services are governed by their own terms. We are not responsible for their availability, conduct, outputs, data handling, or any change they make.",
    ],
  },
  {
    heading: "No warranty",
    body: [
      'THE SERVICE AND ALL OUTPUTS ARE PROVIDED "AS IS" AND "AS AVAILABLE", WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND. TO THE FULLEST EXTENT ALLOWED BY LAW, WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED OR STATUTORY. THIS INCLUDES MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY, AND UNINTERRUPTED, SECURE OR ERROR-FREE OPERATION. YOU USE THE SERVICE ENTIRELY AT YOUR OWN RISK. NOTHING WE SAY, AND NO MARKETING COPY, CREATES ANY WARRANTY.',
    ],
  },
  {
    heading: "Limitation of liability",
    body: [
      "TO THE FULLEST EXTENT ALLOWED BY LAW: (a) WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, REVENUE, DATA, GOODWILL, BUSINESS OR OPPORTUNITY, HOWEVER CAUSED AND EVEN IF WE WERE WARNED OF THE POSSIBILITY; (b) OUR TOTAL LIABILITY FOR ALL CLAIMS ARISING FROM OR RELATING TO THE SERVICE OR THESE TERMS IS LIMITED TO THE GREATER OF (i) THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM, AND (ii) INR 1,000 (ONE THOUSAND RUPEES); (c) THESE LIMITS APPLY TO EVERY THEORY OF LIABILITY, INCLUDING CONTRACT, TORT (INCLUDING NEGLIGENCE), STATUTE AND ANY OTHER BASIS.",
      "Nothing in these Terms limits liability that cannot be limited by law, such as liability for fraud or wilful misconduct, or your non-waivable rights as a consumer.",
    ],
  },
  {
    heading: "Open-source code and trademark",
    body: [
      'The Patkan source code is published at https://github.com/Gauravrsh/patkan under the GNU Affero General Public License v3.0 ("AGPL"). Your use of the source code is governed by the AGPL, including its own disclaimer of warranty and limitation of liability (AGPL sections 15 and 16). These Terms govern the official hosted Service and the official extension.',
      "The AGPL does not grant any right to the Patkan name, logo or brand. These are covered by TRADEMARK.md in the repository. Anyone running a modified or self-hosted copy is solely responsible for that copy, including their own data protection obligations. We are not liable for any fork.",
    ],
  },
  {
    heading: "Indemnity",
    body: [
      "You agree to defend, indemnify and hold harmless Patkan and Gaurav Sharma, together with any successor entity and its agents, from all claims, losses, liabilities, damages, penalties, costs and expenses, including reasonable legal fees, arising from: (a) Your Content; (b) your use of outputs; (c) your breach of these Terms or of any law; or (d) your infringement of anyone else's rights.",
    ],
  },
  {
    heading: "Termination",
    body: [
      "You may stop using the Service at any time by uninstalling the extension and, if you have an account, asking us to delete it. We may suspend or terminate your access at any time, for any reason or none. Sections 5 (licence, to the extent needed for cached data), 6 and 9 to 17 survive termination.",
    ],
  },
  {
    heading: "Governing law and disputes",
    body: [
      "These Terms are governed by the laws of India, without regard to conflict-of-law rules. Before starting any formal claim, you agree to contact contact@patkan.in and try in good faith to resolve the dispute for 30 days.",
      "Any dispute that is not resolved will be referred to arbitration by a sole arbitrator appointed by Patkan, under the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration will be Pune, India, and the language will be English. Subject to this, the courts at Pune have exclusive jurisdiction.",
      "You must bring any claim within one year after it arises, or it is permanently barred, to the extent the law allows. If mandatory law where you live gives you the right to bring a claim in your local courts, this section does not remove that right.",
    ],
  },
  {
    heading: "Grievance officer",
    body: [
      "Under the Information Technology Act, 2000 and the rules made under it, complaints about content or use of the Service can be sent to the Grievance Officer, Patkan, at contact@patkan.in. We will acknowledge complaints within 24 hours and aim to resolve them within 15 days. Privacy complaints are handled as set out in the Privacy Policy.",
    ],
  },
  {
    heading: "General",
    body: [
      "Entire agreement: these Terms and the Privacy Policy are the entire agreement between you and us about the Service.",
      "Changes: we may update these Terms. The new version applies from the date it is posted here. If you continue to use the Service after that date, you accept the new version.",
      "Severability: if any provision is held invalid, it will be enforced to the maximum extent allowed and the rest of the Terms stay in effect. No waiver: if we do not enforce a right, we have not waived it.",
      "Assignment: you may not transfer these Terms to anyone else. We may assign them, including to a company we form to operate Patkan, and you consent to that assignment in advance.",
      "Force majeure: we are not liable for any failure caused by events beyond our reasonable control, including outages at third-party providers. No relationship: these Terms do not create any partnership, agency or employment relationship. Language: the English version is the one that governs.",
    ],
  },
];

function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className={`${shell} flex h-14 items-center justify-between gap-3 sm:h-16`}>
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <img src={patkanMark} alt="Patkan" width={816} height={816} className="size-8 shrink-0 rounded-[0.55rem] sm:size-9" />
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
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Terms of Use</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Provided as is. Used at your own risk.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Version 1.0 · Effective 27 September 2026 · Last updated 27 September 2026. Also read our{" "}
            <Link to="/privacy" className="font-medium text-foreground underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            .
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
                Questions about these Terms go to{" "}
                <a href="mailto:contact@patkan.in" className="font-medium text-foreground underline-offset-4 hover:underline">
                  contact@patkan.in
                </a>
                .
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t">
        <div className={`${shell} flex flex-wrap items-center justify-between gap-3 py-8 text-xs text-muted-foreground`}>
          <p>patkan.in</p>
          <nav className="flex flex-wrap items-center gap-4" aria-label="Site">
            <Link to="/privacy" className="transition-colors hover:text-foreground">Privacy Policy</Link>
            <Link to="/chatgpt-prompt-generator" className="transition-colors hover:text-foreground">ChatGPT prompt generator</Link>
            <Link to="/claude-prompt-generator" className="transition-colors hover:text-foreground">Claude prompt generator</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
