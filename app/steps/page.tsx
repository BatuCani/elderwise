"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackIcon, CheckIcon, CloseIcon, MicIcon, NextIcon, SendIcon, SpeakerIcon } from "@/components/icons";
import { addEntry } from "@/lib/answers";
import { askElderwise } from "@/lib/ask";
import { useProfile } from "@/lib/profile";
import { clearFollowUp, followUpQuestion, getSolve, setFollowUp, setStep, setStuck, stepsOf, useSolve } from "@/lib/solve";
import { speak, spokenText, unlockSpeech } from "@/lib/speech";
import { TEXT } from "../copy";

// Steps page, opened after a question on Talk: a short explanation on top, then one step at a
// time with Back and Next. Stuck? The mic goes back to Talk (or type below); Claude's answer
// about that step then shows where the explanation was.
export default function Steps() {
  const router = useRouter();
  const profile = useProfile();
  const t = TEXT[profile.lang];
  const solve = useSolve();
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"idle" | "thinking" | "error">("idle");

  if (!solve) {
    return (
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center justify-center gap-6 px-6 pb-[calc(26px+4rem+2rem+env(safe-area-inset-bottom))] pt-[calc(28px+env(safe-area-inset-top))] text-center">
        <p className="font-serif text-asked font-medium text-ink">{t.noSteps}</p>
        <Link href="/" className="flex min-h-14 items-center gap-3 rounded-full bg-moss px-7 text-status font-bold text-white">
          <MicIcon className="h-7 w-7" />
          {t.goTalk}
        </Link>
      </main>
    );
  }

  const steps = stepsOf(solve.answer);
  const step = Math.min(solve.step, steps.length - 1);
  const last = step === steps.length - 1;
  const shown = solve.followUp?.answer ?? solve.answer;
  const warning = shown.type === "warning";

  function goStuck() {
    unlockSpeech();
    setStuck(true);
    router.push("/");
  }

  async function askTyped() {
    const q = typed.trim();
    const cur = getSolve();
    if (!q || !cur || phase === "thinking") return;
    unlockSpeech();
    setPhase("thinking");
    try {
      const answer = await askElderwise(followUpQuestion(cur, q), null, profile);
      setFollowUp(q, answer);
      addEntry(q, answer);
      setTyped("");
      setPhase("idle");
      speak(spokenText(answer), profile.lang, profile.speechRate);
    } catch {
      setPhase("error");
      speak(t.error, profile.lang, profile.speechRate);
    }
  }

  return (
    <>
      <main className="mx-auto flex h-svh w-full max-w-[480px] flex-col px-6 pb-[calc(26px+4rem+6.5rem+env(safe-area-inset-bottom))] pt-[calc(28px+env(safe-area-inset-top))]">
        <p className="shrink-0 font-serif text-wordmark font-medium text-moss">Elderwise</p>

        {/* Top: the quick explanation, or Claude's answer to "I'm stuck". */}
        <section aria-live="polite" className="mt-5 min-h-[4.5rem] overflow-y-auto">
          {phase === "thinking" ? (
            <p className="flex items-center gap-3 text-status text-moss">
              <span className="thinking-dot" aria-hidden />
              {t.thinking}
            </p>
          ) : phase === "error" ? (
            <p className="text-status font-bold leading-snug text-warn">{t.error}</p>
          ) : (
            <>
              {solve.followUp && (
                <div className="mb-1 flex items-start gap-2">
                  <p className="flex-1 text-greeting text-muted">“{solve.followUp.question}”</p>
                  <button
                    onClick={clearFollowUp}
                    aria-label={t.showExplanation}
                    className="-mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 text-muted"
                  >
                    <CloseIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
              <h1 className={`font-serif text-asked font-medium leading-tight ${warning ? "text-warn" : "text-ink"}`}>
                {shown.headline}
              </h1>
              <p className="mt-2 text-status leading-snug text-ink">{shown.sentence}</p>
              {solve.followUp && shown.points.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-status leading-snug text-ink">
                  {shown.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span aria-hidden className="text-moss">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

        {/* One step at a time. */}
        <section className="glass mt-5 shrink-0 rounded-[28px] p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-moss font-serif text-asked font-medium text-white">
              {step + 1}
            </span>
            <span className="flex-1 text-greeting font-bold text-muted">
              {t.step} {step + 1} {t.of} {steps.length}
            </span>
            <button
              onClick={() => speak(steps[step], profile.lang, profile.speechRate)}
              aria-label={t.readAloud}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-moss"
            >
              <SpeakerIcon className="h-6 w-6" />
            </button>
          </div>
          <p className="mt-4 min-h-[5.5rem] font-serif text-transcript font-medium leading-snug text-ink">{steps[step]}</p>

          {/* Progress dots */}
          <div aria-hidden className="mt-4 flex justify-center gap-2">
            {steps.map((_, i) => (
              <span key={i} className={`h-2.5 rounded-full transition-all ${i === step ? "w-6 bg-moss" : "w-2.5 bg-moss/25"}`} />
            ))}
          </div>
        </section>

        {/* Back, the mic (stuck on this step? go back to Talk and ask), Next. */}
        <div className="mt-4 grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            className="glass flex min-h-16 items-center justify-center gap-1.5 rounded-full text-status font-bold text-ink transition-transform active:scale-95 disabled:opacity-40"
          >
            <BackIcon className="h-6 w-6" />
            {t.back}
          </button>
          <button
            onClick={goStuck}
            disabled={phase === "thinking"}
            aria-label={t.stuck}
            className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-moss text-white shadow-[0_14px_34px_rgba(63,90,58,0.35)] transition-transform active:scale-95 disabled:opacity-50"
          >
            <MicIcon className="h-9 w-9" />
          </button>
          <button
            onClick={() => (last ? router.push("/") : setStep(step + 1))}
            className="flex min-h-16 items-center justify-center gap-1.5 rounded-full bg-moss text-status font-bold text-white shadow-[0_12px_30px_rgba(63,90,58,0.3)] transition-transform active:scale-95"
          >
            {last ? t.allDone : t.next}
            {last ? <CheckIcon className="h-6 w-6" /> : <NextIcon className="h-6 w-6" />}
          </button>
        </div>
      </main>

      {/* Or type the question, in the same bar as on Talk. */}
      <div className="fixed inset-x-5 bottom-[calc(26px+4rem+0.75rem+env(safe-area-inset-bottom))] z-20 mx-auto max-w-[440px]">
        <form
          className="glass flex min-h-[4.25rem] items-center gap-2 rounded-full p-2 pl-5"
          onSubmit={(e) => {
            e.preventDefault();
            askTyped();
          }}
        >
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={t.stuckType}
            aria-label={t.typeHere}
            enterKeyHint="send"
            disabled={phase === "thinking"}
            className="min-h-12 min-w-0 flex-1 bg-transparent text-status text-ink outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            disabled={!typed.trim() || phase === "thinking"}
            aria-label={t.send}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-moss text-white transition-opacity disabled:opacity-30"
          >
            <SendIcon className="h-7 w-7" />
          </button>
        </form>
      </div>
    </>
  );
}
