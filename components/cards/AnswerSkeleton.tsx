// Holds the newest answer's place while Claude is thinking: a glass card with softly shimmering lines,
// about as tall as a real answer so nothing jumps when it arrives.
export function AnswerSkeleton({ label }: { label: string }) {
  return (
    <section role="status" aria-label={label} className="answer-in glass flex min-h-[300px] flex-col gap-4 rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <span className="thinking-dot shrink-0" />
        <span className="text-base font-bold uppercase tracking-[0.08em] text-muted">{label}</span>
      </div>
      <div className="skeleton-line h-9 w-4/5" />
      <div className="skeleton-line h-9 w-3/5" />
      <div className="mt-2 skeleton-line h-6 w-full" />
      <div className="skeleton-line h-6 w-11/12" />
      <div className="skeleton-line h-6 w-2/3" />
    </section>
  );
}
