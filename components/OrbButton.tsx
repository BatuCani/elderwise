// The big glowing orb: the one button older adults need to press.
export type OrbState = "idle" | "listening" | "thinking";

export function OrbButton({ state, label, onPress }: { state: OrbState; label: string; onPress: () => void }) {
  const stateClass = state === "listening" ? "orb-listening" : state === "thinking" ? "orb-thinking" : "";
  return (
    <button
      onClick={onPress}
      aria-label={label}
      className={`orb flex h-56 w-56 items-center justify-center rounded-full text-center text-3xl font-bold text-white ${stateClass}`}
    >
      <span className="px-6">{label}</span>
    </button>
  );
}
