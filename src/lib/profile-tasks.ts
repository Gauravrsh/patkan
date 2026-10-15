/** Role → everyday tasks for the profile screen. Shared by the page and the transform API. */
export const OTHER_ROLE = "Other";

export const ROLE_TASKS: Record<string, string[]> = {
  "Chartered Accountant": [
    "Tax audit & statutory compliance notes",
    "Financial statement review & variance analysis",
    "Client tax advisory memos & responses",
    "GST / reconciliation query responses",
    "Ledger audits & book-close checklists",
    "Board & management financial presentations",
  ],
  "Content Writer": [
    "Blog posts & long-form articles",
    "Website & landing page copy",
    "Newsletters & email copy",
    "Editing & proofreading drafts",
    "Content briefs & outlines",
  ],
  "Corporate Lawyer": [
    "Commercial contract & NDA drafting",
    "Clause risk analysis & redlines",
    "Legal notices & response drafts",
    "Regulatory due diligence summaries",
    "Board resolutions & governance memos",
  ],
  "Customer Success Manager": [
    "Account health reviews & QBR decks",
    "Renewal & upsell emails",
    "Onboarding plans for new customers",
    "Escalation summaries for internal teams",
    "Customer feedback digests",
  ],
  "Customer Support Agent": [
    "Replies to customer tickets & complaints",
    "Help-centre articles & FAQs",
    "Escalation notes for other teams",
    "Refund & policy explanations",
    "Call and chat summaries",
  ],
  Doctor: [
    "Clinical case summaries & differential notes",
    "Patient discharge instructions & care plans",
    "Medical literature & clinical trial digests",
    "Referral letters & specialist handoffs",
  ],
  "Equity Research Analyst": [
    "Company & sector research notes",
    "Earnings call summaries",
    "Valuation model commentary",
    "Investment theses & rating rationales",
    "Client and fund-manager updates",
  ],
  "Executive Assistant": [
    "Emails on behalf of executives",
    "Meeting agendas & minutes",
    "Travel & calendar planning",
    "Briefing notes before meetings",
    "Internal announcements",
  ],
  "Financial Analyst": [
    "Budget & forecast commentary",
    "Variance analysis",
    "Management reporting packs",
    "Business case & investment memos",
    "Data analysis in spreadsheets",
  ],
  "HR Business Partner": [
    "Job descriptions",
    "Policy documents & employee FAQs",
    "Performance review guidance",
    "Employee relations case notes",
    "Internal HR announcements",
  ],
  "Insurance Advisor": [
    "Policy comparisons for clients",
    "Plain-language coverage explanations",
    "Client follow-up & renewal messages",
    "Claim support guidance",
    "Needs-assessment questions",
  ],
  Journalist: [
    "News stories & features",
    "Interview questions",
    "Fact-check & source summaries",
    "Headlines & story pitches",
    "Research digests on a beat",
  ],
  "Learning & Development Specialist": [
    "Training course outlines",
    "Workshop & session plans",
    "Quizzes & assessments",
    "Learning needs analysis",
    "Facilitator guides & handouts",
  ],
  "Litigation Advocate": [
    "Pleadings, petitions & replies",
    "Case-law research summaries",
    "Arguments & written submissions",
    "Client opinions & advice notes",
    "Hearing preparation notes",
  ],
  "Management Consultant": [
    "Client slide decks & storylines",
    "Market & competitor research",
    "Problem structuring & issue trees",
    "Interview guides & synthesis",
    "Executive summaries & recommendations",
  ],
  Marketing: [
    "Campaign plans & briefs",
    "Ad, email & social copy",
    "Landing page copy",
    "Campaign performance reports",
    "Customer & competitor research",
  ],
  "Non-profit Grant Writer": [
    "Grant proposals & applications",
    "Impact reports for funders",
    "Donor letters & appeals",
    "Programme budgets & narratives",
    "Funder research",
  ],
  "Operations Manager": [
    "Process documents & SOPs",
    "Operations reports & dashboards commentary",
    "Vendor emails & negotiations",
    "Shift, resource & capacity planning",
    "Incident & root-cause reviews",
  ],
  "PR Manager": [
    "Press releases",
    "Media pitches",
    "Crisis statements",
    "Spokesperson talking points",
    "Coverage reports",
  ],
  "Product Manager": [
    "Product requirement docs (PRDs) & feature specs",
    "User stories & acceptance criteria",
    "Sprint prioritization & trade-off memos",
    "Stakeholder updates & executive briefs",
    "Release notes & launch communications",
  ],
  "Project Manager": [
    "Project plans & timelines",
    "Status reports",
    "Risk & issue logs",
    "Meeting minutes & action items",
    "Stakeholder updates",
  ],
  "Real Estate Agent": [
    "Property listing descriptions",
    "Client follow-up messages",
    "Market comparison summaries",
    "Social media posts for listings",
    "Negotiation emails",
  ],
  Recruiter: [
    "Job descriptions & ads",
    "Candidate outreach messages",
    "Interview questions",
    "Candidate summaries for hiring managers",
    "Offer & rejection emails",
  ],
  "Sales Representative": [
    "Cold outreach emails & LinkedIn messages",
    "Discovery call recap & follow-up emails",
    "Enterprise deal proposals & pitch decks",
    "Objection handling scripts & competitor battlecards",
  ],
  "SEO Specialist": [
    "Keyword research",
    "Content briefs",
    "Meta titles & descriptions",
    "Site audit reports",
    "Competitor content analysis",
  ],
  "Small Business Owner": [
    "Customer emails & replies",
    "Social media posts",
    "Product & service descriptions",
    "Quotes, invoices & payment reminders",
    "Simple business plans",
  ],
  "Social Media Manager": [
    "Post captions & content calendars",
    "Replies to comments & messages",
    "Campaign ideas",
    "Short video scripts",
    "Performance reports",
  ],
  Teacher: [
    "Lesson plans",
    "Worksheets & question papers",
    "Messages to parents",
    "Student feedback & report comments",
    "Simple explanations of hard topics",
  ],
  "UX / Product Designer": [
    "Design briefs",
    "User research plans & synthesis",
    "Usability test scripts",
    "Design rationale for stakeholders",
    "Interface copy",
  ],
  "UX Writer": [
    "Interface copy & microcopy",
    "Error & empty-state messages",
    "Onboarding flows",
    "Voice & tone guidelines",
    "Copy options for A/B tests",
  ],
};

export const ROLES = Object.keys(ROLE_TASKS);

/** One short instruction the transform engine prepends. Never contains anything the user didn't choose. */
export function profileInstruction(p: {
  work_role: string | null;
  work_role_other: string | null;
  daily_tasks: string[] | null;
}): string | null {
  const role = p.work_role === OTHER_ROLE ? p.work_role_other?.trim() : p.work_role;
  if (!role) return null;
  const tasks = (p.daily_tasks ?? []).slice(0, 12).join("; ");
  return `The user works as a ${role.slice(0, 80)}.${tasks ? ` Their everyday work includes: ${tasks.slice(0, 600)}.` : ""} Use this only when it fits the request.`;
}
