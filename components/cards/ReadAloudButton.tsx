"use client";

import type { Lang } from "@/prompts/elderwise";
import { speak, spokenText } from "@/lib/speech";
import { SpeakerIcon } from "../icons";

type Props = {
  answer: { headline: string; sentence: string; points: string[] };
  lang: Lang;
  rate: number;
  label: string;
};

// Small glass pill that reads exactly this answer aloud (headline, sentence, points).
export function ReadAloudButton({ answer, lang, rate, label }: Props) {
  return (
    <button
      type="button"
      onClick={() => speak(spokenText(answer), lang, rate)}
      className="glass flex min-h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 text-lg font-bold text-ink"
    >
      <SpeakerIcon className="h-6 w-6 text-moss" />
      {label}
    </button>
  );
}
