"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { readCode, type Code } from "./codes";
import type { ScanCopy } from "./copy";

type Props = {
  c: ScanCopy;
  mode: "letter" | "code";
  onClose: () => void;
  onPhoto: (dataUrl: string) => void;
  onCode: (code: Code, image: string) => void;
  onUpload: () => void;
};

// Paper in the frame: the picture hardly changes between frames and the middle is bright.
// Crude, but it is only there to tell the person "good, hold still".
function looksLikeLetter(now: Uint8ClampedArray, prev: Uint8ClampedArray | null): boolean {
  let diff = 0;
  let centre = 0;
  let n = 0;
  for (let i = 0; i < now.length; i += 4) {
    const px = i / 4;
    const x = px % 32;
    const y = Math.floor(px / 32);
    const luma = (now[i] * 3 + now[i + 1] * 6 + now[i + 2]) / 10;
    if (prev) diff += Math.abs(luma - (prev[i] * 3 + prev[i + 1] * 6 + prev[i + 2]) / 10);
    if (x > 8 && x < 24 && y > 8 && y < 24) {
      centre += luma;
      n++;
    }
  }
  return !!prev && diff / (now.length / 4) < 8 && centre / n > 120;
}

function frameToDataUrl(video: HTMLVideoElement): string {
  const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.88);
}

// Full-screen back camera with corner guides. Letters: a pill says "Letter detected" when the
// picture is steady, and the big round button takes the photo. Codes are read automatically.
export function CameraStep({ c, mode, onClose, onPhoto, onCode, onUpload }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [detected, setDetected] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;
    const small = document.createElement("canvas");
    small.width = 32;
    small.height = 32;
    const sctx = small.getContext("2d", { willReadFrequently: true })!;
    let prev: Uint8ClampedArray | null = null;
    let steady = 0;
    let busy = false;

    async function tick() {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || doneRef.current) return;
      if (mode === "letter") {
        sctx.drawImage(video, 0, 0, 32, 32);
        const now = sctx.getImageData(0, 0, 32, 32).data;
        steady = looksLikeLetter(now, prev) ? steady + 1 : 0;
        prev = now;
        setDetected(steady >= 3);
        return;
      }
      if (busy) return;
      busy = true;
      try {
        const scale = Math.min(1, 960 / Math.max(video.videoWidth, video.videoHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const code = await readCode(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (code && !doneRef.current) {
          doneRef.current = true;
          setDetected(true);
          navigator.vibrate?.(60);
          const image = canvas.toDataURL("image/jpeg", 0.88);
          setTimeout(() => onCode(code, image), 600);
        }
      } finally {
        busy = false;
      }
    }

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();
        timer = setInterval(tick, mode === "letter" ? 250 : 400);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [mode, onCode]);

  function shoot() {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || doneRef.current) return;
    doneRef.current = true;
    onPhoto(frameToDataUrl(video));
  }

  const corner = `absolute h-12 w-12 border-white ${detected ? "!border-[#9fd18f]" : ""} transition-colors`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0f1311] text-white">
      <header className="relative z-10 flex items-start gap-3 px-5 pt-[calc(16px+env(safe-area-inset-top))]">
        <p className="flex-1 pt-3 font-serif text-[1.35rem] font-medium leading-tight">{mode === "letter" ? c.cameraLetter : c.cameraCode}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label={c.close}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur"
        >
          <CloseIcon className="h-7 w-7" />
        </button>
      </header>

      <div className="relative mx-5 mt-5 flex-1 overflow-hidden rounded-[28px] bg-black">
        <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />

        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center">
            <p className="text-xl leading-snug">{c.noCamera}</p>
            <button type="button" onClick={onUpload} className="min-h-14 rounded-full bg-white px-7 text-lg font-bold text-ink">
              {c.uploadInstead}
            </button>
          </div>
        ) : (
          <div
            className={`pointer-events-none absolute transition-all duration-300 ${
              mode === "letter" ? "inset-x-[10%] inset-y-[12%]" : "left-1/2 top-1/2 aspect-square w-[64%] -translate-x-1/2 -translate-y-1/2"
            } ${detected ? "rounded-2xl bg-[#9fd18f]/10 ring-4 ring-[#9fd18f]/60" : ""}`}
          >
            <span className={`${corner} left-0 top-0 rounded-tl-2xl border-l-4 border-t-4`} />
            <span className={`${corner} right-0 top-0 rounded-tr-2xl border-r-4 border-t-4`} />
            <span className={`${corner} bottom-0 left-0 rounded-bl-2xl border-b-4 border-l-4`} />
            <span className={`${corner} bottom-0 right-0 rounded-br-2xl border-b-4 border-r-4`} />
          </div>
        )}

        {!failed && (
          <p
            role="status"
            className={`absolute inset-x-0 bottom-5 mx-auto flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-lg font-bold transition-colors ${
              detected ? `scan-pop bg-[#9fd18f] text-ink` : "bg-black/50 text-white backdrop-blur"
            }`}
          >
            {detected && <CheckIcon className="h-5 w-5" />}
            {detected
              ? mode === "letter" ? c.detectedLetter : c.detectedCode
              : mode === "letter" ? c.lookingLetter : c.lookingCode}
          </p>
        )}
      </div>

      <div className="flex h-36 items-center justify-center pb-[env(safe-area-inset-bottom)]">
        {mode === "letter" && !failed && (
          <button
            type="button"
            onClick={shoot}
            aria-label={c.shutter}
            className={`flex h-22 w-22 items-center justify-center rounded-full border-4 transition-colors active:scale-95 ${
              detected ? "border-[#9fd18f]" : "border-white"
            }`}
          >
            <span className="h-17 w-17 rounded-full bg-white" />
          </button>
        )}
      </div>
    </div>
  );
}
