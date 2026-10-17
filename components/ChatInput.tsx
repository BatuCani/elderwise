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
  t: Copy;
};

// While Claude is thinking, the glow gathers into one beam that sweeps back and forth.
function thinkingMotion() {
  return { gather: 1, offset: Math.sin(performance.now() / 600) * 0.8, heldLevel: 0.55, stretch: 0.3 };
}

// The pill at the bottom of the Talk tab: camera, text field, and the black mic button.
// Fixed px sizes (not rem) so it keeps the same size and position at every text size.
export function ChatInput({ value, onChange, onSubmit, onMic, onPhoto, onRemovePhoto, photo, listening, thinking, stream, t }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const showSend = value.trim().length > 0 && !listening;

  return (
    <div className="flex flex-col gap-[8px]">
      {photo && (
        <div className="flex items-center gap-3 self-start glass rounded-[16px] p-[8px] pr-[12px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" className="h-[56px] w-[56px] rounded-[12px] object-cover" />
          <button onClick={onRemovePhoto} aria-label={t.removePhoto} className="flex h-[48px] w-[48px] items-center justify-center rounded-full text-muted">
            <CloseIcon className="h-[24px] w-[24px]" />
          </button>
        </div>
      )}
      <VoiceBeam
        type="mobile"
        stream={listening ? stream : null}
        motion={thinking ? thinkingMotion : null}
        level={listening && !stream ? 0.4 : undefined}
        sensitivity={listening ? 5 : undefined}
        reach={listening ? 1.8 : undefined}
        colorVariant="colorful"
        theme="light"
      >
        <form
          className="glass flex items-center gap-[4px] rounded-full p-[8px]"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-label={t.attachPhoto}
            className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-white/70 text-ink"
          >
            <CameraIcon className="h-[28px] w-[28px]" />
          </button>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={listening ? t.listening : thinking ? t.thinking : t.inputPlaceholder}
            aria-label={t.inputPlaceholder}
            className="min-h-[48px] min-w-0 flex-1 text-ellipsis bg-transparent px-[4px] text-[21px] text-ink outline-none placeholder:text-muted"
          />
          {showSend ? (
            <button
              type="submit"
              disabled={thinking}
              aria-label={t.send}
              className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-moss text-white disabled:opacity-40"
            >
              <SendIcon className="h-[28px] w-[28px]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onMic}
              disabled={thinking}
              aria-label={listening ? t.stopMic : t.mic}
              className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full bg-moss text-white disabled:opacity-40"
            >
              {listening ? <StopIcon className="h-[28px] w-[28px]" /> : <MicIcon className="h-[28px] w-[28px]" />}
            </button>
          )}
        </form>
      </VoiceBeam>
      <PhotoSheet open={sheetOpen} lang={t === TEXT.de ? "de" : "en"} onClose={() => setSheetOpen(false)} onFile={onPhoto} />
    </div>
  );
}
