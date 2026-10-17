"use client";

import { useState } from "react";
import { clearEntries } from "@/lib/answers-extra";
import type { Lang } from "@/prompts/elderwise";
import { CARD_TEXT } from "./labels";

// "Clear history" text button at the bottom of the list, with a calm confirm step.
export function ClearHistory({ lang }: { lang: Lang }) {
  const L = CARD_TEXT[lang];
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="mx-auto min-h-12 px-4 text-lg font-bold text-muted underline underline-offset-4"
      >
        {L.clearHistory}
      </button>
    );
  }

  return (
    <div role="alertdialog" aria-label={L.clearConfirm} className="glass flex flex-col gap-4 rounded-3xl p-5">
      <p className="text-center text-xl font-bold text-ink">{L.clearConfirm}</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setAsking(false)}
          className="min-h-14 rounded-full border-2 border-ink bg-white text-lg font-bold text-ink"
        >
          {L.cancel}
        </button>
        <button type="button" onClick={clearEntries} className="min-h-14 rounded-full bg-warn text-lg font-bold text-white">
          {L.clearYes}
        </button>
      </div>
    </div>
  );
}
