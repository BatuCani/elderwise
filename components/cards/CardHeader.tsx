import type { ReactNode } from "react";

// The top of every non-warning card: small label with the time, icon and big headline.
export function CardHeader({ kicker, icon, headline }: { kicker: string; icon: ReactNode; headline: string }) {
  return (
    <>
      <p className="mb-3 text-base font-bold uppercase tracking-[0.08em] text-muted">{kicker}</p>
      <div className="flex items-start gap-3">
        {icon}
        <h2 className="font-serif text-3xl font-medium leading-tight">{headline}</h2>
      </div>
    </>
  );
}

export function CheckMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M7.5 12.5l3 3 6-6.5" />
    </svg>
  );
}
