"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useMicrophone, VoiceBeam } from "voice-glow";
import { CameraIcon, CheckIcon, CloseIcon, MicIcon, RetryIcon, SendIcon, SwitchCameraIcon } from "@/components/icons";
import { LiveCamera } from "@/components/LiveCamera";
import { LiveWords } from "@/components/LiveWords";
import { PhotoSheet } from "@/components/PhotoSheet";
import { VoiceBars } from "@/components/VoiceBars";
import { DailyTip } from "@/components/DailyTip";
import { TalkMore } from "@/components/TalkMore";
import { VoiceOrb, type OrbMood } from "@/components/VoiceOrb";
import { addEntry, setPending as setAnswerPending } from "@/lib/answers";
import { askClaude } from "@/lib/ask";
import { haptic } from "@/lib/haptics";
import { liveLevel, liveSupported, markAutoNavigation, startLive, stopLive, useLive } from "@/lib/live";
import { navigate } from "@/lib/navigate";
import { useProfile } from "@/lib/profile";
import { earnSkill } from "@/lib/skills";
import { followUpQuestion, getSolve, setFollowUp, setPending, setStuck, startSolve, useSolve, type Solve } from "@/lib/solve";
import { getRecognition, LOCALE, speak, spokenText, unlockSpeech, type Recognition } from "@/lib/speech";
import type { Answer } from "@/prompts/elderwise";
import { TEXT } from "./copy";

type Phase = "idle" | "listening" | "thinking" | "done" | "error";

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
  // Typing and the tip of the day live behind the "+" next to the mic, so the orb has the screen to itself.
  const [typeOpen, setTypeOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const recRef = useRef<Recognition | null>(null);
  // Speech recognition stops after pauses; we keep restarting it until "Done talking",
  // so the text heard so far is kept in `baseRef` and the current run in `sessionRef`.
  const baseRef = useRef("");
  const sessionRef = useRef("");
  const photoRef = useRef<string | null>(null);
  const listeningRef = useRef(false);
  const micBlocked = useRef(false);
  const [micHint, setMicHint] = useState(false);
  const finishingRef = useRef(false);
  const busyRef = useRef(false);
  const doneTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [asked, setAsked] = useState<{ q: string; img: string | null }>({ q: "", img: null });
  const live = useLive();
  const liveOn = live.status !== "idle";
  const liveFailed = useRef(false);
  // Live camera during a conversation; the latest frame goes to Claude as the photo.
  const [camera, setCamera] = useState<"environment" | "user" | null>(null);
  const [cameraCount, setCameraCount] = useState(0);
  const [cameraError, setCameraError] = useState(false);
  const frameRef = useRef<string | null>(null);
  const cameraOnRef = useRef(false);
  const path = usePathname();
  const cameraOn = camera !== null && liveOn && path === "/";
  // Clear the camera choice whenever the camera stops (session ended, tab changed). Cleanups still
  // run on a hidden Talk tab (Next keeps it alive), so a new session never restarts it silently.
  useEffect(() => {
    if (!cameraOn) return;
    return () => setCamera(null);
  }, [cameraOn]);
  useEffect(() => {
    cameraOnRef.current = cameraOn;
    if (!cameraOn) frameRef.current = null;
  }, [cameraOn]);

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
    setTypeOpen(false);
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
    if (img) earnSkill("photo");
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
    if (q) earnSkill("voice");
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
          const img = (cameraOnRef.current && frameRef.current) || photoRef.current;
          earnSkill("voice");
          if (img) earnSkill("photo");
          const answer = await askClaude(followUp ? followUpQuestion(followUp, q) : q, img, profile);
          stuckRef.current = false;
          saveAnswer(q, answer, followUp);
          setNewPhoto(null);
          setPhase("done");
          doneTimer.current = setTimeout(() => {
            markAutoNavigation();
            navigate((to) => router.push(to), "/", "/steps");
          }, 1600);
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
      if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
        listeningRef.current = false;
        micBlocked.current = true;
      }
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
        // Blocked microphone: say so and offer "Try again" instead of silently going back to the start.
        setMicHint(micBlocked.current);
        micBlocked.current = false;
        setPhase("idle");
      }
    };
    recRef.current = rec;
    rec.start();
  }

  function startPushToTalk() {
    if (!getRecognition()) {
      // No speech recognition in this browser (e.g. Firefox): typing is the fallback.
      openTyping();
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

  function openTyping() {
    flushSync(() => setTypeOpen(true));
    typeRef.current?.focus();
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
    setMicHint(false);
    unlockSpeech();
    haptic();
    setTypeOpen(false);
    setPhase("idle");
    if (liveSupported() && !liveFailed.current) startConversation();
    else startPushToTalk();
  }

  function toggleCamera() {
    if (camera) {
      setCamera(null);
      return;
    }
    setCameraError(false);
    setCamera("environment");
  }

  function countCameras() {
    navigator.mediaDevices
      .enumerateDevices()
      .then((d) => setCameraCount(d.filter((x) => x.kind === "videoinput").length))
      .catch(() => {});
  }

  function onFinish() {
    unlockSpeech();
    haptic();
    if (liveOn) {
      setCamera(null);
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
        {cameraOn ? (
          <div className="relative mt-4 mb-6 w-full">
            <LiveCamera facing={camera} onFrame={(f) => (frameRef.current = f)} onReady={countCameras} onError={() => (setCamera(null), setCameraError(true))} />
            {cameraCount > 1 && (
              <button
                type="button"
                onClick={() => setCamera(camera === "environment" ? "user" : "environment")}
                aria-label={t.switchCamera}
                className="glass absolute right-4 top-4 flex h-14 w-14 items-center justify-center rounded-full text-ink"
              >
                <SwitchCameraIcon className="h-7 w-7" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Status is only announced to screen readers; the start screen shows just the headline. */}
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
              <div className={cameraOn ? "mb-6" : "mb-8"}>
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
                      cameraOn ? "line-clamp-3 text-[26px] " : ""
                    }${
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

            {cameraError && <p className="mb-4 text-status font-bold text-warn">{t.cameraFailed}</p>}
            {cameraOn ? (
              <div className="flex w-full max-w-sm gap-4">
                <button
                  type="button"
                  onClick={toggleCamera}
                  className="glass flex min-h-20 flex-1 items-center justify-center gap-3 rounded-[28px] text-status font-bold text-ink transition-transform active:scale-95"
                >
                  <CameraIcon className="h-8 w-8" />
                  {t.stopCamera}
                </button>
                <button
                  type="button"
                  onClick={onFinish}
                  aria-label={t.finishTalking}
                  className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-moss text-white shadow-[0_14px_34px_rgba(63,90,58,0.35)] transition-transform active:scale-95"
                >
                  <CheckIcon className="h-10 w-10" />
                </button>
              </div>
            ) : (
              <div className="grid w-full max-w-sm grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => (liveOn ? toggleCamera() : setSheetOpen(true))}
                  className="glass flex aspect-square flex-col items-center justify-center gap-2 rounded-[32px] px-2 text-ink transition-transform active:scale-95"
                >
                  <CameraIcon className="h-14 w-14" />
                  {/* Visible words, not just icons: older adults should never have to guess. */}
                  <span className="text-[19px] font-bold leading-tight">{t.startCamera}</span>
                </button>
                <button
                  type="button"
                  onClick={onFinish}
                  className="flex aspect-square flex-col items-center justify-center gap-2 rounded-[32px] bg-moss px-2 text-white shadow-[0_14px_34px_rgba(63,90,58,0.35)] transition-transform active:scale-95"
                >
                  <CheckIcon className="h-14 w-14" />
                  <span className="text-[19px] font-bold leading-tight">{t.finishTalking}</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {micHint && phase === "idle" ? (
              // Blocked microphone: the message takes the headline's place, right where the eye already is.
              <p role="alert" className="max-w-sm text-[21px] font-bold leading-snug text-warn">
                {t.micBlocked}
              </p>
            ) : (
              <h1 className="font-serif text-display font-medium leading-[1.05] text-ink [@media(max-height:720px)]:text-[1.4rem]">
                {thinking ? t.thinking : t.headline}
              </h1>
            )}
            {/* The orb is the talk button too: tapping it does the same as the mic button. */}
            <div className="mt-10 [@media(max-height:720px)]:mt-5">
              <VoiceOrb mood={mood} lang={profile.lang} onTap={onTalk} disabled={thinking} label={t.mic} />
            </div>
            {/* One big mic, and one small "+" for everything else (scan, type, tip of the day).
                While typing, the bar takes their place; the orb still starts talking. */}
            {!thinking && !typeOpen && (
              <div className="mt-8 grid w-full max-w-[15rem] grid-cols-[3.5rem_1fr_3.5rem] items-center [@media(max-height:720px)]:mt-4">
                <span />
                <button
                  type="button"
                  onClick={onTalk}
                  aria-label={t.mic}
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-moss text-white shadow-[0_14px_34px_rgba(63,90,58,0.35)] active:scale-95"
                >
                  <MicIcon className="h-9 w-9" />
                </button>
                <TalkMore lang={profile.lang} onScan={() => router.push("/scan")} onType={openTyping} onTip={() => setTipOpen(true)} />
              </div>
            )}
            <DailyTip
              lang={profile.lang}
              open={tipOpen}
              onClose={() => setTipOpen(false)}
              onTry={(q) => {
                unlockSpeech();
                ask(q, null);
              }}
            />
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
      {(listening || thinking || liveOn || typeOpen) && (
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
            className={`glass flex min-h-[4.25rem] items-center gap-2 rounded-full p-2 ${liveOn ? "" : "pl-5"}`}
            onSubmit={(e) => {
              e.preventDefault();
              onSendTyped();
            }}
          >
            {liveOn ? (
              <button
                type="button"
                onClick={onFinish}
                className="flex min-h-14 flex-1 items-center justify-center gap-3 rounded-full bg-white/70 text-status font-bold text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-transform active:scale-[0.98]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-warn/12 text-warn">
                  <CloseIcon className="h-6 w-6" />
                </span>
                {t.endConversation}
              </button>
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
                  // Leaving the empty typing bar puts it away again.
                  onBlur={() => !typed.trim() && setTypeOpen(false)}
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
      )}

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
