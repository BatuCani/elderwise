"use client";

import type { ReactNode } from "react";
import { SKILLS, useSkills, type SkillIcon } from "@/lib/skills";
import type { Lang } from "@/prompts/elderwise";
import { AlertIcon, BookIcon, CalendarIcon, CameraIcon, ChatIcon, CheckIcon, ListIcon, MicIcon, PhoneIcon } from "./icons";

const ICONS: Record<SkillIcon, (p: { className?: string }) => ReactNode> = {
  mic: MicIcon,
  camera: CameraIcon,
  alert: AlertIcon,
  book: BookIcon,
  list: ListIcon,
  calendar: CalendarIcon,
  chat: ChatIcon,
  phone: PhoneIcon,
};

const COPY: Record<Lang, { title: string; of: (n: number, all: number) => string; sub: (n: number) => string; tryIt: string }> = {
  en: {
    title: "Your AI skills",
    of: (n, all) => `${n} of ${all}`,
    sub: (n) => (n === 0 ? "Ask Grace anything to learn your first one." : n === SKILLS.length ? "You have learned them all. Wonderful!" : "Every question teaches you something new."),
    tryIt: "Try",
  },
  de: {
    title: "Ihre KI-Fähigkeiten",
    of: (n, all) => `${n} von ${all}`,
    sub: (n) => (n === 0 ? "Fragen Sie Grace etwas, dann lernen Sie die erste." : n === SKILLS.length ? "Sie können jetzt alle. Wunderbar!" : "Jede Frage bringt Ihnen etwas Neues bei."),
    tryIt: "Probieren",
  },
};

// Profile tab: learning progress as a ring ("3 of 8") and the 8 skills as small tiles.
export function SkillsCard({ lang }: { lang: Lang }) {
  const earned = useSkills();
  const c = COPY[lang];
  const n = earned.length;
  const r = 34;
  const circ = 2 * Math.PI * r;

  return (
    <section id="skills" aria-label={c.title} className="glass rounded-[24px] p-5">
      <div className="flex items-center gap-4">
        <div className="relative h-[84px] w-[84px] shrink-0" role="img" aria-label={c.of(n, SKILLS.length)}>
          <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="42" cy="42" r={r} fill="none" stroke="var(--color-line)" strokeWidth="8" />
            <circle
              cx="42"
              cy="42"
              r={r}
              fill="none"
              stroke="var(--color-moss)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - n / SKILLS.length)}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
          <span aria-hidden className="absolute inset-0 flex items-center justify-center font-serif text-[26px] font-medium text-ink">
            {n}/{SKILLS.length}
          </span>
        </div>
        <div className="min-w-0">
          <h2 className="font-serif text-[26px] font-medium leading-tight text-ink">{c.title}</h2>
          <p className="mt-1 text-[17px] leading-snug text-muted">{c.sub(n)}</p>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-2">
        {SKILLS.map((s) => {
          const has = earned.includes(s.id);
          const Icon = ICONS[s.icon];
          const t = s[lang];
          return (
            <li
              key={s.id}
              className={`relative flex min-h-[88px] flex-col gap-1 rounded-2xl p-3 ${has ? "bg-white/80" : "border-2 border-dashed border-line"}`}
            >
              <Icon className={`h-7 w-7 ${has ? "text-moss" : "text-muted/60"}`} />
              {has && (
                <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-moss text-white">
                  <CheckIcon className="h-4 w-4" />
                </span>
              )}
              <span className={`text-[17px] font-bold leading-tight ${has ? "text-ink" : "text-muted"}`}>{t.title}</span>
              {!has && (
                <span className="text-[16px] leading-snug text-muted">
                  {c.tryIt}: {t.hint}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
