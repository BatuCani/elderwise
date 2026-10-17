"use client";

import type { Lang } from "@/prompts/elderwise";
import { CloseIcon } from "./icons";

// Ready-made questions teach what you can ask an AI about a photo; one tap sends it with the photo.
const COPY: Record<Lang, { title: string; remove: string; questions: string[] }> = {
  en: {
    title: "What do you want to know?",
    remove: "Remove photo",
    questions: ["Is this real?", "Explain it simply", "What should I do?"],
  },
  de: {
    title: "Was möchten Sie wissen?",
    remove: "Foto entfernen",
    questions: ["Ist das echt?", "Einfach erklären", "Was soll ich tun?"],
  },
};

type Props = {
  lang: Lang;
  photo: string;
  onRemove: () => void;
  onAsk: (question: string) => void;
};

// Start screen with a photo attached: the photo and big question buttons.
export function PhotoQuestions({ lang, photo, onRemove, onAsk }: Props) {
  const c = COPY[lang];

  return (
    <section className="toast-in mt-6 flex w-full max-w-sm flex-col items-center gap-3 [@media(max-height:720px)]:mt-3">
      <div className="flex w-full items-center gap-3">
        <div className="glass relative shrink-0 rounded-2xl p-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="h-16 w-16 rounded-xl object-cover" />
        </div>
        <p className="flex-1 text-left font-serif text-[22px] font-medium leading-tight text-ink">{c.title}</p>
        <button
          type="button"
          onClick={onRemove}
          aria-label={c.remove}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-muted"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="flex w-full flex-wrap justify-center gap-2">
        {c.questions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onAsk(q)}
            className="glass min-h-14 grow rounded-full px-5 text-[20px] font-bold text-moss transition-transform active:scale-95 "
          >
            {q}
          </button>
        ))}
      </div>
    </section>
  );
}
