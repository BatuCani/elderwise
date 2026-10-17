"use client";

import { useEffect, useRef, useState } from "react";
import { Burst } from "./Burst";
import { useProfile } from "@/lib/profile";
import { earnedNow, skillText, useSkills, type SkillId } from "@/lib/skills";

const SEEN = "elderwise.skills.seen";
const LABEL = { en: "New AI skill", de: "Neue KI-Fähigkeit" };

function readSeen(): SkillId[] | null {
  try {
    const raw = localStorage.getItem(SEEN);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSeen(ids: SkillId[]) {
  try {
    localStorage.setItem(SEEN, JSON.stringify(ids));
  } catch {
    // Private mode: the toast may show again next visit, which is fine.
  }
}

// A gentle "New AI skill: Show a photo" at the top for 2.5 seconds, once per skill. No sound.
export function SkillToast() {
  const earned = useSkills();
  const { lang } = useProfile();
  const [shown, setShown] = useState<SkillId | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const key = earned.join(",");

  useEffect(() => {
    let seen = readSeen();
    // First visit with this feature: what was earned before counts as seen, so there is no burst of toasts.
    if (seen === null) {
      seen = earnedNow();
      writeSeen(seen);
    }
    const fresh = earned.find((id) => !seen.includes(id));
    if (!fresh) return;
    writeSeen([...seen, fresh]);
    // Showing the toast is the point of this effect (an external store changed).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShown(fresh);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShown(null), 2500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!shown) return null;
  return (
    <div
      role="status"
      className="toast-in glass fixed inset-x-0 top-[calc(14px+env(safe-area-inset-top))] z-[60] mx-auto flex w-fit max-w-[calc(100%-32px)] items-center gap-3 rounded-full py-2 pl-2 pr-5"
    >
      <span className="skill-spark relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moss text-white">
        <SparkIcon className="h-6 w-6" />
        <Burst />
      </span>
      <span className="text-[18px] font-bold leading-tight text-ink">
        {LABEL[lang]}: <span className="text-moss">{skillText(shown, lang).title}</span>
      </span>
    </div>
  );
}

const SparkIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
  </svg>
);
