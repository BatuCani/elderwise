import type { ReactNode } from "react";
import type { TopicId } from "@/lib/lessons";

// Simple line-art for each topic: moss strokes on a soft sage circle, a peach accent. No stock art.
const MOSS = "#3F5A3A";
const SAGE = "#E4EBDD";
const PEACH = "#FFD3B4";

const line = { fill: "none", stroke: MOSS, strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const ART: Record<TopicId, ReactNode> = {
  scams: (
    <>
      <path d="M32 14 47 20v11c0 9.5-6.4 16.5-15 19-8.6-2.5-15-9.5-15-19V20z" {...line} />
      <path d="M25.5 32.5 30 37l8.5-9" {...line} />
    </>
  ),
  letters: (
    <>
      <rect x="15" y="20" width="34" height="24" rx="3" {...line} />
      <path d="m16 22 16 12 16-12" {...line} />
      <circle cx="45" cy="42" r="6" fill={PEACH} />
    </>
  ),
  health: (
    <>
      <rect x="16" y="27" width="32" height="12" rx="6" transform="rotate(-35 32 33)" {...line} />
      <path d="m28.5 25.5 7 15" {...line} />
      <circle cx="44" cy="44" r="5" fill={PEACH} />
    </>
  ),
  money: (
    <>
      <ellipse cx="29" cy="26" rx="11" ry="4.5" {...line} />
      <path d="M18 26v7c0 2.5 4.9 4.5 11 4.5s11-2 11-4.5v-7M18 33v7c0 2.5 4.9 4.5 11 4.5s11-2 11-4.5v-7" {...line} />
      <circle cx="44" cy="41" r="6" fill={PEACH} stroke={MOSS} strokeWidth={2.4} />
    </>
  ),
  phone: (
    <>
      <rect x="22" y="13" width="20" height="38" rx="5" {...line} />
      <path d="M29 46h6" {...line} />
      <path d="M27 24h10M27 30h7" {...line} />
    </>
  ),
  travel: (
    <>
      <rect x="18" y="16" width="28" height="26" rx="5" {...line} />
      <path d="M18 31h28M23 48v-6M41 48v-6" {...line} />
      <circle cx="24" cy="36.5" r="1.6" fill={MOSS} />
      <circle cx="40" cy="36.5" r="1.6" fill={MOSS} />
      <path d="M23 22h18" {...line} />
    </>
  ),
  family: (
    <>
      <rect x="15" y="18" width="34" height="28" rx="4" {...line} />
      <circle cx="26" cy="28" r="4" fill={PEACH} />
      <path d="m17 42 10-9 7 6 5-4 8 7" {...line} />
    </>
  ),
  ai: (
    <>
      <path d="M14 21a5 5 0 0 1 5-5h18a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5h-9l-7 6v-6h-2a5 5 0 0 1-5-5z" {...line} />
      <path d="M36 39h9a5 5 0 0 0 5-5v-6" {...line} />
      <circle cx="22" cy="25.5" r="1.8" fill={MOSS} />
      <circle cx="28" cy="25.5" r="1.8" fill={MOSS} />
      <circle cx="34" cy="25.5" r="1.8" fill={MOSS} />
    </>
  ),
};

export function TopicArt({ id, className }: { id: TopicId; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <circle cx="32" cy="32" r="30" fill={SAGE} />
      {ART[id]}
    </svg>
  );
}
