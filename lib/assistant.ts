"use client";

import type { LiveConnectConfig } from "@google/genai";
import { useSyncExternalStore } from "react";

// "Your assistant": name, voice and personality of the voice agent, kept in this browser only.
// The speaking speed is NOT stored here: it is the same value as the "Speaking speed" in lib/profile.ts,
// so there is only one speed setting in the app.

export type VoiceId = "Aoede" | "Kore" | "Charon" | "Puck" | "Fenrir";
export type Personality = "patient" | "cheerful" | "short" | "storyteller";
export type Assistant = { name: string; voice: VoiceId; personality: Personality };

export const DEFAULT_ASSISTANT: Assistant = { name: "Grace", voice: "Aoede", personality: "patient" };
// The app was called Elderwise before; a name saved under the old default becomes Grace.
const OLD_DEFAULT_NAME = "Elderwise";

// Gemini Live prebuilt voices. `pitch` only shapes the preview, which uses the phone's own voice.
export const VOICES: { id: VoiceId; label: string; en: string; de: string; pitch: number }[] = [
  { id: "Aoede", label: "Aoede", en: "Warm and calm, female", de: "Warm und ruhig, weiblich", pitch: 1.1 },
  { id: "Kore", label: "Kore", en: "Clear and friendly, female", de: "Klar und freundlich, weiblich", pitch: 1.2 },
  { id: "Charon", label: "Charon", en: "Deep and calm, male", de: "Tief und ruhig, männlich", pitch: 0.75 },
  { id: "Puck", label: "Puck", en: "Cheerful and bright", de: "Fröhlich und hell", pitch: 1.3 },
  { id: "Fenrir", label: "Fenrir", en: "Lively and energetic", de: "Lebhaft und energisch", pitch: 0.9 },
];

// One sentence each, added to the voice agent's instructions.
export const PERSONALITIES: { id: Personality; en: string; de: string; sentence: string }[] = [
  { id: "patient", en: "Patient helper", de: "Geduldige Hilfe", sentence: "Be patient and gentle. It is fine to repeat things in other words." },
  { id: "cheerful", en: "Cheerful friend", de: "Fröhliche Freundin", sentence: "Be cheerful and warm, with a light touch of humour." },
  { id: "short", en: "Short and clear", de: "Kurz und klar", sentence: "Answer in one short sentence." },
  { id: "storyteller", en: "Storyteller", de: "Erzählerin", sentence: "When it helps, explain with one small everyday example or comparison." },
];

export const SPEEDS = [0.7, 0.85, 1.0, 1.15, 1.3] as const;

const KEY = "elderwise.assistant";
// Same key as lib/profile.ts, read here only to tell the live voice how fast to talk.
const PROFILE_KEY = "elderwise.profile";
const listeners = new Set<() => void>();
let cache: Assistant | null = null;

function isVoice(v: unknown): v is VoiceId {
  return VOICES.some((x) => x.id === v);
}
function isPersonality(v: unknown): v is Personality {
  return PERSONALITIES.some((x) => x.id === v);
}

export function readAssistant(): Assistant {
  if (cache) return cache;
  if (typeof window === "undefined") return DEFAULT_ASSISTANT;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    cache = {
      name:
        typeof raw.name === "string" && raw.name.trim() && raw.name.trim() !== OLD_DEFAULT_NAME
          ? raw.name.trim().slice(0, 30)
          : DEFAULT_ASSISTANT.name,
      voice: isVoice(raw.voice) ? raw.voice : DEFAULT_ASSISTANT.voice,
      personality: isPersonality(raw.personality) ? raw.personality : DEFAULT_ASSISTANT.personality,
    };
  } catch {
    cache = DEFAULT_ASSISTANT;
  }
  return cache;
}

export function updateAssistant(patch: Partial<Assistant>) {
  cache = { ...readAssistant(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Storage can be blocked (private mode); the change still applies for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAssistant(): Assistant {
  return useSyncExternalStore(subscribe, readAssistant, () => DEFAULT_ASSISTANT);
}

function readSpeechRate(): number {
  try {
    const rate = Number(JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "{}").speechRate);
    return Number.isFinite(rate) && rate > 0 ? rate : 0.9;
  } catch {
    return 0.9;
  }
}

// The extra sentences for the voice agent: its name, its personality and its pace.
export function assistantInstruction(a: Assistant, rate: number): string {
  const personality = PERSONALITIES.find((p) => p.id === a.personality)?.sentence ?? "";
  const pace =
    rate < 0.9
      ? "Speak noticeably slower than usual, with short pauses between sentences."
      : rate > 1.1
        ? "Speak a little faster than usual."
        : "";
  return [`Your name is ${a.name}. If someone asks who you are, say you are ${a.name}.`, personality, pace].filter(Boolean).join(" ");
}

// Adds the chosen voice, name, personality and pace to the Gemini Live session config.
export function withAssistant(config: LiveConnectConfig): LiveConnectConfig {
  const a = readAssistant();
  const extra = assistantInstruction(a, readSpeechRate());
  return {
    ...config,
    systemInstruction:
      typeof config.systemInstruction === "string" ? `${config.systemInstruction}\n\n${extra}` : config.systemInstruction,
    speechConfig: { ...config.speechConfig, voiceConfig: { prebuiltVoiceConfig: { voiceName: a.voice } } },
  };
}
