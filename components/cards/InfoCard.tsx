import { InfoIcon } from "../icons";
import { CardHeader } from "./CardHeader";
import type { CardProps } from "./types";

// Good to know: headline and sentence, plus any extra points as a simple list.
export function InfoCard({ answer, kicker }: CardProps) {
  return (
    <>
      <CardHeader kicker={kicker} headline={answer.headline} icon={<InfoIcon className="mt-1 h-9 w-9 shrink-0 text-moss" />} />
      <p className="mt-4 text-xl leading-snug">{answer.sentence}</p>
      {answer.points.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {answer.points.map((p, i) => (
            <li key={i} className="flex items-start gap-3 text-lg leading-snug">
              <span aria-hidden="true" className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-moss" />
              {p}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
