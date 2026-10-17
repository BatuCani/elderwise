"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { useMicrophone, VoiceBeam } from "voice-glow";
import { CameraIcon, CheckIcon, MicIcon } from "@/components/icons";
import { VoiceBars } from "@/components/VoiceBars";
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

// While Claude is thinking, the glow gathers into one beam that sweeps back and forth.
function thinkingMotion() {
  return { gather: 1, offset: Math.sin(performance.now() / 600) * 0.8, heldLevel: 0.55, stretch: 0.3 };
}

// Talk tab: one big talk button. While listening: waveform, "Start camera" and "Done talking",
// and the voice glow along the bottom. Answers open on the Answers tab.
export default function Talk() {
  const router = useRouter();
  const profile = useProfile();
  const t = TEXT[profile.lang];
  const mic = useMicrophone();
  const [phase, setPhase] = useState<Phase>("idle");
  const [question, setQuestion] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const greeting = t.greeting[useSyncExternalStore(noSubscribe, greetingKey, () => "morning" as const)];
  const recRef = useRef<Recognition | null>(null);
  // Speech recognition stops after pauses; we keep restarting it until "Done talking",
  // so the text heard so far is kept in `baseRef` and the current run in `sessionRef`.
  const baseRef = useRef("");
  const sessionRef = useRef("");
  const photoRef = useRef<string | null>(null);
  const listeningRef = useRef(false);
  const finishingRef = useRef(false);

  function setNewPhoto(src: string | null) {
    if (photoRef.current?.startsWith("blob:")) URL.revokeObjectURL(photoRef.current);
    photoRef.current = src;
    setPhoto(src);
  }

  function heard() {
    return `${baseRef.current} ${sessionRef.current}`.trim();
  }

  async function ask(q: string, img: string | null) {
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
      if (img) body.append("image", await toJpeg(img), "photo.jpg");
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

  function finish() {
    listeningRef.current = false;
    mic.stop();
    const q = heard();
    if (q || photoRef.current) ask(q, photoRef.current);
    else setPhase("idle");
  }

  function startRecognition() {
    const Ctor = getRecognition();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = LOCALE[profile.lang];
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e) => {
      sessionRef.current = Array.from(e.results, (r) => r[0].transcript).join(" ");
      setQuestion(heard());
    };
    rec.onerror = (e?: { error?: string }) => {
      // No microphone permission: stop instead of restarting forever.
      if (e?.error === "not-allowed" || e?.error === "service-not-allowed") listeningRef.current = false;
    };
    rec.onend = () => {
      baseRef.current = heard();
      sessionRef.current = "";
      recRef.current = null;
      if (finishingRef.current) finish();
      else if (listeningRef.current) {
        try {
          startRecognition();
        } catch {
          // The camera may still hold the microphone; "Done talking" still works.
        }
      } else {
        mic.stop();
        setPhase("idle");
      }
    };
    recRef.current = rec;
    rec.start();
  }

  function onTalk() {
    unlockSpeech();
    if (!getRecognition()) {
      // No speech recognition in this browser (e.g. Firefox): typing is the fallback.
      const typed = window.prompt(t.inputPlaceholder)?.trim();
      if (typed) {
        setQuestion(typed);
        ask(typed, photoRef.current);
      }
      return;
    }
    mic.start();
    baseRef.current = "";
    sessionRef.current = "";
    listeningRef.current = true;
    finishingRef.current = false;
    setQuestion("");
    setNewPhoto(null);
    setPhase("listening");
    startRecognition();
  }

  function onFinish() {
    unlockSpeech();
    finishingRef.current = true;
    if (recRef.current) recRef.current.stop();
    else finish();
  }

  const listening = phase === "listening";
  const thinking = phase === "thinking";

  return (
    <>
      <main
        className={`relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-6 pt-8 text-center ${
          listening ? "pb-[calc(26px+4rem+9rem)]" : "pb-36"
        }`}
      >
        <p className="self-start font-serif text-2xl font-medium text-moss">Elderwise</p>
        <div className="flex-1" />

        {/* Status is only announced to screen readers; the start screen shows just the greeting. */}
        <p aria-live="polite" className="sr-only">
          {listening ? question || t.listening : thinking ? t.thinking : phase === "error" ? t.error : ""}
        </p>

        {listening ? (
          <>
            {photo && (
              <div className="mb-6 glass rounded-2xl p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt={t.photoAdded} className="h-20 w-20 rounded-xl object-cover" />
              </div>
            )}

            <div className="grid w-full max-w-sm grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label={t.startCamera}
                className="glass flex aspect-square items-center justify-center rounded-[32px] text-ink transition-transform active:scale-95"
              >
                <CameraIcon className="h-16 w-16" />
              </button>
              <button
                type="button"
                onClick={onFinish}
                aria-label={t.finishTalking}
                className="flex aspect-square items-center justify-center rounded-[32px] bg-moss text-white shadow-[0_14px_34px_rgba(63,90,58,0.35)] transition-transform active:scale-95"
              >
                <CheckIcon className="h-16 w-16" />
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xl text-muted">
              {greeting}, {profile.name}
            </p>
            <h1 className="mt-2 font-serif text-[46px] font-medium leading-[1.05] text-ink">{t.headline}</h1>
            <button
              type="button"
              onClick={onTalk}
              disabled={thinking}
              aria-label={t.mic}
              className={`mt-10 flex h-44 w-44 items-center justify-center rounded-full text-white shadow-[0_18px_40px_rgba(63,90,58,0.35)] transition-transform active:scale-95 disabled:animate-pulse disabled:opacity-60 ${
                phase === "error" ? "bg-warn" : "bg-moss"
              }`}
            >
              <MicIcon className="h-20 w-20" />
            </button>
          </>
        )}
        <div className="flex-1" />
      </main>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setNewPhoto(URL.createObjectURL(f));
          e.target.value = "";
        }}
      />

      {/* Right above the tab bar: the voice glow, and the waveform while listening. */}
      {(listening || thinking) && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-5 bottom-[calc(26px+4rem+0.75rem+env(safe-area-inset-bottom))] z-10 mx-auto max-w-xl"
        >
          <VoiceBeam
            type="mobile"
            stream={listening ? mic.stream : null}
            motion={thinking ? thinkingMotion : null}
            level={listening && !mic.stream ? 0.7 : undefined}
            sensitivity={listening ? 5 : undefined}
            reach={listening ? 1.6 : undefined}
            colorVariant="colorful"
            theme="light"
          >
            <div className="h-32 w-full rounded-[34px]" />
          </VoiceBeam>
          {listening && (
            <div className="absolute inset-x-0 bottom-3 z-10">
              <VoiceBars stream={mic.stream} />
            </div>
          )}
        </div>
      )}

      {phase === "done" && (
        <div
          role="status"
          aria-label={t.done}
          className="fixed inset-x-0 bottom-[calc(40px+5rem+env(safe-area-inset-bottom))] z-30 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-moss text-white shadow-lg"
        >
          <CheckIcon className="h-9 w-9" />
        </div>
      )}
    </>
  );
}
