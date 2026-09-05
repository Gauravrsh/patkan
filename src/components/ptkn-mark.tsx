export function PtknMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 84 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ptkn"
      role="img"
    >
      {/* p */}
      <path d="M5 4V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="5" y="4" width="8" height="9" rx="1" stroke="currentColor" strokeWidth="2.5" />
      {/* t */}
      <path d="M24 3V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M19 8H29" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* k as the product's // trigger, redrawn as a single slash-letter glyph */}
      <path d="M38 4L44 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M44 4L50 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* n */}
      <path d="M59 4V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M59 4L67 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
