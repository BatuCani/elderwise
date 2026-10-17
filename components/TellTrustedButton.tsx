"use client";

import { useState } from "react";
import { useProfile } from "@/lib/profile";
import type { Answer, Lang } from "@/prompts/elderwise";
import { GlassSheet } from "./GlassSheet";
import { ChatIcon, PhoneIcon } from "./icons";

type Props = { answer: Answer; label: string; warning: boolean };

const COPY: Record<Lang, {
  title: (name: string) => string;
  message: (name: string) => string;
  share: string;
  call: (name: string) => string;
  cancel: string;
  hint: string;
  text: (a: { trusted: string; me: string; headline: string; sentence: string; warning: boolean }) => string;
}> = {
  en: {
    title: (n) => `Tell ${n}`,
    message: (n) => `Send ${n} a message`,
    share: "Share another way (WhatsApp, email…)",
    call: (n) => `Call ${n}`,
    cancel: "Cancel",
    hint: "The message is written for you. You can still change it before you send it.",
    text: ({ trusted, me, headline, sentence, warning }) =>
      `Hi ${trusted}, ${warning ? "Elderwise warned me about a message" : "I asked Elderwise for help"}: "${headline}". ${sentence} Can you call me when you have a moment? - ${me}`,
  },
  de: {
    title: (n) => `${n} Bescheid geben`,
    message: (n) => `${n} eine Nachricht schicken`,
    share: "Anders teilen (WhatsApp, E-Mail…)",
    call: (n) => `${n} anrufen`,
    cancel: "Abbrechen",
    hint: "Die Nachricht ist schon geschrieben. Sie können sie vor dem Senden noch ändern.",
    text: ({ trusted, me, headline, sentence, warning }) =>
      `Hallo ${trusted}, ${warning ? "Elderwise hat mich vor einer Nachricht gewarnt" : "ich habe Elderwise um Hilfe gebeten"}: „${headline}“. ${sentence} Kannst du mich anrufen, wenn du Zeit hast? - ${me}`,
  },
};

// "Tell my daughter Anna": opens a sheet to message (SMS or share sheet) or call the trusted person,
// with the text already written from the answer. Name and number come from the Profile tab.
export function TellTrustedButton({ answer, label, warning }: Props) {
  const profile = useProfile();
  const c = COPY[profile.lang];
  const [open, setOpen] = useState(false);
  const trusted = profile.trusted.name;
  const phone = profile.trusted.phone.replace(/[^\d+]/g, "");
  const text = c.text({ trusted, me: profile.name, headline: answer.headline, sentence: answer.sentence, warning });
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  const big = "flex min-h-14 w-full items-center gap-4 rounded-2xl px-5 py-3 text-left text-[20px] font-bold";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-[28px] px-5 py-3 text-center text-lg font-bold ${
          warning ? "bg-white text-warn" : "bg-moss text-white"
        }`}
      >
        <ChatIcon className="h-6 w-6 shrink-0" />
        {label}
      </button>

      {/* Title uses the current trusted person, even on older answers saved before an edit. */}
      <GlassSheet open={open} title={c.title(trusted)} closeLabel={c.cancel} onClose={() => setOpen(false)}>
        {/* Preview of the message, so there are no surprises. */}
        <blockquote className="mb-2 rounded-2xl bg-white/80 px-5 py-4 text-[19px] leading-snug text-ink">{text}</blockquote>
        <p className="mb-4 px-1 text-[17px] leading-snug text-muted">{c.hint}</p>

        <div className="flex flex-col gap-3">
          {/* "?&body=" works on both iPhone and Android. */}
          <a href={`sms:${phone}?&body=${encodeURIComponent(text)}`} onClick={() => setOpen(false)} className={`${big} bg-moss text-white`}>
            <ChatIcon className="h-8 w-8 shrink-0" />
            {c.message(trusted)}
          </a>
          <a href={`tel:${phone}`} onClick={() => setOpen(false)} className={`${big} bg-white/75 text-ink active:bg-white`}>
            <PhoneIcon className="h-8 w-8 shrink-0 text-moss" />
            {c.call(trusted)}
          </a>
          {canShare && (
            <button
              type="button"
              onClick={() => {
                navigator.share({ text }).catch(() => {
                  // Closing the share sheet without sharing is fine.
                });
                setOpen(false);
              }}
              className={`${big} bg-white/75 text-ink active:bg-white`}
            >
              <ShareIcon className="h-8 w-8 shrink-0 text-moss" />
              {c.share}
            </button>
          )}
        </div>

        <button onClick={() => setOpen(false)} className="mt-4 min-h-14 w-full rounded-2xl px-5 py-3 text-[20px] font-bold text-muted">
          {c.cancel}
        </button>
      </GlassSheet>
    </>
  );
}

const ShareIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
    <path d="M12 3v12M7 8l5-5 5 5" />
    <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </svg>
);
