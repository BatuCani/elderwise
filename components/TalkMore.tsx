"use client";

import { useState, type ReactNode } from "react";
import { Liquid } from "liquid-gooey";
import type { Lang } from "@/prompts/elderwise";
import { CameraIcon } from "./icons";

const COPY: Record<Lang, { more: string; close: string; scan: string; type: string; tip: string }> = {
  en: { more: "More", close: "Close", scan: "Scan", type: "Type", tip: "Tip" },
  de: { more: "Mehr", close: "Schließen", scan: "Scannen", type: "Tippen", tip: "Tipp" },
};

const PlusIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const KeyboardIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" />
  </svg>
);

const BulbIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3z" />
  </svg>
);

type Props = {
  lang: Lang;
  onScan: () => void;
  onType: () => void;
  onTip: () => void;
  // Lets the Talk screen hide its hint while the menu is open, so nothing overlaps.
  onOpenChange?: (open: boolean) => void;
};

// Talk tab: one round "+" next to the mic. Tapping it melts out the secondary actions
// (Scan a letter, Type, Tip of the day) as round glass buttons; tap again or outside to melt them back.
// liquid-gooey snaps instead of animating under prefers-reduced-motion.
// The menu opens downward in a half circle under the "+" (down-left, down, down-right),
// so it never covers the orb or its hint.
const ARC = [
  { x: -64, y: 46 },
  { x: 0, y: 78 },
  { x: 64, y: 46 },
];

export function TalkMore({ lang, onScan, onType, onTip, onOpenChange }: Props) {
  const c = COPY[lang];
  const [open, setOpenState] = useState(false);
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const items: { label: string; icon: ReactNode; run: () => void }[] = [
    { label: c.scan, icon: <CameraIcon className="h-6 w-6" />, run: onScan },
    { label: c.type, icon: <KeyboardIcon className="h-6 w-6" />, run: onType },
    { label: c.tip, icon: <BulbIcon className="h-6 w-6" />, run: onTip },
  ];

  return (
    <>
      {open && <div aria-hidden onClick={() => setOpen(false)} className="fixed inset-0 z-30" />}
      <Liquid
        blur={6}
        contrast={18}
        fill="#fff"
        shadow="0 6px 20px rgba(30,36,32,0.10), inset 0 1px 0 rgba(255,255,255,0.9)"
        filterPadding={320}
        className="relative z-40 h-14 w-14"
      >
        {items.map((item, i) => (
          <Liquid.Item
            key={item.label}
            x={open ? ARC[i].x : 0}
            y={open ? ARC[i].y : 0}
            scale={open ? 1 : 0.6}
            transition="bouncy"
            delay={open ? i * 45 : (items.length - 1 - i) * 30}
            className="absolute inset-0"
          >
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              aria-hidden={!open}
              onClick={() => {
                setOpen(false);
                item.run();
              }}
              className={`relative flex h-14 w-14 items-center justify-center rounded-full text-moss transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              {item.icon}
              <span className="absolute top-full mt-1 whitespace-nowrap text-[16px] font-bold leading-tight text-ink">{item.label}</span>
            </button>
          </Liquid.Item>
        ))}
        <Liquid.Item className="absolute inset-0">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? c.close : c.more}
            className="flex h-14 w-14 items-center justify-center rounded-full text-moss"
          >
            <PlusIcon className={`h-6 w-6 transition-transform duration-300 ${open ? "rotate-45" : ""}`} />
          </button>
        </Liquid.Item>
      </Liquid>
    </>
  );
}
