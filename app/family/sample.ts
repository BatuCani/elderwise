import type { Entry } from "@/lib/answers";

// Demo week for the Family view, used only when this phone has no answers yet.
// Invented data, no real people. Shown with a "Demo" label.
const H = 60 * 60 * 1000;

export function sampleEntries(now: number): Entry[] {
  const base = { points: [], when: null, action: null, learned: "", tip: "" };
  return [
    {
      id: "demo-1",
      at: now - 2 * H,
      question: "Is this message real?",
      answer: { ...base, type: "warning", headline: "Fake DHL text", sentence: "It asks for a small fee through a strange link." },
    },
    {
      id: "demo-2",
      at: now - 26 * H,
      question: "What does this letter mean?",
      answer: { ...base, type: "explain", headline: "Pension letter explained", sentence: "The pension goes up a little from July." },
    },
    {
      id: "demo-3",
      at: now - 50 * H,
      question: "When is my next appointment?",
      answer: { ...base, type: "reminder", headline: "Doctor on Tuesday, 10:30", sentence: "Saved in the calendar." },
    },
    {
      id: "demo-4",
      at: now - 74 * H,
      question: "How do I send a photo to Anna?",
      answer: { ...base, type: "steps", headline: "Send a photo in three steps", sentence: "Open the photo, tap Share, pick Anna." },
    },
  ];
}

// Demo number for "Call" and "Send a kind message". Not a real phone.
export const DEMO_PHONE = "+49 30 0000001";
