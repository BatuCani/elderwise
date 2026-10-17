"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { useMicrophone } from "voice-glow";
import { MicIcon, StopIcon } from "@/components/icons";
import { addEntry } from "@/lib/answers";
import { useProfile } from "@/lib/profile";
import { getRecognition, LOCALE, speak, spokenText, unlockSpeech, type Recognition } from "@/lib/speech";
import type { Answer } from "@/prompts/elderwise";
import { TEXT } from "./copy";

type Phase = "idle" | "listening" | "thinking" | "done" | "error";

const noSubscribe = () => () => {};

function greetingKey(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
}

// Talk tab: one big talk button in the middle of the screen. Answers open on the Answers tab.
export default function Talk() {
  const router = useRouter();
  const profile = useProfile();
  const t = TEXT[profile.lang];
  const mic = useMicrophone();
  const [phase, setPhase] = useState<Phase>("idle");
  const [question, setQuestion] = useState("");
  const recRef = useRef<Recognition | null>(null);
  const heardRef = useRef("");
  const greeting = t.greeting[useSyncExternalStore(noSubscribe, greetingKey, () => "morning" as const)];

  async function ask(q: string) {
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
      const res = await fetch("/api/ask", { method: "POST", body });
      if (!res.ok) throw new Error(String(res.status));
      const answer: Answer = await res.json();
      addEntry(q || t.inputPlaceholder, answer);
      speak(spokenText(answer), profile.lang, profile.speechRate);
      setPhase("done");
      setQuestion("");
      setTimeout(() => router.push("/answers"), 1200);
    } catch {
      setPhase("error");
      speak(t.error, profile.lang, profile.speechRate);
    }
  }

  function onMic() {
    unlockSpeech();
    if (phase === "listening") {
      recRef.current?.stop();
      return;
    }
    const Ctor = getRecognition();
    if (!Ctor) {
      // No speech recognition in this browser (e.g. Firefox): typing is the fallback.
      const typed = window.prompt(t.inputPlaceholder)?.trim();
      if (typed) {
        setQuestion(typed);
        ask(typed);
      }
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
      if (heardRef.current.trim()) ask(heardRef.current);
      else setPhase("idle");
    };
    recRef.current = rec;
    setQuestion("");
    setPhase("listening");
    rec.start();
  }

  const listening = phase === "listening";
  const thinking = phase === "thinking";
  const status = listening
    ? question
      ? `“${question}”`
      : t.listening
    : thinking
      ? t.thinking
      : phase === "error"
        ? t.error
        : t.tapToTalk;

  return (
    <>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-6 pb-36 pt-8 text-center">
        <p className="self-start font-serif text-2xl font-medium text-moss">Elderwise</p>
        <div className="flex-1" />
        <p className="text-xl text-muted">
          {greeting}, {profile.name}
        </p>

        <div className="relative mt-10 flex h-56 w-56 items-center justify-center">
          {(listening || thinking) && (
            <span
              aria-hidden
              className={`absolute inset-0 rounded-full bg-moss/25 ${listening ? "animate-ping" : "animate-pulse"}`}
            />
          )}
          <button
            type="button"
            onClick={onMic}
            disabled={thinking}
            aria-label={listening ? t.stopMic : t.mic}
            className="relative flex h-56 w-56 items-center justify-center rounded-full bg-moss text-white shadow-[0_18px_40px_rgba(63,90,58,0.35)] transition-transform active:scale-95 disabled:opacity-60"
          >
            {listening ? <StopIcon className="h-24 w-24" /> : <MicIcon className="h-24 w-24" />}
          </button>
        </div>

        <p
          aria-live="polite"
          className={`mt-10 min-h-[5rem] leading-snug ${
            listening && question
              ? "font-serif text-3xl font-medium text-moss"
              : phase === "error"
                ? "text-2xl font-bold text-warn"
                : "font-serif text-3xl font-medium text-ink"
          }`}
        >
          {status}
        </p>
        <div className="flex-1" />
      </main>

      {phase === "done" && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-[calc(40px+5rem+env(safe-area-inset-bottom))] z-30 mx-auto w-fit rounded-full bg-moss px-6 py-3 text-lg font-bold text-white shadow-lg"
        >
          ✓ {t.done}
        </div>
      )}
    </>
  );
}
