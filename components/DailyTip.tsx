"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { tipOfTheDay, todayKey } from "@/lib/tips";
import type { Lang } from "@/prompts/elderwise";
import { CloseIcon } from "./icons";

const COPY: Record<Lang, { kicker: string; pill: string; tryIt: string; hide: string; close: string }> = {
  en: { kicker: "Tip of the day", pill: "Tip", tryIt: "Try it", hide: "Hide today's tip", close: "Close" },
  de: { kicker: "Tipp des Tages", pill: "Tipp", tryIt: "Ausprobieren", hide: "Tipp für heute ausblenden", close: "Schließen" },
};

// "Hidden for today" lives in this browser only.
const KEY = "grace.tipHiddenOn";
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function hiddenToday() {
  try {
    return localStorage.getItem(KEY) === todayKey();
  } catch {
    return false;
  }
}
function hideToday() {
  try {
    localStorage.setItem(KEY, todayKey());
  } catch {
    // Private mode: the tip just shows again next time.
  }
  listeners.forEach((l) => l());
}

const noSubscribe = () => () => {};

const BulbIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3z" />
  </svg>
);

type Props = {
  lang: Lang;
  // Sends the example question, like the typing bar does.
  onTry: (question: string) => void;
  // Controlled: only the sheet, opened from somewhere else (the Talk tab's "+" menu).
  open?: boolean;
  onClose?: () => void;
};

// Talk tab: one AI skill per day. A one-line pill under the orb; tapping it opens the full tip.
// Small phones get a lightbulb in the corner; tablets and desktop show the card right away.
export function DailyTip({ lang, onTry, open: openProp, onClose }: Props) {
  const c = COPY[lang];
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
  const hidden = useSyncExternalStore(subscribe, hiddenToday, () => true);
  const [openState, setOpenState] = useState(false);
  const controlled = onClose !== undefined;
  const open = controlled ? !!openProp : openState;
  const setOpen = (o: boolean) => {
    if (!controlled) setOpenState(o);
    else if (!o) onClose();
  };
  if (!mounted || (hidden && !controlled)) return null;
  const tip = tipOfTheDay(lang);

  function tryIt() {
    setOpen(false);
    onTry(tip.tryIt);
  }

  const card = (inSheet: boolean) => (
    <div className={inSheet ? "" : "glass w-full max-w-sm rounded-3xl p-5 text-left"}>
      <div className="flex items-center gap-2">
        <BulbIcon className="h-6 w-6 shrink-0 text-moss" />
        <p className="flex-1 text-base font-bold uppercase tracking-[0.08em] text-muted">{c.kicker}</p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            hideToday();
          }}
          aria-label={c.hide}
          className="-mr-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-muted"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
      <h2 className="mt-1 font-serif text-[26px] font-medium leading-tight text-ink">{tip.title}</h2>
      <p className="mt-2 text-lg leading-snug text-ink">{tip.sentence}</p>
      <p className="mt-3 text-lg leading-snug text-muted">“{tip.tryIt}”</p>
      <button
        type="button"
        onClick={tryIt}
        className="mt-4 flex min-h-14 w-full items-center justify-center rounded-full bg-moss px-6 text-[20px] font-bold text-white transition-transform active:scale-95"
      >
        {c.tryIt}
      </button>
    </div>
  );

  return (
    <>
      {!controlled && (
        <>
      {/* Small phones (iPhone SE): a lightbulb button in the top corner, next to the app name. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${c.kicker}: ${tip.title}`}
        className="glass fixed top-[calc(18px+env(safe-area-inset-top))] right-5 z-20 hidden h-12 w-12 items-center justify-center rounded-full text-moss transition-transform active:scale-95 [@media(max-height:620px)]:flex"
      >
        <BulbIcon className="h-6 w-6" />
      </button>
      {/* Phones: one calm line. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass mt-4 flex min-h-12 max-w-full items-center gap-2 rounded-full px-5 text-[18px] text-ink transition-transform active:scale-95 [@media(max-height:620px)]:hidden [@media(min-height:1000px)]:hidden"
      >
        <BulbIcon className="h-5 w-5 shrink-0 text-moss" />
        <span className="truncate">
          <b className="font-bold text-moss">{c.pill}:</b> {tip.title}
        </span>
        <span aria-hidden className="text-muted">›</span>
      </button>
      {/* Tablets and desktop: the whole card. */}
      <div className="mt-6 hidden w-full justify-center [@media(min-height:1000px)]:flex">{card(false)}</div>
        </>
      )}

      {open &&
        createPortal(
          <div role="dialog" aria-modal="true" aria-label={c.kicker} className="fixed inset-0 z-50">
            <div onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/40" />
            <div
              className="toast-in glass absolute inset-x-0 bottom-0 mx-auto max-w-xl rounded-t-[32px] px-6 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
              style={{ background: "rgba(250, 248, 243, 0.92)" }}
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted/40" />
              {card(true)}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-3 flex min-h-14 w-full items-center justify-center rounded-full bg-white/75 text-[20px] font-bold text-ink"
              >
                {c.close}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
