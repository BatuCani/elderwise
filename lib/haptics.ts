// A tiny tap on phones that support it (Android Chrome); iPhone Safari has no vibration API and skips it.
export function haptic(ms = 10) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(ms);
}
