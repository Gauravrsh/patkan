export const PRIMARY_DOMAINS = [
  "Legal & Compliance",
  "Finance, Tax & Audit",
  "Healthcare & Medical",
  "Operations, HR & People",
  "Sales & Marketing",
  "Executive & Consulting",
  "Other",
] as const;

export const DEFAULT_NEXT = "/#playground";

/** Only same-site paths; rejects protocol-relative and absolute URLs. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return DEFAULT_NEXT;
  return value;
}

/** Every successful sign-in passes through profile setup, which forwards if already done. */
export function setupProfileUrl(next: string): string {
  return `/setup-profile?next=${encodeURIComponent(safeNextPath(next))}`;
}
