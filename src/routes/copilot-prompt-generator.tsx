import { createFileRoute } from "@tanstack/react-router";

import { PlatformGeneratorPage, platformHead } from "@/components/PlatformGeneratorPage";
import { faqLd, ldScript, organizationLd, pageLd, softwareLd } from "@/lib/seo";
import { content, DESCRIPTION, TITLE } from "@/lib/platform-pages/copilot";

const PATH = "/copilot-prompt-generator";

export const Route = createFileRoute("/copilot-prompt-generator")({
  head: () =>
    platformHead(
      PATH,
      TITLE,
      DESCRIPTION,
      ldScript([
        organizationLd,
        softwareLd,
        pageLd({ name: TITLE, path: PATH, description: DESCRIPTION, dateModified: "2026-10-21" }),
        faqLd(content.faqs),
      ]),
    ),
  component: () => <PlatformGeneratorPage c={content} />,
});
