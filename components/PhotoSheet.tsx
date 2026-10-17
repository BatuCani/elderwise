"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { Lang } from "@/prompts/elderwise";
import { BackIcon, CameraIcon, CloseIcon } from "./icons";

const noSubscribe = () => () => {};

type Props = {
  open: boolean;
  lang: Lang;
  onClose: () => void;
  onFile: (file: File) => void;
};

// Fake but realistic demo images in public/samples/. No real personal data.
const EXAMPLES = [
  { src: "/samples/scam-sms.svg", en: "Parcel text message", de: "SMS vom Paketdienst" },
  { src: "/samples/grandchild-whatsapp.svg", en: "“Hi Grandma” message", de: "„Hallo Oma“-Nachricht" },
  { src: "/samples/doctor-letter.svg", en: "Doctor's letter", de: "Arztbrief" },
  { src: "/samples/medication-box.svg", en: "Medicine box", de: "Medikamentenschachtel" },
  { src: "/samples/pension-letter.svg", en: "Pension letter", de: "Rentenbescheid" },
];

const COPY = {
  en: {
    title: "Add a photo",
    examplesTitle: "Examples",
    camera: "Take a photo",
    library: "Choose from my photos",
    example: "Try an example",
    back: "Back",
    cancel: "Cancel",
  },
  de: {
    title: "Foto hinzufügen",
    examplesTitle: "Beispiele",
    camera: "Foto aufnehmen",
    library: "Aus meinen Fotos wählen",
    example: "Ein Beispiel ausprobieren",
    back: "Zurück",
    cancel: "Abbrechen",
  },
};

const PhotosIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="m21 16-5-5-9 9" />
  </svg>
);
const SparkIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
  </svg>
);

// Bottom sheet behind the camera button: take a photo, pick one, or try a sample image.
export function PhotoSheet({ open, lang, onClose, onFile }: Props) {
  const c = COPY[lang];
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const [showExamples, setShowExamples] = useState(false);
  const portalReady = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );

  // Back to the main options once the sheet has slid away.
  function close() {
    onClose();
    setTimeout(() => setShowExamples(false), 250);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      onClose();
      setTimeout(() => setShowExamples(false), 250);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) {
      onFile(f);
      close();
    }
  }

  // A sample image goes through the same path as a real photo.
  async function pickExample(src: string) {
    close();
    const blob = await (await fetch(src)).blob();
    onFile(new File([blob], src.split("/").pop()!, { type: blob.type }));
  }

  const bigButton = "flex min-h-14 w-full items-center gap-4 rounded-2xl bg-white/75 px-5 py-3 text-left text-[20px] font-bold text-ink active:bg-white";

  return (
    <>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} />
      <input ref={libraryRef} type="file" accept="image/*" className="hidden" onChange={pick} />
      {portalReady &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={showExamples ? c.examplesTitle : c.title}
            className={`fixed inset-0 z-50 transition-[visibility] ${open ? "visible" : "invisible delay-300"}`}
          >
            <div onClick={close} className={`absolute inset-0 bg-ink/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`} />
            <div
              className={`glass absolute inset-x-0 bottom-0 mx-auto max-h-[88dvh] max-w-xl overflow-y-auto rounded-t-[32px] px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] transition-transform duration-300 ease-out ${
                open ? "translate-y-0" : "translate-y-full"
              }`}
              style={{ background: "rgba(250, 248, 243, 0.9)" }}
            >
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted/40" />
              <div className="mb-4 flex items-center gap-2">
                {showExamples && (
                  <button
                    onClick={() => setShowExamples(false)}
                    aria-label={c.back}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/75 text-ink"
                  >
                    <BackIcon className="h-6 w-6" />
                  </button>
                )}
                <h2 className="flex-1 font-serif text-[28px] font-medium text-ink">{showExamples ? c.examplesTitle : c.title}</h2>
                <button
                  onClick={close}
                  aria-label={c.cancel}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/75 text-muted"
                >
                  <CloseIcon className="h-6 w-6" />
                </button>
              </div>

              {showExamples ? (
                <div className="grid grid-cols-2 gap-3">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.src}
                      onClick={() => {
                        pickExample(ex.src);
                      }}
                      className="flex flex-col overflow-hidden rounded-2xl bg-white/75 text-left active:bg-white"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ex.src} alt="" className="aspect-[4/5] w-full object-cover" />
                      <span className="min-h-14 px-3 py-3 text-[19px] font-bold leading-tight text-ink">{ex[lang]}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button onClick={() => cameraRef.current?.click()} className={bigButton}>
                    <CameraIcon className="h-8 w-8 shrink-0 text-moss" />
                    {c.camera}
                  </button>
                  <button onClick={() => libraryRef.current?.click()} className={bigButton}>
                    <PhotosIcon className="h-8 w-8 shrink-0 text-moss" />
                    {c.library}
                  </button>
                  <button onClick={() => setShowExamples(true)} className={bigButton}>
                    <SparkIcon className="h-8 w-8 shrink-0 text-moss" />
                    {c.example}
                  </button>
                </div>
              )}

              <button onClick={close} className="mt-4 min-h-14 w-full rounded-2xl bg-moss px-5 py-3 text-[20px] font-bold text-white">
                {c.cancel}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
