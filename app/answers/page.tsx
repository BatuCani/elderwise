"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { AnswerView, TypeIcon } from "@/components/AnswerView";
import { AnswerSkeleton, CARD_TEXT, ClearHistory, EmptyAnswers, friendlyTime, SpeakButtons, todayKey } from "@/components/cards";
import { BackIcon } from "@/components/icons";
import { useAnswers, usePending, type Entry } from "@/lib/answers";
import { useProfile } from "@/lib/profile";
import { LOCALE } from "@/lib/speech";
import { TEXT } from "../copy";

const noSubscribe = () => () => {};

// Answers tab: newest answer as a big visual card, older ones as rows.
// Tapping a row opens that answer full screen; "Clear history" sits at the very bottom.
export default function AnswersPage() {
  const profile = useProfile();
  const t = TEXT[profile.lang];
  const L = CARD_TEXT[profile.lang];
  const entries = useAnswers();
  const pending = usePending();
  const [latest, ...older] = entries;
  const today = useSyncExternalStore(noSubscribe, todayKey, () => "");
  const when = (at: number) => friendlyTime(at, today, LOCALE[profile.lang], L.yesterday);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? entries.find((e) => e.id === openId) ?? null : null;

  return (
    <>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-5 pb-40 pt-8">
        <h1 className="font-serif text-4xl font-medium text-ink">{t.tabAnswers}</h1>
        <Link
          href="/practice"
          className="flex min-h-14 items-center justify-center rounded-full bg-moss px-6 py-2 text-center text-lg font-bold leading-snug text-white"
        >
          Practice what you learned
        </Link>
        {pending && <AnswerSkeleton label={t.thinking} />}
        {!latest ? (
          !pending && <EmptyAnswers t={t} lang={profile.lang} />
        ) : (
          <>
            {/* Keyed by id: a new answer mounts fresh and rises in. */}
            <div key={latest.id} className="answer-in flex flex-col gap-3">
              <SpeakButtons answer={latest.answer} lang={profile.lang} rate={profile.speechRate} label={t.readAloud} />
              <AnswerView
                answer={latest.answer}
                t={t}
                phone={profile.trusted.phone}
                time={when(latest.at)}
                lang={profile.lang}
                at={latest.at}
              />
            </div>
            {older.length > 0 && (
              <section className="flex flex-col gap-2">
                <h2 className="text-lg font-bold text-muted">{L.earlier}</h2>
                {older.map((e, i) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setOpenId(e.id)}
                    style={{ animationDelay: `${60 + Math.min(i, 8) * 40}ms` }}
                    className="row-in flex min-h-16 items-center gap-4 glass rounded-[20px] px-4 py-3 text-left"
                  >
                    <TypeIcon type={e.answer.type} className="h-7 w-7 shrink-0" />
                    <span className="flex-1 text-lg font-bold leading-snug text-ink">{e.answer.headline}</span>
                    <span className="shrink-0 text-base text-muted">{when(e.at)}</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-6 w-6 shrink-0 text-muted"
                    >
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </section>
            )}
            <ClearHistory lang={profile.lang} />
          </>
        )}
      </main>

      {open && (
        <AnswerSheet
          entry={open}
          time={when(open.at)}
          onClose={() => setOpenId(null)}
          backLabel={L.back}
          readLabel={t.readAloud}
        />
      )}
    </>
  );
}

type SheetProps = { entry: Entry; time: string; onClose: () => void; backLabel: string; readLabel: string };

// One older answer, full screen over the list, with Back and Read aloud.
function AnswerSheet({ entry, time, onClose, backLabel, readLabel }: SheetProps) {
  const profile = useProfile();
  const t = TEXT[profile.lang];
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={entry.answer.headline}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      }}
      className="sheet-in fixed inset-0 z-40 overflow-y-auto bg-paper"
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-5 pb-16 pt-8">
        <button
          ref={backRef}
          type="button"
          onClick={onClose}
          className="glass flex min-h-12 items-center gap-2 self-start rounded-full px-5 text-lg font-bold text-ink"
        >
          <BackIcon className="h-6 w-6" />
          {backLabel}
        </button>
        <SpeakButtons answer={entry.answer} lang={profile.lang} rate={profile.speechRate} label={readLabel} />
        <AnswerView
          answer={entry.answer}
          t={t}
          phone={profile.trusted.phone}
          time={time}
          lang={profile.lang}
          at={entry.at}
        />
      </div>
    </div>
  );
}
