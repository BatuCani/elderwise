"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { useMicrophone } from "voice-glow";
import { ChatInput } from "@/components/ChatInput";
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
  const greeting = t.greeting[useSyncExternalStore(noSubscribe, greetingKey, () => "morning" as const)];

  function setNewPhoto(src: string | null) {
    if (photo?.startsWith("blob:")) URL.revokeObjectURL(photo);
    setPhoto(src);
  }

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
      if (photo) body.append("image", await toJpeg(photo), "photo.jpg");
      const res = await fetch("/api/ask", { method: "POST", body });
      if (!res.ok) throw new Error(String(res.status));
      const answer: Answer = await res.json();
      addEntry(q || t.inputPlaceholder, answer);
      speak(spokenText(answer), profile.lang, profile.speechRate);
      setPhase("done");
      setQuestion("");
      setNewPhoto(null);
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

  const status =
    phase === "listening"
      ? question || t.listening
      : phase === "thinking"
        ? t.thinking
        : phase === "error"
          ? t.error
          : null;

  return (
    <>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 pb-56 pt-8">
        <p className="font-serif text-2xl font-medium text-moss">Elderwise</p>
        <div className="flex-1" />
        <p className="text-xl text-muted">
          {greeting}, {profile.name}
        </p>
        <h1 className="mt-2 font-serif text-[46px] font-medium leading-[1.05] text-ink">{t.headline}</h1>
        <p
          aria-live="polite"
          className={`mt-8 min-h-[4.5rem] text-2xl leading-snug ${phase === "error" ? "font-bold text-warn" : "text-ink"}`}
        >
          {status && (phase === "listening" && question ? `“${status}”` : status)}
        </p>
        <div className="flex-1" />
      </main>

      {phase === "done" && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-[calc(10rem+env(safe-area-inset-bottom))] z-30 mx-auto w-fit rounded-full bg-moss px-6 py-3 text-lg font-bold text-white shadow-lg"
        >
          ✓ {t.done}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-[calc(4.2rem+env(safe-area-inset-bottom))] z-10 px-4 pb-4">
        <div className="mx-auto max-w-xl">
          <ChatInput
            value={phase === "listening" ? "" : question}
            onChange={setQuestion}
            onSubmit={() => {
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
