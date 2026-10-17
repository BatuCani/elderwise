"use client";

import { useSyncExternalStore } from "react";

// Onboarding answers (who sets Grace up, help topics, tip rhythm), kept in this browser only.
// The name, text size and trusted person go to lib/profile.ts; the voice goes to lib/assistant.ts.

export type SetupFor = "me" | "family";
export type HelpTopic = "scams" | "letters" | "phone" | "health" | "transport" | "family";
export type TipFrequency = "daily" | "weekly" | "ask";
export type Onboarding = { setupFor: SetupFor; topics: HelpTopic[]; tips: TipFrequency; tipTime: string };

export const DEFAULT_ONBOARDING: Onboarding = { setupFor: "me", topics: [], tips: "daily", tipTime: "09:00" };

const KEY = "elderwise.onboarding";
const TOPICS: HelpTopic[] = ["scams", "letters", "phone", "health", "transport", "family"];
const listeners = new Set<() => void>();
let cache: Onboarding | null = null;

function read(): Onboarding {
  if (cache) return cache;
  if (typeof window === "undefined") return DEFAULT_ONBOARDING;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    cache = {
      setupFor: raw.setupFor === "family" ? "family" : "me",
      topics: Array.isArray(raw.topics) ? raw.topics.filter((t: unknown): t is HelpTopic => TOPICS.includes(t as HelpTopic)) : [],
      tips: raw.tips === "weekly" || raw.tips === "ask" ? raw.tips : "daily",
      tipTime: typeof raw.tipTime === "string" && /^\d\d:\d\d$/.test(raw.tipTime) ? raw.tipTime : DEFAULT_ONBOARDING.tipTime,
    };
  } catch {
    cache = DEFAULT_ONBOARDING;
  }
  return cache;
}

export function updateOnboarding(patch: Partial<Onboarding>) {
  cache = { ...read(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Storage can be blocked (private mode); the choice still applies for this visit.
  }
  listeners.forEach((l) => l());
}

export function toggleTopic(topic: HelpTopic) {
  const { topics } = read();
  updateOnboarding({ topics: topics.includes(topic) ? topics.filter((t) => t !== topic) : [...topics, topic] });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useOnboarding(): Onboarding {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_ONBOARDING);
}
