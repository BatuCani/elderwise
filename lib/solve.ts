"use client";

import { useSyncExternalStore } from "react";
import type { Answer } from "@/prompts/elderwise";

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

const KEY = "elderwise.solve";
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

// The steps to show: Claude's points, or its one sentence when there are none.
export function stepsOf(answer: Answer): string[] {
  return answer.points.length ? answer.points : [answer.sentence];
}

// Give Claude the whole situation so "I'm stuck" questions are answered for this exact step.
export function followUpQuestion(s: Solve, q: string): string {
  const steps = stepsOf(s.answer);
  return [
    `Earlier I asked: "${s.question || "(a photo)"}".`,
    `You told me: ${s.answer.headline} ${s.answer.sentence}`,
    `The steps were: ${steps.map((p, i) => `${i + 1}. ${p}`).join(" ")}`,
    `I am stuck on step ${s.step + 1}: "${steps[s.step]}".`,
    `My question: ${q || "I don't understand this step. Can you explain it more simply?"}`,
    `Help me with just this step.`,
  ].join("\n");
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSolve(): Solve | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
