"use client";

import { AnswerView, TypeIcon } from "@/components/AnswerView";
import { SpeakerIcon } from "@/components/icons";
import { useAnswers } from "@/lib/answers";
import { useProfile } from "@/lib/profile";
import { LOCALE, speak, spokenText } from "@/lib/speech";
import { TEXT } from "../copy";

// Answers tab: newest answer as a big visual card, older ones as compact rows.
export default function AnswersPage() {
  const profile = useProfile();
  const t = TEXT[profile.lang];
  const [latest, ...older] = useAnswers();
  const clock = (at: number) => new Date(at).toLocaleTimeString(LOCALE[profile.lang], { hour: "numeric", minute: "2-digit" });

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-5 pb-[190px] pt-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl font-medium text-ink">{t.tabAnswers}</h1>
        {latest && (
          <button
            onClick={() => speak(spokenText(latest.answer), profile.lang, profile.speechRate)}
            className="glass flex min-h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 text-lg font-bold text-ink"
          >
            <SpeakerIcon className="h-6 w-6 text-moss" />
            {t.readAloud}
          </button>
        )}
      </header>
      {!latest ? (
        <p className="text-xl leading-snug text-muted">{t.noAnswers}</p>
      ) : (
        <>
          <AnswerView answer={latest.answer} t={t} phone={profile.trusted.phone} time={clock(latest.at)} />
          {older.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-bold text-muted">{t.earlier}</h2>
              {older.map((e) => (
                <button
                  key={e.id}
                  onClick={() => speak(spokenText(e.answer), profile.lang, profile.speechRate)}
                  className="flex min-h-16 items-center gap-4 glass rounded-[20px] px-4 py-3 text-left"
                >
                  <TypeIcon type={e.answer.type} className="h-7 w-7 shrink-0" />
                  <span className="flex-1 text-lg font-bold leading-snug text-ink">{e.answer.headline}</span>
                  <span className="shrink-0 text-base text-muted">{clock(e.at)}</span>
                </button>
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}
