export function PtknMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 70 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ptkn"
      role="img"
    >
      <text
        x="2"
        y="17"
        fontFamily='JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace'
        fontSize="16"
        fontWeight="600"
        fill="currentColor"
      >
        ptkn
      </text>
      {/* // trigger accent floating above the k */}
      <path d="M33 4 L37 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M37 4 L41 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
