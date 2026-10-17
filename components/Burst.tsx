import type { CSSProperties } from "react";

// A small, calm moss confetti burst for success moments. Put it inside a `relative` element.
const DOTS = 10;

export function Burst({ distance = 34 }: { distance?: number }) {
  return (
    <span aria-hidden className="burst">
      {Array.from({ length: DOTS }, (_, i) => (
        <span
          key={i}
          className="burst-dot"
          style={{ "--a": `${(360 / DOTS) * i}deg`, "--d": `${distance + (i % 2) * 10}px` } as CSSProperties}
        />
      ))}
    </span>
  );
}
