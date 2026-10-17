"use client";

// First-run flag: once set, the welcome screens never show again in this browser.
const KEY = "elderwise.welcomed";

export function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    // Storage blocked (private mode): skip onboarding rather than show it on every visit.
    return true;
  }
}

export function markWelcomeSeen() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // Nothing to remember in private mode.
  }
}
