"use client";

type Props = { text: string; placeholder: string };

// Live transcript for reassurance while talking: only the last 3 words, one per line, very big.
// The newest word is darkest and pops in; older words fade out above it.
export function LiveWords({ text, placeholder }: Props) {
  const all = text.trim().split(/\s+/).filter(Boolean);
  const start = Math.max(0, all.length - 3);
  const words = all.slice(start);

  return (
    // Fixed height for 3 lines, so the buttons below never jump while words come in.
    <div aria-hidden className="mb-8 flex h-[calc(3*1.15*var(--text-live))] w-full flex-col items-center justify-end overflow-hidden">
      {words.length === 0 ? (
        <p className="font-serif text-transcript font-medium text-muted">{placeholder}</p>
      ) : (
        words.map((w, i) => {
          const age = words.length - 1 - i; // 0 = newest
          return (
            <p
              // Key by position in the whole sentence, so only a truly new word animates.
              key={start + i}
              // A long word ("Medikamentenschachtel") shrinks to fit one line instead of wrapping.
              style={{ fontSize: `min(var(--text-live), calc((min(100vw, 480px) - 48px) / ${(w.length * 0.56).toFixed(2)}))` }}
              className={`max-w-full whitespace-nowrap font-serif font-medium leading-[1.15] ${
                age === 0 ? "word-in text-ink" : age === 1 ? "text-ink/55" : "text-ink/30"
              }`}
            >
              {w}
            </p>
          );
        })
      )}
    </div>
  );
}
