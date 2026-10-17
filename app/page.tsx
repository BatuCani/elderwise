"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useMicrophone, VoiceBeam } from "voice-glow";
import { CameraIcon, CheckIcon, MicIcon, RetryIcon, SendIcon } from "@/components/icons";
import { PhotoSheet } from "@/components/PhotoSheet";
import { VoiceBars } from "@/components/VoiceBars";
import { addEntry } from "@/lib/answers";
import { askClaude } from "@/lib/ask";
import { liveLevel, liveSupported, startLive, stopLive, useLive } from "@/lib/live";
import { useProfile } from "@/lib/profile";
import { getRecognition, LOCALE, speak, spokenText, unlockSpeech, type Recognition } from "@/lib/speech";
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
  const typeRef = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const greeting = t.greeting[useSyncExternalStore(noSubscribe, greetingKey, () => "morning" as const)];
  const recRef = useRef<Recognition | null>(null);
  // Speech recognition stops after pauses; we keep restarting it until "Done talking",
  // so the text heard so far is kept in `baseRef` and the current run in `sessionRef`.
  const baseRef = useRef("");
  const sessionRef = useRef("");
  const photoRef = useRef<string | null>(null);
  const listeningRef = useRef(false);
  const finishingRef = useRef(false);
  const busyRef = useRef(false);
  const doneTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [asked, setAsked] = useState<{ q: string; img: string | null }>({ q: "", img: null });
  const live = useLive();
  const liveOn = live.status !== "idle";
  const liveFailed = useRef(false);

  // Leaving the Talk tab (Next keeps it alive, hidden) clears the toast and must not pull the
  // person back to Answers later.
  useEffect(
    () => () => {
      clearTimeout(doneTimer.current);
      setPhase((p) => (p === "done" ? "idle" : p));
    },
    [],
  );

  function setNewPhoto(src: string | null) {
    if (photoRef.current?.startsWith("blob:")) URL.revokeObjectURL(photoRef.current);
    photoRef.current = src;
    setPhoto(src);
  }

  function heard() {
    return `${baseRef.current} ${sessionRef.current}`.trim();
  }

  async function ask(q: string, img: string | null) {
    if (busyRef.current) return;
    busyRef.current = true;
    setAsked({ q, img });
    setPhase("thinking");
    try {
      const answer = await askClaude(q, img, profile);
      addEntry(q || t.inputPlaceholder, answer);
      speak(spokenText(answer), profile.lang, profile.speechRate);
      setPhase("done");
      setQuestion("");
      setNewPhoto(null);
      // Let the "Done" toast show for a moment, then open the answer while it is read aloud.
      doneTimer.current = setTimeout(() => router.push("/answers"), 1500);
    } catch {
      setPhase("error");
      speak(t.error, profile.lang, profile.speechRate);
    } finally {
      busyRef.current = false;
    }
  }

  function retry() {
    unlockSpeech();
    ask(asked.q, asked.img);
  }

  function finish() {
    listeningRef.current = false;
    mic.stop();
    const q = heard();
    if (q || photoRef.current) ask(q, photoRef.current);
    else setPhase("idle");
  }

  // Hands-free conversation: Gemini Live listens and speaks, Claude answers through the tool.
  async function startConversation() {
    try {
      await startLive({
        lang: profile.lang,
        name: profile.name,
        ask: async (q) => {
          const answer = await askClaude(q, photoRef.current, profile);
          addEntry(q, answer);
          setNewPhoto(null);
          setPhase("done");
          doneTimer.current = setTimeout(() => router.push("/answers"), 1600);
          return answer;
        },
      });
    } catch (err) {
      console.warn("Live conversation unavailable, using push-to-talk:", err);
      liveFailed.current = true;
      startPushToTalk();
    }
  }

  // Fallback: the browser's own speech recognition, restarted until "Done talking".
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

  function startPushToTalk() {
    if (!getRecognition()) {
      // No speech recognition in this browser (e.g. Firefox): typing is the fallback.
      typeRef.current?.focus();
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

  function onSendTyped() {
    const q = typed.trim();
    if (!q) return;
    unlockSpeech();
    setTyped("");
    typeRef.current?.blur();
    ask(q, null);
  }

  function onTalk() {
    unlockSpeech();
    setPhase("idle");
    if (liveSupported() && !liveFailed.current) startConversation();
    else startPushToTalk();
  }

  function onFinish() {
    unlockSpeech();
    if (liveOn) {
      stopLive();
      setPhase("idle");
      return;
    }
    finishingRef.current = true;
    if (recRef.current) recRef.current.stop();
    else finish();
  }

  const listening = phase === "listening";
  const thinking = phase === "thinking" || live.status === "thinking";
  const handsFree = liveOn && live.status !== "connecting";
  // Live conversation text: what was heard while listening, what Claude's answer sounds like while speaking.
  const liveText = live.status === "speaking" ? live.said : live.heard;

  return (
    <>
      <main
        className="relative z-10 mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-6 pt-[calc(28px+env(safe-area-inset-top))] pb-[calc(26px+4rem+6.5rem+env(safe-area-inset-bottom))] text-center"
      >
        <p className="self-start font-serif text-wordmark font-medium text-moss">Elderwise</p>
        <div className="flex-1" />

        {/* Status is only announced to screen readers; the start screen shows just the greeting. */}
        <p aria-live="polite" className="sr-only">
          {liveOn ? liveText || t.listening : listening ? question || t.listening : thinking ? t.thinking : phase === "error" ? t.error : ""}
        </p>

        {listening || liveOn ? (
          <>
            {liveOn && (
              <div className="mb-8">
                <p className="text-xl text-muted">
                  {live.status === "connecting" ? t.liveConnecting : live.status === "speaking" ? t.liveSays : live.status === "thinking" ? t.youSaid : t.listening}
                </p>
                {liveText && (
                  <p
                    className={`mt-3 font-serif font-medium leading-[1.12] ${
                      live.status === "listening" ? "text-[40px] text-ink" : live.status === "speaking" ? "text-[30px] text-moss" : "text-[30px] text-ink/70"
                    }`}
                  >
                    {live.status === "speaking" ? liveText : `“${liveText}”`}
                  </p>
                )}
              </div>
            )}
            {photo && (
              <div className="mb-6 glass rounded-2xl p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt={t.photoAdded} className="h-20 w-20 rounded-xl object-cover" />
              </div>
            )}

            <div className="grid w-full max-w-sm grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
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
            <p className="text-greeting text-muted">
              {greeting}, {profile.name}
            </p>
            <h1 className="mt-2 font-serif text-display font-medium leading-[1.05] text-ink">{t.headline}</h1>
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
            {phase === "error" && (
              <button
                onClick={retry}
                className="glass mt-8 flex min-h-14 items-center gap-3 rounded-full px-7 text-status font-bold text-moss"
              >
                <RetryIcon className="h-7 w-7" />
                {t.tryAgain}
              </button>
            )}

          </>
        )}
        <div className="flex-1" />
      </main>

      {/* Take a photo, choose one, or try a demo image. */}
      <PhotoSheet
        open={sheetOpen}
        lang={profile.lang}
        onClose={() => setSheetOpen(false)}
        onFile={(f) => setNewPhoto(URL.createObjectURL(f))}
      />

      {/* The bar right above the tab bar: type a question here, or see the waveform while listening. */}
      <div className="fixed inset-x-5 bottom-[calc(26px+4rem+0.75rem+env(safe-area-inset-bottom))] z-20 mx-auto max-w-[440px]">
        <VoiceBeam
          type="mobile"
          stream={listening ? mic.stream : null}
          motion={thinking ? thinkingMotion : null}
          level={liveOn ? liveLevel : listening && !mic.stream ? 0.7 : undefined}
          idle={listening || thinking || liveOn ? undefined : 0}
          sensitivity={listening ? 5 : undefined}
          reach={listening ? 1.8 : undefined}
          colorVariant="colorful"
          theme="light"
        >
          <form
            className="glass flex min-h-[4.25rem] items-center gap-2 rounded-full p-2 pl-5"
            onSubmit={(e) => {
              e.preventDefault();
              onSendTyped();
            }}
          >
            {liveOn ? (
              <p className="min-h-12 flex-1 pr-3 text-left text-status leading-[3rem] font-bold text-moss">{t.liveActive}</p>
            ) : listening ? (
              <div className="flex-1 pr-3">
                <VoiceBars stream={mic.stream} className="h-12" />
              </div>
            ) : (
              <>
                <input
                  ref={typeRef}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={t.typeHere}
                  aria-label={t.typeHere}
                  enterKeyHint="send"
                  disabled={thinking}
                  className="min-h-12 min-w-0 flex-1 bg-transparent text-status text-ink outline-none placeholder:text-muted"
                />
                <button
                  type="submit"
                  disabled={!typed.trim() || thinking}
                  aria-label={t.send}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-moss text-white transition-opacity disabled:opacity-30"
                >
                  <SendIcon className="h-7 w-7" />
                </button>
              </>
            )}
          </form>
        </VoiceBeam>
      </div>

      {phase === "done" && (
        <div
          role="status"
          className="toast-in glass fixed inset-x-0 bottom-[calc(26px+4rem+6rem+env(safe-area-inset-bottom))] z-30 mx-auto flex w-fit items-center gap-3 rounded-full py-2 pl-2 pr-5 text-toast font-bold text-ink"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-moss text-white">
            <CheckIcon className="h-5 w-5" />
          </span>
          {t.done}
        </div>
      )}
    </>
  );
}
