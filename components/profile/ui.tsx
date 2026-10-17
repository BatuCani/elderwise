import type { ReactNode } from "react";

// Shared look for the Profile tab: white cards with a hairline border on the cream canvas,
// and one serif header per section.
export const CARD =
  "rounded-[24px] border border-[#e6e1d6] bg-white shadow-[0_1px_2px_rgba(30,36,32,0.04),0_8px_24px_rgba(30,36,32,0.06)]";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 font-serif text-2xl font-medium text-ink">{title}</h2>
      {children}
    </section>
  );
}
