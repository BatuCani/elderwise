"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MODE_FRAMES, paintFrame, resolvePreset } from "thinking-orbs/engine";
import type { OrbState } from "thinking-orbs";
import type { Lang } from "@/prompts/elderwise";

// What the Talk tab is doing right now; each mood has its own orb animation.
export type OrbMood = "idle" | "connecting" | "listening" | "thinking" | "looking" | "speaking";

const ORB: Record<OrbMood, OrbState> = {
  idle: "breathing",
  connecting: "connecting",
  listening: "listening",
  thinking: "solving",
  looking: "searching",
  speaking: "composing",
};

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

// The orb geometry is tuned for 64px; we paint it bigger on our own canvas so it stays crisp.
const BASE = 64;
const MOSS = { r: 63, g: 90, b: 58 };

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
};

// The big animated "face" of Elderwise on the Talk tab (orbs from thinking-orbs, libraries.dev).
export function VoiceOrb({ mood, lang, compact = false, onTap, disabled, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useSyncExternalStore(subscribeReduced, () => matchMedia(reducedQuery).matches, () => false);
  const state = ORB[mood];
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const firedByPointer = useRef(false);

  // Draw the orb animation; with reduced motion it is one still frame.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { mode, speed, opts } = resolvePreset(state, BASE);
    const frameFn = MODE_FRAMES[mode];
    let raf = 0;
    const draw = (t: number) => {
      const px = canvas.clientWidth;
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      if (canvas.width !== Math.round(px * dpr)) {
        canvas.width = Math.round(px * dpr);
        canvas.height = Math.round(px * dpr);
      }
      const scale = (px * dpr) / BASE;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, BASE, BASE);
      paintFrame(ctx, frameFn(BASE, t, opts), false, MOSS);
    };
    if (reduced) {
      draw(0.6);
      return;
    }
    const loop = () => {
      draw((performance.now() / 1000) * speed);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [state, reduced]);

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
  const orb = (
    <div ref={wrapRef} className={`flex items-center justify-center rounded-full ${glow} ${circle}`}>
      <canvas ref={canvasRef} aria-hidden className="h-[92%] w-[92%]" />
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
      <p aria-live="polite" className={`${compact ? "mt-3" : "mt-5 [@media(max-height:720px)]:mt-3"} text-[18px] font-bold text-moss`}>
        {holding ? HOLD_HINT[lang] : COPY[lang][mood]}
      </p>
    </div>
  );
}
