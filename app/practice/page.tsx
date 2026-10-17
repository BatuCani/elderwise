"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckIcon, CloseIcon, NextIcon, RetryIcon } from "@/components/icons";
import { useProfile } from "@/lib/profile";
import { pickRound, QUIZ, type QuizQuestion } from "@/lib/quiz";

// The first round is fixed so the page renders the same on the server and in the browser;
// "Practice again" shuffles a new round.
const FIRST_ROUND = [0, 4, 7, 1, 5].map((i) => QUIZ[i]);

// Practice quiz: 5 questions, one per screen, with feedback after each answer and a score at the end.
export default function Practice() {
  const profile = useProfile();
  const [round, setRound] = useState<QuizQuestion[]>(FIRST_ROUND);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const done = index >= round.length;
  const q = round[Math.min(index, round.length - 1)];
  const right = chosen !== null && chosen === q.correct;

  function choose(i: number) {
    if (chosen !== null) return;
    setChosen(i);
    if (i === q.correct) setScore((s) => s + 1);
  }

  function next() {
    setChosen(null);
    setIndex((i) => i + 1);
  }

  function again() {
    setRound(pickRound());
    setIndex(0);
    setChosen(null);
    setScore(0);
  }

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-6 px-5 pb-40 pt-[calc(28px+env(safe-area-inset-top))]">
      <h1 className="font-serif text-4xl font-medium text-ink">Practice</h1>

      {done ? (
        <section className="answer-in flex flex-col gap-6">
          <div className="glass-moss flex flex-col gap-3 rounded-[28px] p-6">
            <p className="font-serif text-display font-medium leading-tight text-learn">
              {score} of {round.length}, {score >= round.length - 1 ? "well done" : "good practice"}, {profile.name}!
            </p>
            <p className="text-xl leading-snug text-ink">You practised these skills:</p>
            <ul className="flex flex-col gap-2">
              {[...new Set(round.map((r) => r.skill))].map((skill) => (
                <li key={skill} className="flex items-center gap-3 text-xl font-bold text-learn">
                  <CheckIcon className="h-6 w-6 shrink-0" />
                  {skill}
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={again}
            className="flex min-h-14 items-center justify-center gap-3 rounded-full bg-moss px-7 text-xl font-bold text-white"
          >
            <RetryIcon className="h-7 w-7" />
            Practice again
          </button>
          <Link href="/" className="glass flex min-h-14 items-center justify-center rounded-full px-7 text-xl font-bold text-moss">
            Back to Grace
          </Link>
        </section>
      ) : (
        <>
          {/* Progress capsule */}
          <div className="glass flex items-center gap-4 self-start rounded-full px-5 py-2">
            <span className="text-lg font-bold text-ink">
              {index + 1} of {round.length}
            </span>
            <span className="flex gap-1.5" aria-hidden>
              {round.map((_, i) => (
                <span key={i} className={`h-3 w-6 rounded-full ${i <= index ? "bg-moss" : "bg-line"}`} />
              ))}
            </span>
          </div>

          <section key={index} className="answer-in flex flex-col gap-5">
            <h2 className="font-serif text-asked font-medium leading-snug text-ink">{q.prompt}</h2>

            {q.message && (
              <p className="glass max-w-[90%] rounded-[24px] rounded-bl-md px-5 py-4 text-xl leading-snug text-ink">
                {q.message}
              </p>
            )}

            <div className={q.options.length === 2 ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
              {q.options.map((option, i) => {
                const isRight = chosen !== null && i === q.correct;
                const isWrong = chosen === i && i !== q.correct;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => choose(i)}
                    disabled={chosen !== null}
                    aria-pressed={chosen === i}
                    className={`flex min-h-16 items-center justify-center gap-2 rounded-[22px] px-5 py-3 text-center text-xl font-bold leading-snug transition-colors ${
                      isRight
                        ? "bg-moss text-white"
                        : isWrong
                          ? "bg-warn text-white"
                          : chosen !== null
                            ? "glass text-muted"
                            : "glass text-ink"
                    }`}
                  >
                    {isRight && <CheckIcon className="h-6 w-6 shrink-0" />}
                    {isWrong && <CloseIcon className="h-6 w-6 shrink-0" />}
                    {option}
                  </button>
                );
              })}
            </div>

            {chosen !== null && (
              <div
                role="status"
                className={`answer-in flex flex-col gap-2 rounded-[24px] p-5 ${right ? "glass-moss" : "bg-warn/10"}`}
              >
                <p className={`text-2xl font-bold ${right ? "text-learn" : "text-warn"}`}>
                  {right ? "Well done!" : "Not quite."}
                </p>
                <p className="text-xl leading-snug text-ink">{q.why}</p>
              </div>
            )}

            {chosen !== null && (
              <button
                type="button"
                onClick={next}
                className="answer-in flex min-h-14 items-center justify-center gap-3 rounded-full bg-moss px-7 text-xl font-bold text-white"
              >
                {index === round.length - 1 ? "See my result" : "Next"}
                <NextIcon className="h-7 w-7" />
              </button>
            )}
          </section>
        </>
      )}
    </main>
  );
}
