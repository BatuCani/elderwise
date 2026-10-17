"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { friendlyTime, todayKey } from "@/components/cards/friendlyTime";
import { AlertIcon, BackIcon, BookIcon, CalendarIcon, ChatIcon, InfoIcon, ListIcon, PhoneIcon } from "@/components/icons";
import { useAnswers, type Entry } from "@/lib/answers";
import { askClaude } from "@/lib/ask";
import { useProfile } from "@/lib/profile";
import { SKILLS, useSkills } from "@/lib/skills";
import { LOCALE } from "@/lib/speech";
import type { AnswerType } from "@/prompts/elderwise";
import { DEMO_PHONE, sampleEntries } from "./sample";
import { FAMILY_TEXT } from "./text";

const WEEK = 7 * 24 * 60 * 60 * 1000;
const YESTERDAY = { en: "Yesterday", de: "Gestern" };

const ICON: Record<AnswerType, (p: { className?: string }) => ReactNode> = {
  warning: AlertIcon,
  explain: BookIcon,
  steps: ListIcon,
  reminder: CalendarIcon,
  info: InfoIcon,
  place: InfoIcon,
  link: InfoIcon,
};

// Family view: what the trusted person (Anna) sees about the week.
// Claude writes one calm summary sentence; if that fails, a fixed sentence is shown.
// With no answers on this phone yet, a labelled demo week is shown instead.
export default function FamilyPage() {
  const profile = useProfile();
  const lang = profile.lang;
  const F = FAMILY_TEXT[lang];
  const saved = useAnswers();
  const skills = useSkills();
  // Read the clock after mount: Date.now() during render is not allowed in a prerendered client page.
  const [now, setNow] = useState(0);
  useEffect(() => setNow(Date.now()), []);
  const isDemo = saved.length === 0;

  const week: Entry[] = useMemo(
    () => (isDemo ? sampleEntries(now) : saved.filter((e) => now - e.at < WEEK)),
    [isDemo, saved, now],
  );
  const scams = week.filter((e) => e.answer.type === "warning");
  const fallback = F.summary(profile.name, week.length, scams.length);

  // One Claude call per visit, only from the facts above.
  const facts = `${week.length} questions; scam warnings: ${scams.map((e) => e.answer.headline).join(", ") || "none"}; ` +
    `topics: ${week.slice(0, 6).map((e) => e.answer.headline).join(", ")}; AI skills learned: ${skills.length} of ${SKILLS.length}`;
  const [summary, setSummary] = useState<string | null>(null);
  const [asking, setAsking] = useState(true);
  useEffect(() => {
    let live = true;
    askClaude(F.prompt(profile.name, profile.trusted.name, facts), null, profile)
      .then((a) => live && setSummary(a.sentence || a.headline || null))
      .catch(() => {})
      .finally(() => live && setAsking(false));
    return () => {
      live = false;
    };
    // Ask once per visit and language, not on every new render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const today = todayKey();
  const time = (at: number) => friendlyTime(at, today, LOCALE[lang], YESTERDAY[lang]);
  const phone = DEMO_PHONE.replace(/\s/g, "");
  const smsBody = encodeURIComponent(F.messageBody(profile.name, profile.trusted.name));

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-5 pb-40 pt-8">
      <Link href="/profile" className="glass flex min-h-12 w-fit items-center gap-2 rounded-full px-5 text-lg font-bold text-ink">
        <BackIcon className="h-6 w-6" />
        {F.back}
      </Link>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl font-medium leading-tight text-ink">{F.title(profile.name)}</h1>
          {isDemo && (
            <span className="rounded-full border border-ink/20 px-3 py-1 text-base font-bold uppercase tracking-[0.08em] text-muted">
              {F.demo}
            </span>
          )}
        </div>
        <p className="text-lg leading-snug text-muted">{F.intro(profile.trusted.name)}</p>
      </header>

      <section aria-live="polite" className="glass-moss rounded-3xl p-6">
        <p className="font-serif text-2xl leading-snug text-ink">{asking ? F.summaryWriting : (summary ?? fallback)}</p>
        <p className="mt-3 text-lg font-bold text-learn">{F.skills(skills.length, SKILLS.length)}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-muted">{F.alerts}</h2>
        {scams.length === 0 && <p className="glass rounded-[20px] p-4 text-lg text-ink">{F.noAlerts}</p>}
        {scams.map((e) => (
          <div key={e.id} className="flex items-start gap-3 rounded-[20px] border border-warn/25 bg-warn/[0.07] p-4">
            <AlertIcon className="mt-0.5 h-7 w-7 shrink-0 text-warn" />
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold text-warn">{e.answer.headline}</p>
              {e.answer.sentence && <p className="text-lg leading-snug text-ink">{e.answer.sentence}</p>}
              <p className="mt-1 text-base text-muted">{time(e.at)}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-muted">{F.activity}</h2>
        <ul className="glass flex flex-col rounded-[20px]">
          {week.slice(0, 6).map((e, i) => {
            const Icon = ICON[e.answer.type] ?? InfoIcon;
            return (
              <li key={e.id} className={`flex items-center gap-3 p-4 ${i ? "border-t border-line" : ""}`}>
                <Icon className={`h-7 w-7 shrink-0 ${e.answer.type === "warning" ? "text-warn" : "text-moss"}`} />
                <p className="min-w-0 flex-1 text-lg font-bold leading-snug text-ink">{e.answer.headline}</p>
                <p className="shrink-0 text-base text-muted">{time(e.at)}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <a href={`tel:${phone}`} className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-moss px-5 text-lg font-bold text-white">
          <PhoneIcon className="h-6 w-6 shrink-0" />
          {F.call(profile.name)}
        </a>
        <a
          href={`sms:${phone}?&body=${smsBody}`}
          className="flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-ink bg-white px-5 text-lg font-bold text-ink"
        >
          <ChatIcon className="h-6 w-6 shrink-0" />
          {F.message}
        </a>
      </section>
    </main>
  );
}
