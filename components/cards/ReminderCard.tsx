"use client";

import { LOCALE } from "@/lib/speech";
import { CalendarIcon } from "../icons";
import { CardHeader } from "./CardHeader";
import { downloadIcs } from "./ics";
import { CARD_TEXT } from "./labels";
import type { CardProps } from "./types";
import { parseWhen } from "./when";

// Reminder: a calendar block (weekday, day, month), the time large, the place, and "Add to calendar".
export function ReminderCard({ answer, kicker, lang, at }: CardProps) {
  const L = CARD_TEXT[lang];
  const locale = LOCALE[lang];
  const parsed = answer.when ? parseWhen(answer.when, new Date(at)) : null;

  return (
    <>
      <CardHeader kicker={kicker} headline={answer.headline} icon={<CalendarIcon className="mt-1 h-9 w-9 shrink-0 text-moss" />} />

      {parsed ? (
        <div className="mt-5 flex items-stretch gap-4">
          <div className="w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-moss bg-white text-center" aria-hidden="true">
            <p className="bg-moss py-1.5 text-base font-bold uppercase tracking-wide text-white">
              {parsed.date.toLocaleDateString(locale, { weekday: "short" })}
            </p>
            <p className="pt-1 font-serif text-5xl font-medium leading-tight text-ink">{parsed.date.getDate()}</p>
            <p className="pb-2 text-base font-bold text-ink">{parsed.date.toLocaleDateString(locale, { month: "short" })}</p>
          </div>
          <div className="flex min-w-0 flex-col justify-center gap-1">
            {parsed.hasTime && (
              <p className="font-serif text-4xl font-medium leading-tight text-ink">
                {parsed.date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })}
              </p>
            )}
            <p className="text-lg font-bold leading-snug text-ink">
              {parsed.date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" })}
            </p>
            {parsed.place && <p className="text-lg leading-snug text-ink">{parsed.place}</p>}
          </div>
        </div>
      ) : (
        answer.when && (
          <p className="mt-4 flex items-center gap-2 rounded-2xl bg-paper px-4 py-3 text-xl font-bold text-moss">
            <CalendarIcon className="h-6 w-6 shrink-0" />
            {answer.when}
          </p>
        )
      )}

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

      {parsed && (
        <button
          type="button"
          onClick={() =>
            downloadIcs({
              title: answer.headline,
              description: answer.sentence,
              place: parsed.place,
              start: parsed.date,
              hasTime: parsed.hasTime,
            })
          }
          className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-moss px-5 text-lg font-bold text-white"
        >
          <CalendarIcon className="h-6 w-6" />
          {L.addToCalendar}
        </button>
      )}
    </>
  );
}
