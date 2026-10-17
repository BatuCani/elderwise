"use client";

import { useEffect, useRef } from "react";

// Resting height of each bar (0–1): a hand-drawn waveform, tall in the middle-right like the sketch.
const SHAPE = [0.22, 0.6, 0.18, 0.55, 0.2, 0.75, 0.16, 0.48, 1, 0.24];

// Black waveform bars that move with the microphone, so you can see the app hears you.
export function VoiceBars({ stream }: { stream: MediaStream | null }) {
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let ctx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    if (stream) {
      ctx = new AudioContext();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      ctx.createMediaStreamSource(stream).connect(analyser);
    }
    const data = new Uint8Array(analyser?.frequencyBinCount ?? 0);
    let frame = 0;

    const tick = () => {
      let level = 0.55 + Math.sin(performance.now() / 400) * 0.15; // gentle breathing without a mic
      if (analyser) {
        analyser.getByteFrequencyData(data);
        // Voice sits in the lower bins; average them for one loudness value.
        let sum = 0;
        for (let i = 2; i < 40; i++) sum += data[i];
        level = Math.min(1, (sum / 38 / 255) * 2.2);
      }
      const t = performance.now() / 180;
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const wobble = 0.75 + 0.25 * Math.sin(t + i * 1.7);
        const h = 0.12 + SHAPE[i] * level * wobble * 0.88;
        bar.style.transform = `scaleY(${h.toFixed(3)})`;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      ctx?.close();
    };
  }, [stream]);

  return (
    <div aria-hidden className="flex h-20 items-center justify-center gap-2.5">
      {SHAPE.map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          className="h-full w-2.5 origin-center rounded-full bg-ink transition-transform duration-75"
          style={{ transform: "scaleY(0.12)" }}
        />
      ))}
    </div>
  );
}
