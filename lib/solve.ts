"use client";

import { useSyncExternalStore } from "react";
import type { Answer, Lang, Step } from "@/prompts/elderwise";

// The problem the person is working through on the Steps page, kept in this browser only.
export type Solve = {
  question: string;
  answer: Answer;
  step: number;
  // True while the person went back to Talk because they are stuck on `step`.
  stuck: boolean;
  // Claude's answer to the last "I'm stuck" question; shown instead of the explanation.
  followUp: { question: string; answer: Answer } | null;
};

// v2: steps have a title and a detail; older saves are ignored.
const KEY = "elderwise.solve.v2";
const listeners = new Set<() => void>();
let cache: Solve | null | undefined;

function read(): Solve | null {
  if (cache !== undefined) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "null");
  } catch {
    cache = null;
  }
  return cache ?? null;
}

function write(next: Solve | null) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage can be blocked (private mode); the steps still work for this visit.
  }
  listeners.forEach((l) => l());
}

function update(patch: Partial<Solve>) {
  const cur = read();
  if (cur) write({ ...cur, ...patch });
}

export const getSolve = read;

export function startSolve(question: string, answer: Answer) {
  write({ question, answer, step: 0, stuck: false, followUp: null });
}

export const setStep = (step: number) => update({ step });
export const setStuck = (stuck: boolean) => update({ stuck });
export const setFollowUp = (question: string, answer: Answer) => update({ followUp: { question, answer }, stuck: false });
export const clearFollowUp = () => update({ followUp: null });

// A sample problem, so the Steps page can be tried before asking anything (fake data).
const EXAMPLE: Record<Lang, { question: string; answer: Answer }> = {
  en: {
    question: "How do I make the text on my phone bigger?",
    answer: {
      type: "steps",
      headline: "Make your text bigger",
      sentence: "You can change the text size in your phone's Settings.",
      points: ["Open the grey Settings app.", "Tap Display and Brightness.", "Tap Text Size and slide to the right."],
      steps: [
        { title: "Open Settings", detail: "Find the grey icon with a gear on your home screen. Tap it once." },
        { title: "Tap Display and Brightness", detail: "Scroll down a little. It has a blue icon with a white sun. Tap it." },
        { title: "Make the text bigger", detail: "Tap Text Size. Slide the dot to the right until the text is easy to read." },
      ],
      when: null,
      action: null,
      learned: "You asked an AI how to do something on your phone.",
      tip: "Ask for one step at a time if it goes too fast.",
    },
  },
  de: {
    question: "Wie mache ich die Schrift auf meinem Handy größer?",
    answer: {
      type: "steps",
      headline: "Schrift größer machen",
      sentence: "Sie können die Schriftgröße in den Einstellungen ändern.",
      points: ["Öffnen Sie die graue App Einstellungen.", "Tippen Sie auf Anzeige und Helligkeit.", "Tippen Sie auf Textgröße und schieben Sie nach rechts."],
      steps: [
        { title: "Einstellungen öffnen", detail: "Suchen Sie das graue Symbol mit dem Zahnrad. Tippen Sie einmal darauf." },
        { title: "Anzeige und Helligkeit", detail: "Scrollen Sie etwas nach unten. Das Symbol ist blau mit einer weißen Sonne. Tippen Sie darauf." },
        { title: "Schrift größer machen", detail: "Tippen Sie auf Textgröße. Schieben Sie den Punkt nach rechts, bis Sie gut lesen können." },
      ],
      when: null,
      action: null,
      learned: "Sie haben eine KI gefragt, wie etwas auf dem Handy geht.",
      tip: "Bitten Sie um einen Schritt nach dem anderen, wenn es zu schnell geht.",
    },
  },
};

export function startExample(lang: Lang) {
  startSolve(EXAMPLE[lang].question, EXAMPLE[lang].answer);
}

// The steps to show: Claude's steps; for older answers its points, or its one sentence.
export function stepsOf(answer: Answer): Step[] {
  if (answer.steps?.length) return answer.steps;
  if (answer.points.length) return answer.points.map((p) => ({ title: p, detail: "" }));
  return [{ title: answer.headline, detail: answer.sentence }];
}

// Give Claude the whole situation so "I'm stuck" questions are answered for this exact step.
export function followUpQuestion(s: Solve, q: string): string {
  const steps = stepsOf(s.answer);
  return [
    `Earlier I asked: "${s.question || "(a photo)"}".`,
    `You told me: ${s.answer.headline} ${s.answer.sentence}`,
    `The steps were: ${steps.map((p, i) => `${i + 1}. ${p.title}: ${p.detail}`).join(" ")}`,
    `I am stuck on step ${s.step + 1}: "${steps[s.step]?.title}".`,
    `My question: ${q || "I don't understand this step. Can you explain it more simply?"}`,
    `Help me with just this step.`,
  ].join("\n");
}

// A question on its way to Claude. The Steps page opens right away and shows this while waiting.
export type Pending = { question: string; status: "thinking" | "error"; followUp: boolean };
let pending: Pending | null = null;
let retryFn: (() => void) | null = null;

export function setPending(next: Pending | null, retry?: () => void) {
  pending = next;
  if (retry) retryFn = retry;
  listeners.forEach((l) => l());
}

export function retryPending() {
  retryFn?.();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSolve(): Solve | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function usePending(): Pending | null {
  return useSyncExternalStore(subscribe, () => pending, () => null);
}
