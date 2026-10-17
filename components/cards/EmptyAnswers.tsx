import Link from "next/link";
import type { Copy } from "@/app/copy";
import type { Lang } from "@/prompts/elderwise";
import { CARD_TEXT } from "./labels";

// Shown on the Answers tab before the first question: a calm picture and one big button back to Talk.
export function EmptyAnswers({ t, lang }: { t: Copy; lang: Lang }) {
  const L = CARD_TEXT[lang];

  return (
    <section className="glass flex flex-col items-center gap-5 rounded-3xl px-6 py-10 text-center">
      <svg viewBox="0 0 160 120" className="h-32 w-40" aria-hidden="true">
        <circle cx="128" cy="26" r="16" fill="#FFD3B4" />
        <rect x="14" y="22" width="112" height="66" rx="24" fill="#E4EBDD" />
        <path d="M40 86 L34 108 L62 88 Z" fill="#E4EBDD" />
        <circle cx="48" cy="55" r="7" fill="#3F5A3A" />
        <circle cx="70" cy="55" r="7" fill="#3F5A3A" opacity="0.7" />
        <circle cx="92" cy="55" r="7" fill="#3F5A3A" opacity="0.45" />
      </svg>
      <h2 className="font-serif text-3xl font-medium text-ink">{L.noAnswersTitle}</h2>
      <p className="text-xl leading-snug text-ink">{t.noAnswers}</p>
      <Link
        href="/"
        className="flex min-h-14 w-full items-center justify-center rounded-full bg-moss px-6 text-xl font-bold text-white"
      >
        {L.askSomething}
      </Link>
    </section>
  );
}
