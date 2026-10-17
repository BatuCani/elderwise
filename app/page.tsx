"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useMicrophone } from "voice-glow";
import { ChatInput } from "@/components/ChatInput";
import { CheckIcon, RetryIcon } from "@/components/icons";
import { addEntry } from "@/lib/answers";
import { useProfile } from "@/lib/profile";
import { getRecognition, LOCALE, speak, spokenText, toJpeg, unlockSpeech, type Recognition } from "@/lib/speech";
import type { Answer } from "@/prompts/elderwise";
import { TEXT } from "./copy";

type Phase = "idle" | "listening" | "thinking" | "done" | "error";

const noSubscribe = () => () => {};

function greetingKey(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
}

// Talk tab: only the voice interface. Answers open on the Answers tab.
export default function Talk() {
  const router = useRouter();
  const profile = useProfile();
  const t = TEXT[profile.lang];
  const mic = useMicrophone();
  const [phase, setPhase] = useState<Phase>("idle");
  const [question, setQuestion] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const heardRef = useRef("");
  const busyRef = useRef(false);
  const doneTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [asked, setAsked] = useState("");
  const greeting = t.greeting[useSyncExternalStore(noSubscribe, greetingKey, () => "morning" as const)];

  // Leaving the Talk tab while the toast shows must not pull the person back to Answers later.
  useEffect(() => () => clearTimeout(doneTimer.current), []);

  function setNewPhoto(src: string | null) {
    if (photo?.startsWith("blob:")) URL.revokeObjectURL(photo);
    setPhoto(src);
  }

  async function ask(q: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    setAsked(q);
    setQuestion("");
    setPhase("thinking");
    try {
      const body = new FormData();
      body.append("lang", profile.lang);
      body.append("question", q);
      body.append("name", profile.name);
      body.append("trustedName", profile.trusted.name);
      body.append("trustedRelation", profile.trusted.relation);
      body.append(
        "today",
        new Date().toLocaleDateString(LOCALE[profile.lang], { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      );
      if (photo) body.append("image", await toJpeg(photo), "photo.jpg");
      const res = await fetch("/api/ask", { method: "POST", body });
      if (!res.ok) throw new Error(String(res.status));
      const answer: Answer = await res.json();
      addEntry(q || t.inputPlaceholder, answer);
      speak(spokenText(answer), profile.lang, profile.speechRate);
      setPhase("done");
      setNewPhoto(null);
      // Let the "Done" toast show for a moment, then open the answer while it is read aloud.
      doneTimer.current = setTimeout(() => router.push("/answers"), 1600);
    } catch {
      setPhase("error");
      speak(t.error, profile.lang, profile.speechRate);
    } finally {
      busyRef.current = false;
    }
  }

  function retry() {
    unlockSpeech();
    ask(asked);
  }

  function onMic() {
    unlockSpeech();
    if (phase === "listening") {
      recRef.current?.stop();
      return;
    }
    const Ctor = getRecognition();
    if (!Ctor) {
      // No speech recognition in this browser: typing is the fallback.
      document.querySelector<HTMLInputElement>("form input:not([type=file])")?.focus();
      return;
    }
    mic.start();
    const rec = new Ctor();
    rec.lang = LOCALE[profile.lang];
    rec.interimResults = true;
    rec.continuous = false;
    heardRef.current = "";
    rec.onresult = (e) => {
      heardRef.current = Array.from(e.results, (r) => r[0].transcript).join(" ");
      setQuestion(heardRef.current);
    };
    rec.onerror = () => setPhase("idle");
    rec.onend = () => {
      recRef.current = null;
      mic.stop();
      if (heardRef.current.trim() || photo) ask(heardRef.current);
      else setPhase("idle");
    };
    recRef.current = rec;
    setQuestion("");
    setPhase("listening");
    rec.start();
  }

  const talking = phase === "listening" || phase === "thinking";

  return (
    <>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 pb-56 pt-8">
        <p className="font-serif text-2xl font-medium text-moss">Elderwise</p>
        <div className="flex-1" />
        {talking ? (
          <div aria-live="polite">
            <p className="text-xl text-muted">{phase === "listening" ? t.listening : asked && t.youSaid}</p>
            {(phase === "listening" ? question : asked) && (
              <p
                className={`mt-3 font-serif font-medium leading-[1.12] text-ink ${
                  phase === "listening" ? "text-[40px]" : "text-[30px] text-ink/70"
                }`}
              >
                “{phase === "listening" ? question : asked}”
              </p>
            )}
            {phase === "thinking" && (
              <p className="mt-8 flex items-center gap-3 text-2xl text-moss">
                <span className="thinking-dot" aria-hidden />
                {t.thinking}
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="text-xl text-muted">
              {greeting}, {profile.name}
            </p>
            <h1 className="mt-2 font-serif text-[46px] font-medium leading-[1.05] text-ink">{t.headline}</h1>
            <div aria-live="polite" className="mt-8 min-h-[4.5rem]">
              {phase === "error" && (
                <>
                  <p className="text-2xl font-bold leading-snug text-warn">{t.error}</p>
                  <button
                    onClick={retry}
                    className="glass mt-5 flex min-h-14 items-center gap-3 rounded-full px-7 text-xl font-bold text-moss"
                  >
                    <RetryIcon className="h-7 w-7" />
                    {t.tryAgain}
                  </button>
                </>
              )}
            </div>
          </>
        )}
        <div className="flex-1" />
      </main>

      {phase === "done" && (
        <div
          role="status"
          className="toast-in glass fixed inset-x-0 bottom-[calc(40px+9rem+env(safe-area-inset-bottom))] z-30 mx-auto flex w-fit items-center gap-3 rounded-full py-2.5 pl-2.5 pr-6 text-xl font-bold text-ink"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-moss text-white">
            <CheckIcon className="h-6 w-6" />
          </span>
          {t.done}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-[calc(40px+4rem+env(safe-area-inset-bottom))] z-10 px-5">
        <div className="mx-auto max-w-xl">
          <ChatInput
            value={phase === "listening" ? "" : question}
            onChange={setQuestion}
            onSubmit={() => {
              if (!question.trim() && !photo) return;
              unlockSpeech();
              ask(question);
            }}
            onMic={onMic}
            onPhoto={(f) => setNewPhoto(URL.createObjectURL(f))}
            onRemovePhoto={() => setNewPhoto(null)}
            photo={photo}
            listening={phase === "listening"}
            thinking={phase === "thinking"}
            stream={mic.stream}
            t={t}
          />
        </div>
      </div>
    </>
  );
}
