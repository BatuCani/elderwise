"use client";

// Extra actions for the answer history. lib/answers.ts stays untouched.
// Same localStorage key as in lib/answers.ts ("elderwise.answers").
const KEY = "elderwise.answers";

// Deletes every saved answer, then reloads so the in-memory list starts empty too.
export function clearEntries() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Storage can be blocked (private mode); the reload still clears this visit.
  }
  window.location.reload();
}
