import { useId } from "react";
import type { AnswerType } from "@/prompts/elderwise";

// A small animated picture at the top of every answer card, so the kind of answer reads at a glance:
// a shield for a scam, a letter opening, a path of steps, a calendar page turning, a pin on a map.
// Pure SVG and CSS (the art-* classes in app/globals.css); with reduced motion each one is a still picture.

const MOSS = "var(--color-moss)";
const WARN = "var(--color-warn)";

function Shield() {
  return (
    <svg viewBox="0 0 120 80" className="h-full" aria-hidden="true">
      <circle cx="60" cy="40" r="22" fill="none" stroke="white" strokeWidth="2" className="art-ring" />
      <circle cx="60" cy="40" r="22" fill="none" stroke="white" strokeWidth="2" className="art-ring art-ring-late" />
      <g className="art-pop">
        <path d="M60 14l20 7v15c0 13-8.5 22-20 27-11.5-5-20-14-20-27V21z" fill="white" />
        <path d="M60 28v14" stroke={WARN} strokeWidth="5" strokeLinecap="round" />
        <circle cx="60" cy="51" r="3.2" fill={WARN} />
      </g>
    </svg>
  );
}

function Letter() {
  return (
    <svg viewBox="0 0 120 80" className="h-full" aria-hidden="true">
      <rect x="30" y="32" width="60" height="40" rx="5" fill="white" stroke={MOSS} strokeWidth="2.5" />
      {/* The flap opens up behind the letter, which then slides out of the pocket. */}
      <path d="M31 34l29 20 29-20" fill="#e4ebdd" stroke={MOSS} strokeWidth="2.5" strokeLinejoin="round" className="art-flap" />
      <g className="art-paper">
        <rect x="38" y="20" width="44" height="34" rx="3" fill="white" stroke={MOSS} strokeWidth="2" />
        <path d="M45 30h30M45 37h22M45 44h26" stroke={MOSS} strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      </g>
      <path d="M30 40l30 20 30-20v27a5 5 0 0 1-5 5H35a5 5 0 0 1-5-5z" fill="white" stroke={MOSS} strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

function Path({ count }: { count: number }) {
  const n = Math.min(Math.max(count, 2), 4);
  const xs = Array.from({ length: n }, (_, i) => 18 + (i * 84) / (n - 1));
  const y = (i: number) => (i % 2 === 0 ? 50 : 30);
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x} ${y(i)}`).join(" ");
  return (
    <svg viewBox="0 0 120 80" className="h-full" aria-hidden="true">
      <path d={d} fill="none" stroke={MOSS} strokeOpacity="0.25" strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" />
      <path d={d} fill="none" stroke={MOSS} strokeWidth="3" strokeLinecap="round" pathLength={100} className="art-draw" />
      {xs.map((x, i) => (
        <g key={i} className="art-dot" style={{ animationDelay: `${250 + i * 260}ms` }}>
          <circle cx={x} cy={y(i)} r="10" fill={MOSS} />
          <text x={x} y={y(i) + 4.5} textAnchor="middle" fontSize="12" fontWeight="700" fill="white">
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Calendar({ day }: { day?: number }) {
  return (
    <div className="art-cal relative h-[68px] w-[60px]" aria-hidden="true">
      <div className="absolute inset-0 overflow-hidden rounded-xl border-2 border-moss bg-white text-center">
        <div className="h-4 bg-moss" />
        <p className="pt-1 font-serif text-[26px] font-medium leading-none text-ink">{day ?? "✓"}</p>
      </div>
      {/* The old page on top turns over and away, showing the day underneath. */}
      <div className="art-page absolute inset-0 overflow-hidden rounded-xl border-2 border-moss bg-white">
        <div className="h-4 bg-moss" />
        <div className="mx-3 mt-3 h-1.5 rounded-full bg-moss/25" />
        <div className="mx-3 mt-2 h-1.5 rounded-full bg-moss/25" />
      </div>
    </div>
  );
}

function MapPin() {
  const clip = useId();
  return (
    <svg viewBox="0 0 120 80" className="h-full" aria-hidden="true">
      <clipPath id={clip}>
        <rect x="22" y="12" width="76" height="60" rx="10" />
      </clipPath>
      <rect x="22" y="12" width="76" height="60" rx="10" fill="#e4ebdd" />
      <path d="M18 51c20-6 34 8 54 0s20-14 30-12M48 8c-4 20 6 38 2 68" fill="none" stroke="white" strokeWidth="5" clipPath={`url(#${clip})`} />
      <ellipse cx="62" cy="54" rx="8" ry="2.6" fill={MOSS} opacity="0.25" className="art-shadow" />
      <g className="art-drop">
        <path d="M62 54s-12-10.6-12-19.6a12 12 0 0 1 24 0C74 43.4 62 54 62 54z" fill={MOSS} />
        <circle cx="62" cy="34" r="4.2" fill="white" />
      </g>
    </svg>
  );
}

function Bulb() {
  return (
    <svg viewBox="0 0 120 80" className="h-full" aria-hidden="true">
      <circle cx="60" cy="34" r="24" fill={MOSS} opacity="0.12" className="art-glow" />
      <path d="M60 16a16 16 0 0 0-9 29.2V52h18v-6.8A16 16 0 0 0 60 16z" fill="white" stroke={MOSS} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M53 58h14M55 64h10" stroke={MOSS} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M56 40l4-6 4 6" fill="none" stroke={MOSS} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="art-pop" />
    </svg>
  );
}

export function CardArt({ type, steps = 3, day }: { type: AnswerType; steps?: number; day?: number }) {
  const warning = type === "warning";
  const art =
    warning ? <Shield /> : type === "explain" ? <Letter /> : type === "steps" ? <Path count={steps} /> : type === "reminder" ? <Calendar day={day} /> : type === "place" ? <MapPin /> : <Bulb />;
  return (
    <div className={`mb-5 flex h-[88px] items-center justify-center rounded-2xl ${warning ? "bg-white/12" : "bg-paper"}`}>
      {art}
    </div>
  );
}
