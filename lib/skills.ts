"use client";

import { useSyncExternalStore } from "react";
import type { Lang } from "@/prompts/elderwise";
import { useAnswers, type Entry } from "./answers";

// "Your AI skills": 8 small things an older person learns by using Grace.
// Most are read from the saved answers; the rest are marked when they happen (earnSkill).
export type SkillId = "voice" | "photo" | "scam" | "letter" | "steps" | "reminder" | "followup" | "family";
export type SkillIcon = "mic" | "camera" | "alert" | "book" | "list" | "calendar" | "chat" | "phone";

type Text = { title: string; desc: string; hint: string };
export const SKILLS: { id: SkillId; icon: SkillIcon; en: Text; de: Text }[] = [
  { id: "voice", icon: "mic", en: { title: "Ask out loud", desc: "You spoke a question.", hint: "Tap Grace and just talk" }, de: { title: "Laut fragen", desc: "Sie haben eine Frage gesprochen.", hint: "Grace antippen und sprechen" } },
  { id: "photo", icon: "camera", en: { title: "Show a photo", desc: "You asked about a photo.", hint: "Show Grace a letter or text" }, de: { title: "Foto zeigen", desc: "Sie haben zu einem Foto gefragt.", hint: "Grace einen Brief zeigen" } },
  { id: "scam", icon: "alert", en: { title: "Check for scams", desc: "Grace checked a message for you.", hint: "Ask: is this message real?" }, de: { title: "Betrug erkennen", desc: "Grace hat eine Nachricht geprüft.", hint: "Fragen: Ist das echt?" } },
  { id: "letter", icon: "book", en: { title: "Understand a letter", desc: "Grace explained something in plain words.", hint: "Ask what a letter means" }, de: { title: "Brief verstehen", desc: "Grace hat etwas einfach erklärt.", hint: "Fragen, was ein Brief bedeutet" } },
  { id: "steps", icon: "list", en: { title: "Step by step", desc: "You got help one step at a time.", hint: "Ask: how do I…?" }, de: { title: "Schritt für Schritt", desc: "Sie bekamen Hilfe Schritt für Schritt.", hint: "Fragen: Wie mache ich…?" } },
  { id: "reminder", icon: "calendar", en: { title: "Set a reminder", desc: "Grace found a date for you.", hint: "Show an appointment letter" }, de: { title: "Termin merken", desc: "Grace hat einen Termin gefunden.", hint: "Einen Terminbrief zeigen" } },
  { id: "followup", icon: "chat", en: { title: "Ask a follow-up", desc: "You asked again to understand more.", hint: "Ask a second question" }, de: { title: "Nachfragen", desc: "Sie haben nachgefragt.", hint: "Eine zweite Frage stellen" } },
  { id: "family", icon: "phone", en: { title: "Tell family", desc: "You told your trusted person.", hint: "Tap Tell Anna on a warning" }, de: { title: "Familie fragen", desc: "Sie haben Ihre Vertrauensperson informiert.", hint: "Bei einer Warnung Anna Bescheid geben" } },
];

export const skillText = (id: SkillId, lang: Lang) => SKILLS.find((s) => s.id === id)![lang];

// Skills that the answers can't show (how you asked, what you tapped), kept in this browser.
const KEY = "elderwise.skills";
const listeners = new Set<() => void>();
let cache: SkillId[] | null = null;
const NONE: SkillId[] = [];

function readMarked(): SkillId[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    cache = [];
  }
  return cache!;
}

export function earnSkill(id: SkillId) {
  const marked = readMarked();
  if (marked.includes(id)) return;
  cache = [...marked, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Private mode: the skill still counts for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function fromAnswers(entries: Entry[]): SkillId[] {
  const out = new Set<SkillId>();
  const types = new Set(entries.map((e) => e.answer.type));
  if (types.has("warning")) out.add("scam");
  if (types.has("explain")) out.add("letter");
  if (types.has("steps")) out.add("steps");
  if (types.has("reminder")) out.add("reminder");
  // Newest first: two questions within 2 minutes count as a follow-up.
  if (entries.some((e, i) => i + 1 < entries.length && e.at - entries[i + 1].at < 2 * 60_000)) out.add("followup");
  return [...out];
}

// Read straight from storage (not from React state), for the toast's first look.
export function earnedNow(): SkillId[] {
  let entries: Entry[] = [];
  try {
    entries = JSON.parse(localStorage.getItem("elderwise.answers") ?? "[]");
  } catch {
    // Nothing saved yet.
  }
  const earned = new Set([...fromAnswers(entries), ...readMarked()]);
  return SKILLS.map((s) => s.id).filter((id) => earned.has(id));
}

// Earned skills in the fixed order of SKILLS.
export function useSkills(): SkillId[] {
  const entries = useAnswers();
  const marked = useSyncExternalStore(subscribe, readMarked, () => NONE);
  const earned = new Set([...fromAnswers(entries), ...marked]);
  return SKILLS.map((s) => s.id).filter((id) => earned.has(id));
}
