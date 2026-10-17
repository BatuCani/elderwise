"use client";

import { usePathname } from "next/navigation";
import { TEXT } from "@/app/copy";
import { stopLive, useLive } from "@/lib/live";
import { useProfile } from "@/lib/profile";

// While a hands-free conversation runs and the person looks at another tab, a small pill lets them end it.
export function LiveBar() {
  const path = usePathname();
  const t = TEXT[useProfile().lang];
  const { status } = useLive();
  if (status === "idle" || path === "/" || path === "/welcome") return null;

  return (
    <div className="glass fixed inset-x-5 bottom-[calc(26px+5rem+env(safe-area-inset-bottom))] z-20 mx-auto flex max-w-xl items-center gap-3 rounded-full py-2 pl-5 pr-2">
      <span className="thinking-dot shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-base font-bold text-ink">{t.liveActive}</span>
      <button onClick={stopLive} className="min-h-12 shrink-0 rounded-full bg-moss px-6 text-lg font-bold text-white">
        {t.liveStop}
      </button>
    </div>
  );
}
