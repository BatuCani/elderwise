"use client";

import { deleteRemoteAnswers } from "./sync";

// Extra actions for the answer history.
// Same localStorage key as in lib/answers.ts ("elderwise.answers").
const KEY = "elderwise.answers";

// Deletes every saved answer (also in the account when signed in),
// then reloads so the in-memory list starts empty too.
// Keeps everything and returns false when the account delete failed.
export async function clearEntries(): Promise<boolean> {
  if (!(await deleteRemoteAnswers())) return false;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Storage can be blocked (private mode); the reload still clears this visit.
  }
  window.location.reload();
  return true;
}
