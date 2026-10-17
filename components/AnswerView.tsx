import type { Copy } from "@/app/copy";
import type { Answer, AnswerType, Lang } from "@/prompts/elderwise";
import { CardBody } from "./cards";
import { AlertIcon, BookIcon, CalendarIcon, InfoIcon, ListIcon } from "./icons";
import { TellTrustedButton } from "./TellTrustedButton";

export function TypeIcon({ type, className }: { type: AnswerType; className?: string }) {
  if (type === "warning") return <AlertIcon className={`${className} text-warn`} />;
  if (type === "reminder") return <CalendarIcon className={`${className} text-moss`} />;
  if (type === "explain") return <BookIcon className={`${className} text-moss`} />;
  if (type === "steps") return <ListIcon className={`${className} text-moss`} />;
  return <InfoIcon className={`${className} text-moss`} />;
}

// phone is unused now (TellTrustedButton reads the trusted person from the profile); kept so callers don't change.
type Props = { answer: Answer; t: Copy; phone?: string; time: string; lang: Lang; at: number };

// One answer as a big visual card, then the "You learned" card.
// Warnings keep the red card below; every other type uses its own card from components/cards.
export function AnswerView({ answer, t, time, lang, at }: Props) {
  const { type, headline, sentence, points, action } = answer;
  const warning = type === "warning";

  return (
    <section className="flex flex-col gap-3">
      <div className={`rounded-3xl p-6 ${warning ? "bg-warn text-white shadow-[0_16px_40px_rgba(142,36,36,0.35)]" : "bg-white text-ink"}`}>
        {!warning ? (
          <CardBody answer={answer} kicker={`${t.kinds[type]} · ${time}`} lang={lang} at={at} />
        ) : (
        <>
        <p className={`mb-3 text-base font-bold uppercase tracking-[0.08em] ${warning ? "text-white/85" : "text-muted"}`}>
          {t.kinds[type]} · {time}
        </p>
        <div className="flex items-start gap-3">
          {warning ? <AlertIcon className="mt-1 h-9 w-9 shrink-0" /> : <TypeIcon type={type} className="mt-1 h-9 w-9 shrink-0" />}
          <h2 className="font-serif text-3xl font-medium leading-tight">{headline}</h2>
        </div>
        <p className="mt-4 text-xl leading-snug">{sentence}</p>
        {points.length > 0 && (
          <ol className="mt-5 flex flex-col gap-3">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                    warning ? "bg-white text-warn" : "bg-moss text-white"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="pt-1 text-lg leading-snug">{p}</span>
              </li>
            ))}
          </ol>
        )}
        </>
        )}
        {action && <TellTrustedButton answer={answer} label={action.label} warning={warning} />}
      </div>

      <div className="glass-moss rounded-3xl p-5 text-learn">
        <p className="text-lg font-bold">{t.learned}</p>
        <p className="mt-1 text-lg leading-snug">{answer.learned}</p>
        <p className="mt-2 text-lg leading-snug">{answer.tip}</p>
      </div>
    </section>
  );
}
