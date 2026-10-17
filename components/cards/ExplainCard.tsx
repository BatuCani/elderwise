import { BookIcon } from "../icons";
import { CardHeader, CheckMark } from "./CardHeader";
import { CARD_TEXT } from "./labels";
import type { CardProps } from "./types";

// Explanation: the plain sentence large, then "What this means for you".
export function ExplainCard({ answer, kicker, lang }: CardProps) {
  const L = CARD_TEXT[lang];

  return (
    <>
      <CardHeader kicker={kicker} headline={answer.headline} icon={<BookIcon className="mt-1 h-9 w-9 shrink-0 text-moss" />} />
      <p className="mt-4 text-2xl leading-snug">{answer.sentence}</p>
      {answer.points.length > 0 && (
        <div className="mt-5 rounded-2xl bg-paper p-4">
          <p className="text-lg font-bold text-ink">{L.whatThisMeans}</p>
          <ul className="mt-3 flex flex-col gap-3">
            {answer.points.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckMark className="mt-0.5 h-7 w-7 shrink-0 text-moss" />
                <span className="text-xl leading-snug text-ink">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
