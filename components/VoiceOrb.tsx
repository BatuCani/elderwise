"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
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

const COPY: Record<Lang, Record<OrbMood, string>> = {
  en: {
    idle: "Tap and talk",
    connecting: "Getting ready…",
    listening: "Listening…",
    thinking: "Thinking…",
    looking: "Looking at your photo…",
    speaking: "Speaking…",
  },
  de: {
    idle: "Tippen und sprechen",
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

  const glow =
    mood === "listening" || mood === "speaking"
      ? "shadow-[0_0_70px_rgba(63,90,58,0.38),inset_0_1px_0_rgba(255,255,255,0.9)]"
      : "shadow-[0_0_50px_rgba(63,90,58,0.22),inset_0_1px_0_rgba(255,255,255,0.9)]";
  const circle = compact
    ? "h-[112px] w-[112px] [@media(max-height:620px)]:h-[84px] [@media(max-height:620px)]:w-[84px]"
    : "h-[200px] w-[200px] [@media(max-height:620px)]:h-[112px] [@media(max-height:620px)]:w-[112px]";
  const orb = (
    <div ref={wrapRef} className={`glass flex items-center justify-center rounded-full transition-shadow duration-300 ${glow} ${circle}`}>
      <canvas ref={canvasRef} aria-hidden className="h-[80%] w-[80%]" />
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      {onTap ? (
        <button
          type="button"
          onClick={onTap}
          disabled={disabled}
          aria-label={label ?? COPY[lang].idle}
          className="rounded-full transition-transform active:scale-95"
        >
          {orb}
        </button>
      ) : (
        orb
      )}
      <p className={`${compact ? "mt-3" : "mt-5 [@media(max-height:620px)]:mt-2"} text-[18px] font-bold text-moss`}>{COPY[lang][mood]}</p>
    </div>
  );
}
