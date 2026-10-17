import type { Ref } from "react";

// Claude's answer in very large text, followed by the "what you just did with AI" learning card.
export type Answer = { answer: string; learned: string; tip: string };

type Labels = { readAgain: string; learnedTitle: string; tipLabel: string };

export function AnswerCard({
  result,
  labels,
  onReadAgain,
  ref,
}: {
  result: Answer;
  labels: Labels;
  onReadAgain: () => void;
  ref?: Ref<HTMLElement>;
}) {
  return (
    <section ref={ref} aria-live="polite" className="flex scroll-mt-4 flex-col gap-4">
      <div className="rounded-3xl bg-black p-6 text-white">
        <p className="text-3xl font-semibold leading-snug">{result.answer}</p>
        <button onClick={onReadAgain} className="mt-5 min-h-14 rounded-2xl bg-white px-5 text-xl font-semibold text-black">
          🔊 {labels.readAgain}
        </button>
      </div>
      <div className="rounded-3xl border-4 border-amber-500 bg-amber-50 p-6">
        <h2 className="text-2xl font-bold">{labels.learnedTitle}</h2>
        <p className="mt-2 text-2xl leading-snug">{result.learned}</p>
        <p className="mt-4 text-2xl leading-snug">
          <span className="font-bold">{labels.tipLabel} </span>
          {result.tip}
        </p>
      </div>
    </section>
  );
}
