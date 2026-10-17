"use client";

import { useSyncExternalStore } from "react";
import type { Lang } from "@/prompts/elderwise";

// Fake demo profile, kept in this browser's localStorage only.
export type FontSize = "normal" | "large" | "xlarge";

export type Profile = {
  name: string;
  fontSize: FontSize;
  speechRate: number; // 0.6 (slow) to 1.2 (fast), passed to speechSynthesis
  lang: Lang;
  trusted: { name: string; relation: string; phone: string };
};

export const DEFAULT_PROFILE: Profile = {
  name: "Ingrid",
  fontSize: "normal",
  speechRate: 0.9,
  lang: "en",
  trusted: { name: "Anna", relation: "daughter", phone: "+49 30 0000000" },
};

export const FONT_PX: Record<FontSize, number> = { normal: 19, large: 22, xlarge: 25 };

const KEY = "elderwise.profile";
const listeners = new Set<() => void>();
let cache: Profile | null = null;

function read(): Profile {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch {
    cache = DEFAULT_PROFILE;
  }
  return cache!;
}

export function updateProfile(patch: Partial<Profile>) {
  cache = { ...read(), ...patch };
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

export function useProfile(): Profile {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_PROFILE);
}
