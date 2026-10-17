"use client";

import type { Lang } from "@/prompts/elderwise";
import { speak, spokenText } from "@/lib/speech";
import { RetryIcon, SpeakerIcon } from "../icons";
import { CARD_TEXT } from "./labels";

type Props = {
  answer: { headline: string; sentence: string; points: string[] };
  lang: Lang;
  rate: number;
  label: string;
};

// "Read aloud" and "Say it again, slower" above an answer: side by side when they fit, else stacked.
// Slower is 0.75, or a bit below the person's own speed if they already chose a slow one.
export function SpeakButtons({ answer, lang, rate, label }: Props) {
  const pill =
    "glass flex min-h-14 flex-auto items-center justify-center gap-2 rounded-full px-5 py-2 text-lg font-bold leading-tight text-ink";
  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={() => speak(spokenText(answer), lang, rate)} className={pill}>
        <SpeakerIcon className="h-6 w-6 shrink-0 text-moss" />
        {label}
      </button>
      <button
        type="button"
        onClick={() => speak(spokenText(answer), lang, Math.min(0.75, rate - 0.15))}
        className={pill}
      >
        <RetryIcon className="h-6 w-6 shrink-0 text-moss" />
        {CARD_TEXT[lang].slower}
      </button>
    </div>
  );
}
