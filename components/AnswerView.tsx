import type { Copy } from "@/app/copy";
import type { Answer, AnswerType } from "@/prompts/elderwise";
import { AlertIcon, BookIcon, CalendarIcon, InfoIcon, ListIcon, PhoneIcon } from "./icons";

export function TypeIcon({ type, className }: { type: AnswerType; className?: string }) {
  if (type === "warning") return <AlertIcon className={`${className} text-warn`} />;
  if (type === "reminder") return <CalendarIcon className={`${className} text-moss`} />;
  if (type === "explain") return <BookIcon className={`${className} text-moss`} />;
  if (type === "steps") return <ListIcon className={`${className} text-moss`} />;
  return <InfoIcon className={`${className} text-moss`} />;
}

type Props = { answer: Answer; t: Copy; phone: string; time: string };

// One answer as a big visual card, then the "You learned" card.
export function AnswerView({ answer, t, phone, time }: Props) {
  const { type, headline, sentence, points, when, action } = answer;
  const warning = type === "warning";

  return (
    <section className="flex flex-col gap-3">
      <div className={`rounded-3xl p-6 ${warning ? "bg-warn text-white shadow-[0_16px_40px_rgba(142,36,36,0.35)]" : "bg-white text-ink"}`}>
        <p className={`mb-3 text-base font-bold uppercase tracking-[0.08em] ${warning ? "text-white/85" : "text-muted"}`}>
          {t.kinds[type]} · {time}
        </p>
        <div className="flex items-start gap-3">
          {warning ? <AlertIcon className="mt-1 h-9 w-9 shrink-0" /> : <TypeIcon type={type} className="mt-1 h-9 w-9 shrink-0" />}
          <h2 className="font-serif text-3xl font-medium leading-tight">{headline}</h2>
        </div>
        {type === "reminder" && when && (
          <p className="mt-4 flex items-center gap-2 rounded-2xl bg-paper px-4 py-3 text-xl font-bold text-moss">
            <CalendarIcon className="h-6 w-6 shrink-0" />
            {when}
          </p>
        )}
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
        {action && (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className={`mt-6 flex min-h-14 items-center justify-center gap-2 rounded-[28px] px-5 py-3 text-center text-lg font-bold ${
              warning ? "bg-white text-warn" : "bg-moss text-white"
            }`}
          >
            <PhoneIcon className="h-6 w-6 shrink-0" />
            {action.label}
          </a>
        )}
      </div>

      <div className="glass-moss rounded-3xl p-5 text-learn">
        <p className="text-lg font-bold">{t.learned}</p>
        <p className="mt-1 text-lg leading-snug">{answer.learned}</p>
        <p className="mt-2 text-lg leading-snug">{answer.tip}</p>
      </div>
    </section>
  );
}
