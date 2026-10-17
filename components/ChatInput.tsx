"use client";

import { useState } from "react";
import { VoiceBeam } from "voice-glow";
import { TEXT, type Copy } from "@/app/copy";
import { CameraIcon, CloseIcon, MicIcon, SendIcon, StopIcon } from "./icons";
import { PhotoSheet } from "./PhotoSheet";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onMic: () => void;
  onPhoto: (file: File) => void;
  onRemovePhoto: () => void;
  photo: string | null;
  listening: boolean;
  thinking: boolean;
  stream: MediaStream | null;
  // Live conversation: glow level sampled every frame (the person's or Elderwise's voice).
  level?: () => number;
  t: Copy;
};

// While Claude is thinking, the glow gathers into one beam that sweeps back and forth.
function thinkingMotion() {
  return { gather: 1, offset: Math.sin(performance.now() / 600) * 0.8, heldLevel: 0.55, stretch: 0.3 };
}

// The pill at the bottom of the Talk tab: camera, text field, and the black mic button.
export function ChatInput({ value, onChange, onSubmit, onMic, onPhoto, onRemovePhoto, photo, listening, thinking, stream, level, t }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const showSend = value.trim().length > 0 && !listening;

  return (
    <div className="flex flex-col gap-2">
      {photo && (
        <div className="flex items-center gap-3 self-start glass rounded-2xl p-2 pr-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="h-14 w-14 rounded-xl object-cover" />
          <button onClick={onRemovePhoto} aria-label={t.removePhoto} className="flex h-12 w-12 items-center justify-center rounded-full text-muted">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
      )}
      <VoiceBeam
        type="mobile"
        stream={listening ? stream : null}
        motion={thinking ? thinkingMotion : null}
        level={level ?? (listening && !stream ? 0.4 : undefined)}
        sensitivity={listening ? 5 : undefined}
        reach={listening ? 1.8 : undefined}
        colorVariant="colorful"
        theme="light"
      >
        <form
          className="glass flex items-center gap-1 rounded-full p-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-label={t.attachPhoto}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/70 text-ink"
          >
            <CameraIcon className="h-7 w-7" />
          </button>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={listening ? t.listening : thinking ? t.thinking : t.inputPlaceholder}
            aria-label={t.inputPlaceholder}
            className="min-h-12 min-w-0 flex-1 bg-transparent px-1 text-lg text-ink outline-none placeholder:text-muted"
          />
          {showSend ? (
            <button
              type="submit"
              disabled={thinking}
              aria-label={t.send}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-moss text-white disabled:opacity-40"
            >
              <SendIcon className="h-7 w-7" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onMic}
              disabled={thinking && !listening}
              aria-label={listening ? t.stopMic : t.mic}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-moss text-white disabled:opacity-40"
            >
              {listening ? <StopIcon className="h-7 w-7" /> : <MicIcon className="h-7 w-7" />}
            </button>
          )}
        </form>
      </VoiceBeam>
      <PhotoSheet open={sheetOpen} lang={t === TEXT.de ? "de" : "en"} onClose={() => setSheetOpen(false)} onFile={onPhoto} />
    </div>
  );
}
