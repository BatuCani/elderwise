"use client";

import { useSyncExternalStore } from "react";
import type { Answer } from "@/prompts/elderwise";
import { pushAnswer } from "./sync";

// Answer history, newest first, kept in this browser's localStorage (and the account when signed in, see sync.ts).
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

function save(entries: Entry[]) {
  cache = entries;
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Storage can be blocked (private mode); the answer still shows for this visit.
  }
  listeners.forEach((l) => l());
}

export function addEntry(question: string, answer: Answer) {
  const entry: Entry = { id: crypto.randomUUID(), at: Date.now(), question, answer };
  save([entry, ...read()].slice(0, MAX));
  pushAnswer(entry);
}

export const currentEntries = read;

// Adds answers loaded from the account, skipping ones this device already has.
export function mergeEntries(remote: Entry[]) {
  const have = new Set(read().map((e) => e.id));
  const added = remote.filter((e) => !have.has(e.id));
  if (added.length) save([...read(), ...added].sort((a, b) => b.at - a.at).slice(0, MAX));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAnswers(): Entry[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

// True while Claude is working on a new answer, so the Answers tab can hold its place with a skeleton.
let pending = false;
const pendingListeners = new Set<() => void>();

export function setPending(next: boolean) {
  if (pending === next) return;
  pending = next;
  pendingListeners.forEach((l) => l());
}

function subscribePending(listener: () => void) {
  pendingListeners.add(listener);
  return () => pendingListeners.delete(listener);
}

export function usePending(): boolean {
  return useSyncExternalStore(subscribePending, () => pending, () => false);
}
