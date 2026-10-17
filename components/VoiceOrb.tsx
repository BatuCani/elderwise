"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BotAvatar } from "bot-avatars";
import { useAssistant } from "@/lib/assistant";
import type { Lang } from "@/prompts/elderwise";
import { PERSONALITY_AVATARS } from "./AssistantSettings";

// What the Talk tab is doing right now; each mood has its own orb animation.
export type OrbMood = "idle" | "connecting" | "listening" | "thinking" | "looking" | "speaking";

// How the assistant's bot face behaves in each mood: calm while idle or listening, busy while it works.
const BOT_STATE: Record<OrbMood, "default" | "working"> = {
  idle: "default",
  connecting: "default",
  listening: "default",
  thinking: "working",
  looking: "working",
  speaking: "working",
};

// After this long with nothing happening the bot dozes off; a tap wakes it right away.
const SLEEP_AFTER_MS = 45_000;

// Shown while someone holds the orb down: they don't need to hold, just let go and talk.
const HOLD_HINT: Record<Lang, string> = {
  en: "Let go, then speak",
  de: "Loslassen, dann sprechen",
};

const COPY: Record<Lang, Record<OrbMood, string>> = {
  en: {
    idle: "Tap once, then speak",
    connecting: "Getting ready…",
    listening: "Listening…",
    thinking: "Thinking…",
    looking: "Looking at your photo…",
    speaking: "Speaking…",
  },
  de: {
    idle: "Einmal tippen, dann sprechen",
    connecting: "Einen Moment…",
    listening: "Ich höre zu…",
    thinking: "Ich denke nach…",
    looking: "Ich schaue mir das Foto an…",
    speaking: "Ich spreche…",
  },
};

const reducedQuery = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = matchMedia(reducedQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

type Props = {
  mood: OrbMood;
  lang: Lang;
  // Smaller orb while the camera and "Done" buttons are on screen.
  compact?: boolean;
  // Tapping the orb starts talking, just like the mic button. Without onTap it is only a picture.
  onTap?: () => void;
  disabled?: boolean;
  label?: string;
  hideHint?: boolean;
};

// The big friendly face of Grace on the Talk tab: the bot of the chosen personality (bot-avatars,
// libraries.dev) in a soft moss glow, with a calm ring that breathes while it listens or speaks.
export function VoiceOrb({ mood, lang, compact = false, onTap, disabled, label, hideHint = false }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useSyncExternalStore(subscribeReduced, () => matchMedia(reducedQuery).matches, () => false);
  const assistant = useAssistant();
  const [asleep, setAsleep] = useState(false);
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const firedByPointer = useRef(false);

  // Idle for a long while: the bot falls asleep. Any other mood keeps it awake.
  useEffect(() => {
    if (mood !== "idle") return;
    const timer = setTimeout(() => setAsleep(true), SLEEP_AFTER_MS);
    return () => {
      clearTimeout(timer);
      setAsleep(false);
    };
  }, [mood]);

  // A soft fade and grow whenever the mood changes.
  useEffect(() => {
    if (reduced) return;
    wrapRef.current?.animate(
      [
        { opacity: 0.4, transform: "scale(0.92)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 260, easing: "cubic-bezier(0.2, 0.9, 0.3, 1.1)" },
    );
  }, [mood, reduced]);

  // No disc behind the orb: it sits right on the cream canvas with a soft moss glow.
  const glow =
    mood === "listening" || mood === "speaking"
      ? "bg-[radial-gradient(circle,rgba(63,90,58,0.26)_0%,rgba(63,90,58,0.08)_45%,transparent_70%)]"
      : "bg-[radial-gradient(circle,rgba(63,90,58,0.16)_0%,rgba(63,90,58,0.05)_45%,transparent_70%)]";
  const circle = compact
    ? "h-[128px] w-[128px] [@media(max-height:620px)]:h-[96px] [@media(max-height:620px)]:w-[96px]"
    : "h-[240px] w-[240px] [@media(max-height:720px)]:h-[160px] [@media(max-height:720px)]:w-[160px]";
  const active = mood === "listening" || mood === "speaking";
  const botSize = compact ? 80 : 112;
  const orb = (
    <div ref={wrapRef} className={`relative flex items-center justify-center rounded-full ${glow} ${circle}`}>
      {/* A solid, soft ring that breathes while Grace listens or speaks; it fades away otherwise. */}
      <span
        aria-hidden
        className={`orb-ring pointer-events-none absolute inset-[16%] rounded-full border-2 border-moss/25 transition-opacity duration-500 ${
          active ? "opacity-100" : "opacity-0"
        } ${mood === "speaking" ? "orb-ring-fast" : ""}`}
      />
      <BotAvatar
        {...PERSONALITY_AVATARS[assistant.personality]}
        shading="fabric"
        size={botSize}
        state={asleep ? "sleeping" : BOT_STATE[mood]}
        turn={mood === "listening" ? 1.5 : 1}
        interactive={false}
        paused={reduced}
        aria-hidden
        className="relative"
      />
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      {onTap ? (
        // Starts on release, for a quick tap and a long press alike (release is a user gesture on
        // every phone, so the mic and voice always unlock). Holding shows "Let go, then speak".
        <button
          type="button"
          disabled={disabled}
          aria-label={label ?? COPY[lang].idle}
          onPointerDown={() => {
            clearTimeout(holdTimer.current);
            holdTimer.current = setTimeout(() => setHolding(true), 350);
          }}
          onPointerUp={(e) => {
            clearTimeout(holdTimer.current);
            setHolding(false);
            const r = e.currentTarget.getBoundingClientRect();
            const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
            if (!inside || disabled) return;
            firedByPointer.current = true;
            onTap();
          }}
          onPointerCancel={() => {
            clearTimeout(holdTimer.current);
            setHolding(false);
          }}
          onClick={() => {
            // Keyboard and screen readers only send click; after a touch it was already handled.
            if (firedByPointer.current) firedByPointer.current = false;
            else onTap();
          }}
          onContextMenu={(e) => e.preventDefault()}
          className="touch-none rounded-full transition-transform active:scale-95"
        >
          {orb}
        </button>
      ) : (
        orb
      )}
      <p aria-live="polite" className={`${compact ? "mt-3" : "mt-5 [@media(max-height:720px)]:mt-3"} text-[18px] font-bold text-moss transition-opacity duration-200 ${hideHint ? "opacity-0" : "opacity-100"}`}>
        {holding ? HOLD_HINT[lang] : COPY[lang][mood]}
      </p>
    </div>
  );
}
