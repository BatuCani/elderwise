import { ListIcon } from "../icons";
import { CardHeader } from "./CardHeader";
import { CARD_TEXT } from "./labels";
import type { CardProps } from "./types";

// Step by step: every step in its own row with a big number, so someone can follow along.
export function StepsCard({ answer, kicker, lang }: CardProps) {
  const L = CARD_TEXT[lang];

  return (
    <>
      <CardHeader kicker={kicker} headline={answer.headline} icon={<ListIcon className="mt-1 h-9 w-9 shrink-0 text-moss" />} />
      <p className="mt-4 text-xl leading-snug">{answer.sentence}</p>
      {answer.points.length > 0 && (
        <ol className="mt-5 flex flex-col gap-3">
          {answer.points.map((p, i) => (
            <li key={i} className="flex min-h-16 items-center gap-4 rounded-2xl bg-paper p-4">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-moss font-serif text-2xl font-medium text-white"
              >
                {i + 1}
              </span>
              <span className="text-xl leading-snug text-ink">
                <span className="sr-only">
                  {L.step} {i + 1}:{" "}
                </span>
                {p}
              </span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
