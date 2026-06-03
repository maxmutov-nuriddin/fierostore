import { cn } from "@/lib/utils";

export function FieroLogo({ className, markOnly }: { className?: string; markOnly?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width="18"
        height="26"
        viewBox="0 0 18 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer diamond — brand mark */}
        <path d="M9 0L18 9L9 26L0 9Z" fill="currentColor" />
        {/* Upper-left facet (lighter highlight) */}
        <path d="M9 0L0 9L9 7Z" fill="white" fillOpacity="0.18" />
        {/* Upper-right facet */}
        <path d="M9 0L18 9L9 7Z" fill="white" fillOpacity="0.08" />
        {/* Horizontal facet cut line */}
        <line x1="0" y1="9" x2="18" y2="9" stroke="white" strokeOpacity="0.22" strokeWidth="0.8" />
      </svg>
      {!markOnly && (
        <span className="text-[1.05rem] font-semibold uppercase tracking-[0.55em]">FIERO</span>
      )}
    </span>
  );
}
