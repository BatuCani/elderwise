"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { SAMPLES, TEXT } from "./copy";

type Lang = "de" | "en";
type Phase = "idle" | "listening" | "thinking" | "answer" | "error";
type Answer = { answer: string; learned: string; tip: string };

// Minimal typing for the Web Speech API (not in TypeScript's DOM lib everywhere).
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionCtor = new () => Recognition;

function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Re-encode any picked image (camera JPEG, HEIC-as-JPEG, SVG sample) as a JPEG of sensible size.
async function toJpeg(src: string): Promise<Blob> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.85),
  );
}

function speak(text: string, lang: Lang) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang === "en" ? "en-US" : "de-DE";
  u.rate = 0.9;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(lang));
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("de");
  const [phase, setPhase] = useState<Phase>("idle");
  const [photo, setPhoto] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<Answer | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const heardRef = useRef("");
  const fileRef = useRef<HTMLInputElement>(null);
  const t = TEXT[lang];

  const canListen = useSyncExternalStore(
    () => () => {},
    () => getRecognition() !== null,
    () => false,
  );

  function pickFile(file: File | undefined) {
    if (!file) return;
    if (photo?.startsWith("blob:")) URL.revokeObjectURL(photo);
    setPhoto(URL.createObjectURL(file));
    setResult(null);
    setPhase("idle");
  }

  async function ask(q: string) {
    setPhase("thinking");
    setResult(null);
    try {
      const body = new FormData();
      body.append("lang", lang);
      body.append("question", q);
      if (photo) body.append("image", await toJpeg(photo), "photo.jpg");
      const res = await fetch("/api/ask", { method: "POST", body });
      if (!res.ok) throw new Error(String(res.status));
      const data: Answer = await res.json();
      setResult(data);
      setPhase("answer");
      speak(data.answer, lang);
    } catch {
      setPhase("error");
      speak(t.error, lang);
    }
  }

  function onOrb() {
    // Unlock speech output on iOS: it must start inside a user gesture.
    if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));

    if (phase === "listening") {
      recRef.current?.stop();
      return;
    }
    if (phase === "thinking") return;

    const Ctor = getRecognition();
    if (!Ctor) {
      ask(question);
      return;
    }
    const rec = new Ctor();
    rec.lang = lang === "en" ? "en-US" : "de-DE";
    rec.interimResults = true;
    rec.continuous = false;
    heardRef.current = "";
    rec.onresult = (e) => {
      const text = Array.from(e.results, (r) => r[0].transcript).join(" ");
      heardRef.current = text;
      setQuestion(text);
    };
    rec.onerror = () => setPhase("idle");
    rec.onend = () => {
      recRef.current = null;
      if (heardRef.current.trim() || photo) ask(heardRef.current);
      else setPhase("idle");
    };
    recRef.current = rec;
    setQuestion("");
    setPhase("listening");
    rec.start();
  }

  const orbLabel =
    phase === "listening" ? t.orbListening : phase === "thinking" ? t.orbThinking : canListen ? t.orbSpeak : t.orbAsk;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pb-10 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight">Orbs</h1>
        <button
          onClick={() => setLang(lang === "de" ? "en" : "de")}
          className="min-h-14 rounded-2xl border-2 border-black px-5 text-xl font-semibold"
          aria-label={t.langSwitchLabel}
        >
          {lang === "de" ? "English" : "Deutsch"}
        </button>
      </header>

      <p className="text-2xl leading-snug">{t.intro}</p>

      <section className="flex flex-col gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
        {photo ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt={t.photoAlt} className="max-h-72 w-full rounded-3xl border-4 border-black object-contain bg-white" />
            <button
              onClick={() => setPhoto(null)}
              className="absolute right-3 top-3 min-h-14 rounded-2xl bg-black px-5 text-xl font-semibold text-white"
            >
              {t.removePhoto}
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="min-h-20 rounded-3xl border-4 border-dashed border-black text-2xl font-semibold"
          >
            📷 {t.takePhoto}
          </button>
        )}
        <div className="flex flex-col gap-2">
          <span className="text-lg text-zinc-700">{t.samplesLabel}</span>
          <div className="grid grid-cols-3 gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s.src}
                onClick={() => {
                  setPhoto(s.src);
                  setResult(null);
                  setPhase("idle");
                }}
                className="min-h-16 rounded-2xl border-2 border-black bg-zinc-100 px-2 text-lg font-semibold leading-tight"
              >
                {s.label[lang]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center gap-4 py-2">
        <button
          onClick={onOrb}
          aria-label={orbLabel}
          className={`orb flex h-56 w-56 items-center justify-center rounded-full text-center text-3xl font-bold text-white ${
            phase === "listening" ? "orb-listening" : phase === "thinking" ? "orb-thinking" : ""
          }`}
        >
          <span className="px-6">{orbLabel}</span>
        </button>
        <form
          className="flex w-full gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t.typePlaceholder}
            className="min-h-16 min-w-0 flex-1 rounded-2xl border-2 border-black px-4 text-xl"
          />
          <button
            type="submit"
            disabled={phase === "thinking"}
            className="min-h-16 rounded-2xl bg-black px-5 text-xl font-semibold text-white disabled:opacity-40"
          >
            {t.send}
          </button>
        </form>
      </section>

      {phase === "error" && (
        <p role="alert" className="rounded-3xl border-4 border-red-700 bg-red-50 p-5 text-2xl font-semibold text-red-900">
          {t.error}
        </p>
      )}

      {result && (
        <section aria-live="polite" className="flex flex-col gap-4">
          <div className="rounded-3xl bg-black p-6 text-white">
            <p className="text-3xl font-semibold leading-snug">{result.answer}</p>
            <button
              onClick={() => speak(result.answer, lang)}
              className="mt-5 min-h-14 rounded-2xl bg-white px-5 text-xl font-semibold text-black"
            >
              🔊 {t.readAgain}
            </button>
          </div>
          <div className="rounded-3xl border-4 border-amber-500 bg-amber-50 p-6">
            <h2 className="text-2xl font-bold">{t.learnedTitle}</h2>
            <p className="mt-2 text-2xl leading-snug">{result.learned}</p>
            <p className="mt-4 text-2xl leading-snug">
              <span className="font-bold">{t.tipLabel} </span>
              {result.tip}
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
