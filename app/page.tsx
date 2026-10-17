"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState, useSyncExternalStore } from "react";
import { useMicrophone, VoiceBeam } from "voice-glow";
import { CameraIcon, CheckIcon, RetryIcon, SendIcon } from "@/components/icons";
import { LiveWords } from "@/components/LiveWords";
import { PhotoSheet } from "@/components/PhotoSheet";
import { VoiceBars } from "@/components/VoiceBars";
import { DailyTip } from "@/components/DailyTip";
import { VoiceOrb, type OrbMood } from "@/components/VoiceOrb";
import { addEntry, setPending as setAnswerPending } from "@/lib/answers";
import { askClaude } from "@/lib/ask";
import { haptic } from "@/lib/haptics";
import { liveLevel, liveSupported, startLive, stopLive, useLive } from "@/lib/live";
import { navigate } from "@/lib/navigate";
import { useProfile } from "@/lib/profile";
import { followUpQuestion, getSolve, setFollowUp, setPending, setStuck, startSolve, useSolve, type Solve } from "@/lib/solve";
import { getRecognition, LOCALE, speak, spokenText, unlockSpeech, type Recognition } from "@/lib/speech";
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

  // Coming from "Stuck?" on the Steps page: start listening right away. Talk reacts to the flag
  // changing, because Next may keep Talk alive (hidden) instead of mounting it again.
  // Leaving Talk without asking drops the "stuck" mode.
  const stuckRef = useRef(false);
  const shownRef = useRef(false);
  const stuckNow = useSolve()?.stuck ?? false;
  const autoTalk = useEffectEvent(() => {
    if (shownRef.current) onTalk();
  });
  useEffect(() => {
    if (!stuckNow) return;
    stuckRef.current = true;
    setStuck(false);
    setTimeout(autoTalk, 300);
  }, [stuckNow]);
  useEffect(() => {
    shownRef.current = true;
    return () => {
      shownRef.current = false;
      // Only when Talk is really left (not React's quick dev re-run).
      setTimeout(() => {
        if (!shownRef.current) stuckRef.current = false;
      });
    };
  }, []);

  function setNewPhoto(src: string | null) {
    if (photoRef.current?.startsWith("blob:")) URL.revokeObjectURL(photoRef.current);
    photoRef.current = src;
    setPhoto(src);
  }

  function heard() {
    return `${baseRef.current} ${sessionRef.current}`.trim();
  }

  // Open the Steps page right away; it shows "Thinking…" until Claude's answer is in.
  function ask(q: string, img: string | null) {
    if (busyRef.current) return;
    setAsked({ q, img });
    // When stuck on a step, Claude also gets the problem and the step, so it answers about that.
    const solve = getSolve();
    send(q, img, stuckRef.current && solve ? solve : null);
    stuckRef.current = false;
    setPhase("idle");
    setQuestion("");
    navigate((to) => router.push(to), "/", "/steps");
  }

  async function send(q: string, img: string | null, followUp: Solve | null) {
    busyRef.current = true;
    setAnswerPending(true);
    setPending({ question: q, status: "thinking", followUp: !!followUp }, () => send(q, img, followUp));
    try {
      const answer = await askClaude(followUp ? followUpQuestion(followUp, q) : q, img, profile);
      saveAnswer(q, answer, followUp);
      setPending(null);
      setNewPhoto(null);
      speak(spokenText(answer), profile.lang, profile.speechRate);
    } catch {
      setPending({ question: q, status: "error", followUp: !!followUp });
      speak(t.error, profile.lang, profile.speechRate);
    } finally {
      busyRef.current = false;
      setAnswerPending(false);
    }
  }

  // Keep the answer for the Steps page (new problem, or help with the step the person is stuck on).
  function saveAnswer(q: string, answer: Answer, followUp: Solve | null) {
    if (followUp) setFollowUp(q || t.inputPlaceholder, answer);
    else startSolve(q, answer);
    addEntry(q || t.inputPlaceholder, answer);
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
          const solve = getSolve();
          const followUp = stuckRef.current && solve ? solve : null;
          const answer = await askClaude(followUp ? followUpQuestion(followUp, q) : q, photoRef.current, profile);
          stuckRef.current = false;
          saveAnswer(q, answer, followUp);
          setNewPhoto(null);
          setPhase("done");
          doneTimer.current = setTimeout(() => navigate((to) => router.push(to), "/", "/steps"), 1600);
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
    haptic();
    setPhase("idle");
    if (liveSupported() && !liveFailed.current) startConversation();
    else startPushToTalk();
  }

  function onFinish() {
    unlockSpeech();
    haptic();
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
  // Live conversation text: what was heard while listening, what Claude's answer sounds like while speaking.
  const liveText = live.status === "speaking" ? live.said : live.heard;
  // What the big orb shows: connecting, listening, thinking (or looking at a photo), speaking, or calm.
  const lookingAtPhoto = liveOn ? !!photo : !!asked.img;
  const mood: OrbMood =
    live.status === "connecting"
      ? "connecting"
      : live.status === "speaking" || phase === "done"
        ? "speaking"
        : thinking
          ? lookingAtPhoto ? "looking" : "thinking"
          : listening || liveOn
            ? "listening"
            : "idle";

  const hasWords = Boolean((listening && !liveOn && question.trim()) || (liveOn && live.status === "listening" && liveText));

  return (
    <>
      <main
        className="relative z-10 mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center px-6 pt-[calc(28px+env(safe-area-inset-top))] pb-[calc(26px+4rem+6.5rem+env(safe-area-inset-bottom))] text-center"
      >
        <p className="flex items-center gap-2 self-start font-serif text-wordmark font-medium text-moss">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/grace-mark-moss.svg" alt="" width={28} height={28} className="h-7 w-7" />
          Grace
        </p>
        <div className="flex-1" />

        {/* Status is only announced to screen readers; the start screen shows just the greeting. */}
        <p aria-live="polite" className="sr-only">
          {liveOn ? liveText || t.listening : listening ? question || t.listening : thinking ? t.thinking : phase === "error" ? t.error : ""}
        </p>

        {listening || liveOn ? (
          <>
            {/* On short phones the orb steps aside once words show, so the buttons stay clear of the bar. */}
            <div className={`mb-6 ${hasWords ? "[@media(max-height:720px)]:hidden" : ""}`}>
              <VoiceOrb mood={mood} lang={profile.lang} compact />
            </div>
            {liveOn && (
              <div className="mb-8">
                <p className="text-xl text-muted">
                  {live.status === "connecting" ? t.liveConnecting : live.status === "speaking" ? t.liveSays : live.status === "thinking" ? t.youSaid : t.listening}
                </p>
                {/* While you speak: the last 3 words, very big. Elderwise's reply stays as full text. */}
                {liveText && live.status === "listening" && (
                  <div className="mt-3">
                    <LiveWords text={liveText} placeholder={t.listening} />
                  </div>
                )}
                {liveText && live.status !== "listening" && (
                  <p
                    className={`mt-3 font-serif font-medium leading-[1.12] ${
                      live.status === "speaking" ? "text-[30px] text-moss" : "text-[30px] text-ink/70"
                    }`}
                  >
                    {live.status === "speaking" ? liveText : `“${liveText}”`}
                  </p>
                )}
              </div>
            )}
            {/* Normal speech mode: the last 3 words, very big, for reassurance while talking. */}
            {listening && !liveOn && <LiveWords text={question} placeholder={t.listening} />}
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
            <h1 className="mt-2 font-serif text-display font-medium leading-[1.05] text-ink [@media(max-height:620px)]:text-[1.4rem]">
              {t.headline}
            </h1>
            {/* The orb is the talk button: tapping it does the same as the mic button did. */}
            <div className="mt-10 [@media(max-height:620px)]:mt-5">
              <VoiceOrb mood={mood} lang={profile.lang} onTap={onTalk} disabled={thinking} label={t.mic} />
            </div>
            {/* Scan a letter, bill or code: the guided flow in app/scan. */}
            {!thinking && (
              <Link href="/scan" className="glass mt-8 flex min-h-14 items-center gap-3 rounded-full px-6 text-status font-bold text-moss [@media(max-height:620px)]:mt-4">
                <CameraIcon className="h-7 w-7" />
                {t.scanLetter}
              </Link>
            )}
            {!thinking && <DailyTip lang={profile.lang} onTry={(q) => { unlockSpeech(); ask(q, null); }} />}
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
          sensitivity={listening || liveOn ? 5 : undefined}
          reach={listening || liveOn ? 1.8 : undefined}
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
