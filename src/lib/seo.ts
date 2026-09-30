// Shared structured data (JSON-LD) so every page describes Patkan the same way.
export const SITE_URL = "https://patkan.in";
export const CWS_URL =
  "https://chromewebstore.google.com/detail/patkan-%E2%80%94-instant-expert-p/jcgkfecfliophjfnkokjnifcmalfbnnn";
export const GITHUB_URL = "https://github.com/Gauravrsh/patkan";

export const PATKAN_DEFINITION =
  "Patkan is a browser extension that turns a rough thought into a clear, well-structured prompt right inside ChatGPT, Gemini, Claude and other AI chats. Type your thought, end it with //, and Patkan rewrites it before the AI sees it.";

export const organizationLd = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Patkan",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon.png`,
  email: "contact@patkan.in",
  sameAs: [CWS_URL, GITHUB_URL],
};

export const softwareLd = {
  "@type": "SoftwareApplication",
  "@id": `${SITE_URL}/#software`,
  name: "Patkan",
  description: PATKAN_DEFINITION,
  applicationCategory: "BrowserApplication",
  applicationSubCategory: "Prompt generator",
  operatingSystem: "Chrome",
  url: `${SITE_URL}/`,
  downloadUrl: CWS_URL,
  installUrl: CWS_URL,
  license: "https://www.gnu.org/licenses/agpl-3.0.html",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  publisher: { "@id": `${SITE_URL}/#organization` },
};

export function ldScript(graph: object[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
  };
}

export function pageLd(opts: { name: string; path: string; description: string; dateModified: string }) {
  return {
    "@type": "WebPage",
    name: opts.name,
    url: `${SITE_URL}${opts.path}`,
    description: opts.description,
    dateModified: opts.dateModified,
    author: { "@id": `${SITE_URL}/#organization` },
    about: { "@id": `${SITE_URL}/#software` },
    isPartOf: { "@type": "WebSite", name: "Patkan", url: `${SITE_URL}/` },
  };
}
