"use client";

import { useRef } from "react";
import { CameraIcon, CheckIcon } from "@/components/icons";
import type { ScanCopy } from "./copy";
import { CodeIcon, UploadIcon } from "./icons";

export type Example = { key: "doctor" | "pension" | "sms" | "qr"; src: string; code: boolean };

// Fake but realistic demo images in public/samples/. No real personal data.
export const EXAMPLES: Example[] = [
  { key: "pension", src: "/samples/pension-letter.svg", code: false },
  { key: "doctor", src: "/samples/doctor-letter.svg", code: false },
  { key: "sms", src: "/samples/scam-sms.svg", code: false },
  { key: "qr", src: "/samples/payment-qr.png", code: true },
];

type Props = {
  c: ScanCopy;
  onUpload: (file: File) => void;
  onPicture: () => void;
  onCode: () => void;
  onExample: (ex: Example) => void;
};

// A tiny letter with a line sweeping over it, and the promise as a checklist that ticks.
function IntroCard({ c }: { c: ScanCopy }) {
  return (
    <section className="glass flex items-center gap-5 rounded-[28px] p-5">
      <div className="relative h-28 w-22 shrink-0 overflow-hidden rounded-xl bg-white shadow-[0_6px_16px_rgba(30,36,32,0.12)]" aria-hidden="true">
        <div className="absolute left-3 top-3 h-2.5 w-9 rounded-full bg-moss/70" />
        {[26, 36, 46, 56].map((top, i) => (
          <div key={top} className="absolute left-3 h-1.5 rounded-full bg-line" style={{ top, width: i % 2 ? 40 : 56 }} />
        ))}
        <div className="absolute bottom-3 left-3 h-3 w-10 rounded-md bg-moss/25" />
        <div className="scan-sweep" />
      </div>
      <div className="min-w-0">
        <p className="font-serif text-[1.3rem] font-medium leading-tight text-ink">{c.introTitle}</p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {c.introCheck.map((line, i) => (
            <li key={line} className={`scan-tick flex items-center gap-2 text-base font-bold text-moss`} style={{ animationDelay: `${0.6 + i * 0.7}s` }}>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-moss text-white">
                <CheckIcon className="h-4 w-4" />
              </span>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// First screen: three big choices, then sample pictures so the flow works without a camera.
export function ChooseStep({ c, onUpload, onPicture, onCode, onExample }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const row = "glass flex min-h-20 w-full items-center gap-4 rounded-[24px] px-5 py-4 text-left transition-transform active:scale-[0.98]";
  const icon = "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-moss text-white";

  return (
    <div className="flex flex-col gap-6">
      <IntroCard c={c} />

      <div className="flex flex-col gap-3">
        <button type="button" onClick={() => fileRef.current?.click()} className={row}>
          <span className={icon}>
            <UploadIcon className="h-7 w-7" />
          </span>
          <span className="flex flex-col">
            <span className="text-[1.15rem] font-bold leading-tight text-ink">{c.upload}</span>
            <span className="text-base text-muted">{c.uploadSub}</span>
          </span>
        </button>
        <button type="button" onClick={onPicture} className={row}>
          <span className={icon}>
            <CameraIcon className="h-7 w-7" />
          </span>
          <span className="flex flex-col">
            <span className="text-[1.15rem] font-bold leading-tight text-ink">{c.picture}</span>
            <span className="text-base text-muted">{c.pictureSub}</span>
          </span>
        </button>
        <button type="button" onClick={onCode} className={row}>
          <span className={icon}>
            <CodeIcon className="h-7 w-7" />
          </span>
          <span className="flex flex-col">
            <span className="text-[1.15rem] font-bold leading-tight text-ink">{c.code}</span>
            <span className="text-base text-muted">{c.codeSub}</span>
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) onUpload(f);
          }}
        />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold text-muted">{c.examples}</h2>
        <div className="grid grid-cols-2 gap-3">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.key}
              type="button"
              onClick={() => onExample(ex)}
              className="glass flex flex-col overflow-hidden rounded-[20px] text-left transition-transform active:scale-[0.98]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ex.src} alt="" className={`aspect-[4/3] w-full bg-white ${ex.code ? "object-contain p-3" : "object-cover object-top"}`} />
              <span className="min-h-14 px-3 py-3 text-base font-bold leading-tight text-ink">{c.exampleNames[ex.key]}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
