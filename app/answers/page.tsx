"use client";

import { AnswerView, TypeIcon } from "@/components/AnswerView";
import { useAnswers } from "@/lib/answers";
import { useProfile } from "@/lib/profile";
import { LOCALE, speak, spokenText } from "@/lib/speech";
import { TEXT } from "../copy";

// Answers tab: newest answer as a big visual card, older ones as compact rows.
export default function AnswersPage() {
  const profile = useProfile();
  const t = TEXT[profile.lang];
  const [latest, ...older] = useAnswers();
  const time = (at: number) =>
    new Date(at).toLocaleString(LOCALE[profile.lang], { weekday: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-5 pb-28 pt-8">
      <h1 className="font-serif text-4xl font-medium text-ink">{t.tabAnswers}</h1>
      {!latest ? (
        <p className="text-xl leading-snug text-muted">{t.noAnswers}</p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-lg text-muted">
              {time(latest.at)} · “{latest.question}”
            </p>
            <AnswerView
              answer={latest.answer}
              t={t}
              phone={profile.trusted.phone}
              onReadAloud={() => speak(spokenText(latest.answer), profile.lang, profile.speechRate)}
            />
          </div>
          {older.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-bold text-muted">{t.earlier}</h2>
              {older.map((e) => (
                <button
                  key={e.id}
                  onClick={() => speak(spokenText(e.answer), profile.lang, profile.speechRate)}
                  className="flex min-h-16 items-center gap-4 rounded-[20px] bg-white px-4 py-3 text-left"
                >
                  <TypeIcon type={e.answer.type} className="h-7 w-7 shrink-0" />
                  <span className="flex-1 text-lg font-bold leading-snug text-ink">{e.answer.headline}</span>
                  <span className="shrink-0 text-base text-muted">{time(e.at)}</span>
                </button>
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}
