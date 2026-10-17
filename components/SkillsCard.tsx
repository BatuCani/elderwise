"use client";

import Link from "next/link";
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

const COPY: Record<Lang, { title: string; count: (n: number, all: number) => string; first: string; next: string; tryIt: string; can: string; allDone: string }> = {
  en: {
    title: "Your AI skills",
    count: (n, all) => `You have learned ${n} of ${all}.`,
    first: "Let's learn your first AI skill.",
    next: "Try this next",
    tryIt: "Try it now",
    can: "You can already",
    allDone: "You have learned them all. Wonderful!",
  },
  de: {
    title: "Ihre KI-Fähigkeiten",
    count: (n, all) => `Sie können schon ${n} von ${all}.`,
    first: "Lernen wir Ihre erste KI-Fähigkeit.",
    next: "Als Nächstes probieren",
    tryIt: "Jetzt probieren",
    can: "Das können Sie schon",
    allDone: "Sie können jetzt alle. Wunderbar!",
  },
};

// Profile tab: learning progress made simple. One sentence, one bar, ONE next step with a big
// button, and a plain list of what you can already do. No grid to decode.
export function SkillsCard({ lang }: { lang: Lang }) {
  const earned = useSkills();
  const c = COPY[lang];
  const n = earned.length;
  const all = SKILLS.length;
  const next = SKILLS.find((s) => !earned.includes(s.id));
  const done = SKILLS.filter((s) => earned.includes(s.id));
  const NextIcon = next ? ICONS[next.icon] : null;

  return (
    <section id="skills" aria-labelledby="skills-title" className="glass rounded-[24px] p-5">
      <h2 id="skills-title" className="font-serif text-[28px] font-medium leading-tight text-ink">
        {c.title}
      </h2>
      <p className="mt-1 text-[21px] font-bold leading-snug text-ink">{n === all ? c.allDone : n === 0 ? c.first : c.count(n, all)}</p>

      {/* One step per skill: easy to count, no ring or fraction to read. */}
      <div aria-hidden className="mt-3 flex gap-1.5">
        {SKILLS.map((s, i) => (
          <span key={s.id} className={`h-3.5 flex-1 rounded-full transition-colors duration-500 ${i < n ? "bg-moss" : "bg-line"}`} />
        ))}
      </div>

      {next && NextIcon && (
        <div className="glass-moss mt-5 rounded-[20px] p-4">
          <p className="text-[17px] font-bold uppercase tracking-[0.06em] text-learn">{c.next}</p>
          <div className="mt-2 flex items-start gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-moss">
              <NextIcon className="h-8 w-8" />
            </span>
            <div className="min-w-0">
              <p className="text-[22px] font-bold leading-tight text-ink">{next[lang].title}</p>
              <p className="mt-1 text-[19px] leading-snug text-ink">{next[lang].hint}</p>
            </div>
          </div>
          <Link href="/" className="mt-4 flex min-h-14 w-full items-center justify-center rounded-full bg-moss px-5 text-[20px] font-bold text-white">
            {c.tryIt}
          </Link>
        </div>
      )}

      {done.length > 0 && (
        <>
          <h3 className="mt-5 text-[18px] font-bold text-muted">{c.can}</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {done.map((s) => {
              const Icon = ICONS[s.icon];
              return (
                <li key={s.id} className="flex min-h-14 items-center gap-3 rounded-2xl bg-white/80 px-4 py-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-moss text-white">
                    <CheckIcon className="h-5 w-5" />
                  </span>
                  <span className="flex-1 text-[19px] font-bold leading-tight text-ink">{s[lang].title}</span>
                  <Icon className="h-7 w-7 shrink-0 text-moss" />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
