"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackIcon } from "@/components/icons";
import { CameraStep } from "@/components/scan/CameraStep";
import { ChooseStep, type Example } from "@/components/scan/ChooseStep";
import { codeQuestion, describeCode, readCode, type Code, type Field, type ReadCode } from "@/components/scan/codes";
import { SCAN_TEXT } from "@/components/scan/copy";
import { DoneStep } from "@/components/scan/DoneStep";
import { ReadingStep } from "@/components/scan/ReadingStep";
import { addEntry } from "@/lib/answers";
import { askClaude } from "@/lib/ask";
import { useProfile } from "@/lib/profile";
import { speak, spokenText, unlockSpeech } from "@/lib/speech";
import type { Answer } from "@/prompts/elderwise";

type Step = "choose" | "camera-letter" | "camera-code" | "reading" | "done";
type Job = { image: string; read: ReadCode | null };

// Scan a letter or a code: choose, take the picture, watch it being read, see the key facts,
// then "Letter understood!" with the next step. The answer is also saved to Answers.
export default function ScanPage() {
  const router = useRouter();
  const profile = useProfile();
  const c = SCAN_TEXT[profile.lang];
  const [step, setStep] = useState<Step>("choose");
  const [job, setJob] = useState<Job | null>(null);
  const [result, setResult] = useState<{ answer: Answer; at: number } | null>(null);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState("");
  const runRef = useRef(0);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => void runRef.current++, []);

  const run = useCallback(
    async (next: Job) => {
      const id = ++runRef.current;
      setJob(next);
      setResult(null);
      setError(false);
      setNotice("");
      setStep("reading");
      window.scrollTo(0, 0);
      try {
        const question = next.read ? codeQuestion(next.read, profile.lang) : c.question;
        // A code is already decoded, so Claude gets the facts as text; a letter goes as a photo.
        const answer = await askClaude(question, next.read ? null : next.image, profile);
        if (id !== runRef.current) return;
        const at = Date.now();
        addEntry(next.read ? `${c.code}: ${next.read.code.text.slice(0, 80)}` : c.title, answer);
        setResult({ answer, at });
      } catch {
        if (id === runRef.current) setError(true);
      }
    },
    [c, profile],
  );

  const onCode = useCallback(
    (code: Code, image: string) => run({ image, read: describeCode(code, profile.lang) }),
    [run, profile.lang],
  );

  async function onExample(ex: Example) {
    unlockSpeech();
    if (!ex.code) return run({ image: ex.src, read: null });
    const blob = await (await fetch(ex.src)).blob();
    const code = await readCode(blob);
    if (code) onCode(code, ex.src);
    else setNotice(c.noCode);
  }

  function onUpload(file: File) {
    unlockSpeech();
    run({ image: URL.createObjectURL(file), read: null });
  }

  function onNext() {
    if (!result) return;
    setStep("done");
    window.scrollTo(0, 0);
    speak(spokenText(result.answer), profile.lang, profile.speechRate);
  }

  // Codes show what was decoded on the phone right away; Claude's key facts come in for letters.
  const fields: Field[] | null = job?.read
    ? result ? [...job.read.fields] : null
    : result ? result.answer.fields ?? [] : null;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-5 pb-40 pt-[calc(20px+env(safe-area-inset-top))]">
      <header className="flex items-center gap-3">
        {step === "choose" ? (
          <Link href="/" aria-label={c.back} className="glass flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-ink">
            <BackIcon className="h-6 w-6" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => {
              runRef.current++;
              setStep("choose");
            }}
            aria-label={c.back}
            className="glass flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-ink"
          >
            <BackIcon className="h-6 w-6" />
          </button>
        )}
        <p className="font-serif text-wordmark font-medium text-moss">{c.title}</p>
      </header>

      {notice && (
        <p role="status" className="glass rounded-2xl px-5 py-3 text-lg font-bold text-warn">
          {notice}
        </p>
      )}

      {step === "choose" && (
        <ChooseStep
          c={c}
          onUpload={onUpload}
          onPicture={() => {
            unlockSpeech();
            setStep("camera-letter");
          }}
          onCode={() => {
            unlockSpeech();
            setStep("camera-code");
          }}
          onExample={onExample}
        />
      )}

      {(step === "camera-letter" || step === "camera-code") && (
        <CameraStep
          c={c}
          mode={step === "camera-letter" ? "letter" : "code"}
          onClose={() => setStep("choose")}
          onPhoto={(image) => run({ image, read: null })}
          onCode={onCode}
          onUpload={() => uploadRef.current?.click()}
        />
      )}

      {step === "reading" && job && (
        <ReadingStep c={c} image={job.image} code={!!job.read} fields={fields} error={error} onNext={onNext} onRetry={() => run(job)} />
      )}

      {step === "done" && result && (
        <DoneStep c={c} answer={result.answer} at={result.at} code={!!job?.read} profile={profile} onContinue={() => router.push("/answers")} />
      )}

      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onUpload(f);
        }}
      />
    </main>
  );
}
