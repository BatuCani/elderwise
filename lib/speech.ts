"use client";

import type { Lang } from "@/prompts/elderwise";

// Minimal typing for the Web Speech API (not in TypeScript's DOM lib everywhere).
export type Recognition = {
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

export function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const LOCALE: Record<Lang, string> = { en: "en-US", de: "de-DE" };

export function speak(text: string, lang: Lang, rate: number) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = LOCALE[lang];
  u.rate = rate;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.replace("_", "-") === LOCALE[lang]);
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

// iOS only allows speech output that starts inside a user gesture; call this from a tap.
export function unlockSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
  }
}

// Re-encode any picked image (camera JPEG, HEIC-as-JPEG, SVG sample) as a JPEG of sensible size.
export async function toJpeg(src: string): Promise<Blob> {
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

export function spokenText(a: { headline: string; sentence: string; points: string[] }): string {
  return [a.headline, a.sentence, ...a.points].map((s) => s.trim().replace(/[.!?]$/, "")).join(". ") + ".";
}
