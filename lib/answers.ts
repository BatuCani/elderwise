"use client";

import { useSyncExternalStore } from "react";
import type { Answer } from "@/prompts/elderwise";

// Answer history, newest first, kept in this browser's localStorage only.
export type Entry = { id: string; at: number; question: string; answer: Answer };

const KEY = "elderwise.answers";
const MAX = 30;
const EMPTY: Entry[] = [];
const listeners = new Set<() => void>();
let cache: Entry[] | null = null;

function read(): Entry[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    cache = EMPTY;
  }
  return cache!;
}

export function addEntry(question: string, answer: Answer) {
  const entry: Entry = { id: crypto.randomUUID(), at: Date.now(), question, answer };
  cache = [entry, ...read()].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Storage can be blocked (private mode); the answer still shows for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAnswers(): Entry[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
