"use client";

import { useEffect, useState } from "react";
import { BotAvatar, type BotAvatarProps } from "bot-avatars";
import { PERSONALITIES, SPEEDS, updateAssistant, useAssistant, VOICES, type Personality, type VoiceId } from "@/lib/assistant";
import { updateProfile, useProfile } from "@/lib/profile";
import { LOCALE } from "@/lib/speech";
import { SpeakerIcon } from "./icons";
import { CARD, Section } from "./profile/ui";

// "Your assistant" on the Profile tab: name, voice, personality and speaking speed of the voice agent.
// Patterns from Grok's voice settings (voice row that opens a list, round personality tiles)
// and LangLearn (speed chips).

const TEXT = {
  en: {
    title: "Your assistant",
    name: "Name",
    voice: "Voice",
    play: "Play",
    previewNote: "The preview uses your phone's voice.",
    personality: "Personality",
    speed: "Speaking speed",
    sample: (me: string, assistant: string) => `Hello ${me}, I'm ${assistant}. I'm here to help.`,
  },
  de: {
    title: "Ihre Assistenz",
    name: "Name",
    voice: "Stimme",
    play: "Anhören",
    previewNote: "Die Hörprobe nutzt die Stimme Ihres Telefons.",
    personality: "Persönlichkeit",
    speed: "Sprechtempo",
    sample: (me: string, assistant: string) => `Hallo ${me}, ich bin ${assistant}. Ich bin für Sie da.`,
  },
} as const;

const svg = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

// Each personality has its own animated bot (bot-avatars, MIT). Different seeds keep them from blinking in unison.
export const PERSONALITY_AVATARS: Record<Personality, BotAvatarProps> = {
  patient: { type: "flower", face: "mouth", color: "#3F5A3A", seed: 0.1 },
  cheerful: { type: "star", hat: "party", seed: 0.35 },
  short: { type: "pebble", glasses: "round", seed: 0.6 },
  storyteller: { type: "cloud", hat: "beret", seed: 0.85 },
};

export function PersonalityAvatar({
  personality,
  size,
  working = false,
  label,
}: {
  personality: Personality;
  size: number;
  working?: boolean;
  label: string;
}) {
  return (
    <BotAvatar
      {...PERSONALITY_AVATARS[personality]}
      shading="fabric"
      size={size}
      state={working ? "working" : "default"}
      aria-label={label}
    />
  );
}

const Check = ({ className }: { className?: string }) => (
  <svg {...svg} strokeWidth={3} className={className}>
    <path d="M5 12l5 5 9-10" />
  </svg>
);

function Chevron({ open }: { open: boolean }) {
  return (
    <svg {...svg} className={`h-6 w-6 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// Short sample in the phone's own voice; the real voice is heard in a conversation on the Talk tab.
function preview(text: string, locale: string, rate: number, pitch: number) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale;
  u.rate = rate;
  u.pitch = pitch;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.replace("_", "-") === locale);
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

export function AssistantSettings() {
  const profile = useProfile();
  const assistant = useAssistant();
  const L = TEXT[profile.lang];
  const [voicesOpen, setVoicesOpen] = useState(false);
  const [draftName, setDraftName] = useState<string | null>(null);
  // The personality just picked hops and laughs for a moment.
  const [cheering, setCheering] = useState<Personality | null>(null);
  useEffect(() => {
    if (!cheering) return;
    const t = setTimeout(() => setCheering(null), 1500);
    return () => clearTimeout(t);
  }, [cheering]);
  const current = VOICES.find((v) => v.id === assistant.voice) ?? VOICES[0];
  // The chip closest to the saved speed is the selected one (the Speaking speed slider may sit in between).
  const nearest = SPEEDS.reduce((a, b) => (Math.abs(b - profile.speechRate) < Math.abs(a - profile.speechRate) ? b : a));

  function play(id: VoiceId) {
    const v = VOICES.find((x) => x.id === id) ?? VOICES[0];
    preview(L.sample(profile.name, assistant.name), LOCALE[profile.lang], profile.speechRate, v.pitch);
  }

  function saveName() {
    if (draftName === null) return;
    const name = draftName.trim().slice(0, 30);
    if (name) updateAssistant({ name });
    setDraftName(null);
  }

  return (
    <Section title={L.title}>
      <div className={`${CARD} flex flex-col gap-6 p-5`}>
        {/* Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="assistant-name" className="text-lg font-bold text-ink">
            {L.name}
          </label>
          <div className="flex items-center gap-3">
            <span className="shrink-0">
              <PersonalityAvatar personality={assistant.personality} size={36} label={assistant.name} />
            </span>
            <input
              id="assistant-name"
              value={draftName ?? assistant.name}
              maxLength={30}
              autoComplete="off"
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className="min-h-14 w-full rounded-2xl border-2 border-[#e6e1d6] bg-paper/60 px-4 font-serif text-2xl text-ink outline-none focus:border-moss"
            />
          </div>
        </div>

        {/* Voice: one row that opens the list */}
        <div className="flex flex-col gap-2">
          <p className="text-lg font-bold text-ink">{L.voice}</p>
          <button
            type="button"
            aria-expanded={voicesOpen}
            aria-controls="assistant-voices"
            onClick={() => setVoicesOpen((o) => !o)}
            className="flex min-h-16 w-full items-center gap-4 rounded-2xl border border-[#e6e1d6] bg-paper/60 px-4 py-3 text-left"
          >
            <SpeakerIcon className="h-7 w-7 shrink-0 text-moss" />
            <span className="min-w-0 flex-1">
              <span className="block text-xl font-bold text-ink">{current.label}</span>
              <span className="block text-base leading-snug text-muted">{current[profile.lang]}</span>
            </span>
            <Chevron open={voicesOpen} />
          </button>
          {voicesOpen && (
            <ul id="assistant-voices" className="flex flex-col gap-2">
              {VOICES.map((v) => {
                const selected = v.id === assistant.voice;
                return (
                  <li key={v.id} className={`flex items-center gap-2 rounded-2xl p-2 ${selected ? "bg-learn-bg" : "bg-paper/60"}`}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateAssistant({ voice: v.id })}
                      className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 text-left"
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          selected ? "bg-moss text-white" : "border-2 border-muted/50"
                        }`}
                      >
                        {selected && <Check className="h-5 w-5" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-lg font-bold text-ink">{v.label}</span>
                        <span className="block text-base leading-snug text-muted">{v[profile.lang]}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => play(v.id)}
                      aria-label={`${L.play}: ${v.label}`}
                      className="flex min-h-12 shrink-0 items-center gap-1.5 rounded-full bg-moss px-4 text-base font-bold text-white"
                    >
                      <svg {...svg} className="h-5 w-5" fill="currentColor" stroke="none">
                        <path d="M8 5.5v13l11-6.5z" />
                      </svg>
                      {L.play}
                    </button>
                  </li>
                );
              })}
              <li className="px-2 text-base text-muted">{L.previewNote}</li>
            </ul>
          )}
        </div>

        {/* Personality: round tiles */}
        <div className="flex flex-col gap-3">
          <p className="text-lg font-bold text-ink">{L.personality}</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4">
            {PERSONALITIES.map((p) => {
              const selected = p.id === assistant.personality;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={selected}
                  aria-label={p[profile.lang]}
                  onClick={() => {
                    updateAssistant({ personality: p.id });
                    setCheering(p.id);
                  }}
                  className="flex min-h-12 flex-col items-center gap-2 text-center"
                >
                  <span
                    className={`relative flex h-20 w-20 items-center justify-center rounded-full ${
                      selected ? "bg-learn-bg ring-2 ring-moss" : "bg-paper"
                    }`}
                  >
                    <PersonalityAvatar personality={p.id} size={64} working={cheering === p.id} label={p[profile.lang]} />
                    {selected && (
                      <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-moss text-white">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </span>
                  <span className={`text-base leading-tight ${selected ? "font-bold text-ink" : "text-muted"}`}>{p[profile.lang]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Speed: chips, the same value as the Speaking speed slider above */}
        <div className="flex flex-col gap-3">
          <p className="text-lg font-bold text-ink">{L.speed}</p>
          <div className="flex flex-wrap gap-2">
            {SPEEDS.map((s) => {
              const selected = s === nearest;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => updateProfile({ speechRate: s })}
                  className={`min-h-12 min-w-16 rounded-full px-4 text-lg font-bold ${
                    selected ? "bg-moss text-white" : "bg-paper text-ink"
                  }`}
                >
                  {s === 1 ? "1.0" : String(s)}x
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
