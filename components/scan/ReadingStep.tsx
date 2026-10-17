"use client";

import type { Field } from "./codes";
import type { ScanCopy } from "./copy";

type Props = {
  c: ScanCopy;
  image: string;
  code: boolean;
  // null while Claude is still reading; then the rows fill in one by one.
  fields: Field[] | null;
  error: boolean;
  onNext: () => void;
  onRetry: () => void;
};

// Where the highlight boxes land on a letter: sender, reference block, the main paragraph, the amount.
const LETTER_BOXES = [
  { left: "8%", top: "6%", width: "58%", height: "9%" },
  { left: "52%", top: "20%", width: "40%", height: "8%" },
  { left: "8%", top: "44%", width: "84%", height: "16%" },
  { left: "8%", top: "66%", width: "84%", height: "12%" },
];
const CODE_BOXES = [{ left: "14%", top: "14%", width: "72%", height: "72%" }];

// "Reading your letter": the picture large with a sweeping line and boxes over the key parts,
// then what was found as labelled rows.
export function ReadingStep({ c, image, code, fields, error, onNext, onRetry }: Props) {
  const reading = !fields && !error;
  const boxes = code ? CODE_BOXES : LETTER_BOXES;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-serif text-[1.9rem] font-medium leading-tight text-ink">
          {error ? c.error : fields ? c.found : code ? c.readingCode : c.readingLetter}
        </h1>
        {reading && <p className={`scan-pulse mt-1 text-lg text-muted`}>{c.readingSub}</p>}
      </div>

      <div className="glass rounded-[28px] p-3">
        <div className={`relative overflow-hidden rounded-[20px] bg-white ${fields ? "max-h-56" : "max-h-[46dvh]"} transition-[max-height] duration-500`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className={`w-full ${code ? "mx-auto max-w-64 object-contain p-4" : "object-cover object-top"}`} />
          {reading && (
            <>
              {boxes.map((b, i) => (
                <span key={i} className="scan-box" style={{ ...b, animationDelay: `${i * 0.9}s` }} />
              ))}
              <span className="scan-sweep" />
            </>
          )}
        </div>
      </div>

      {fields && fields.length > 0 && (
        <dl className="glass flex flex-col rounded-[24px] px-5 py-2">
          {fields.map((f, i) => (
            <div
              key={`${f.label}-${i}`}
              className={`scan-row flex flex-col gap-0.5 border-line py-3 [&:not(:last-child)]:border-b`}
              style={{ animationDelay: `${i * 0.35}s` }}
            >
              <dt className="text-base font-bold text-muted">{f.label}</dt>
              <dd className="break-words text-[1.15rem] font-bold leading-snug text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {error ? (
        <button type="button" onClick={onRetry} className="min-h-16 w-full rounded-full bg-moss px-6 text-[1.15rem] font-bold text-white">
          {c.tryAgain}
        </button>
      ) : (
        fields && (
          <button
            type="button"
            onClick={onNext}
            className={`scan-row min-h-16 w-full rounded-full bg-moss px-6 text-[1.15rem] font-bold text-white shadow-[0_14px_34px_rgba(63,90,58,0.3)]`}
            style={{ animationDelay: `${fields.length * 0.35}s` }}
          >
            {c.next}
          </button>
        )
      )}
    </div>
  );
}
