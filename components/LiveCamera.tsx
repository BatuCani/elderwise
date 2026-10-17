"use client";

import { useEffect, useRef, useState } from "react";
import { sendLiveFrame } from "@/lib/live";

const FRAME_MS = 1000;
const MAX_SIDE = 768;
const QUALITY = 0.7;

type Props = {
  facing: "environment" | "user";
  // Latest frame as a JPEG data URL, so Claude's card can match what the camera sees.
  onFrame: (dataUrl: string) => void;
  onError: () => void;
};

// Live camera inside a Gemini Live conversation: preview on screen, one JPEG frame per second
// into the session so Gemini sees what the person points at.
export function LiveCamera({ facing, onFrame, onError }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const frameCb = useRef(onFrame);
  const errorCb = useRef(onError);
  useEffect(() => {
    frameCb.current = onFrame;
    errorCb.current = onError;
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;
    const canvas = document.createElement("canvas");

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1280 } }, audio: false })
      .then(async (s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        const video = videoRef.current!;
        video.srcObject = s;
        await video.play().catch(() => {});
        setReady(true);
        timer = setInterval(() => {
          if (!video.videoWidth) return;
          const scale = Math.min(1, MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
          canvas.width = Math.round(video.videoWidth * scale);
          canvas.height = Math.round(video.videoHeight * scale);
          canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
          const url = canvas.toDataURL("image/jpeg", QUALITY);
          sendLiveFrame(url.slice(url.indexOf(",") + 1));
          frameCb.current(url);
        }, FRAME_MS);
      })
      .catch(() => {
        if (!cancelled) errorCb.current();
      });

    return () => {
      cancelled = true;
      clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  return (
    <div className="glass w-full rounded-[34px] p-1.5">
      <video
        ref={videoRef}
        muted
        playsInline
        aria-hidden
        className={`aspect-[4/5] max-h-[42dvh] w-full rounded-[28px] border-2 border-moss/40 bg-ink/10 object-cover transition-opacity ${
          ready ? "opacity-100" : "opacity-0"
        } ${facing === "user" ? "-scale-x-100" : ""}`}
      />
    </div>
  );
}
