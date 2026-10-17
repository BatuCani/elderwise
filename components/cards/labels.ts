import type { Lang } from "@/prompts/elderwise";

// Words used only by the answer cards and the Answers history, in English and German.
export const CARD_TEXT: Record<
  Lang,
  {
    addToCalendar: string;
    whatThisMeans: string;
    step: string;
    noAnswersTitle: string;
    askSomething: string;
    back: string;
    earlier: string;
    yesterday: string;
    clearHistory: string;
    clearConfirm: string;
    clearYes: string;
    cancel: string;
  }
> = {
  en: {
    addToCalendar: "Add to calendar",
    whatThisMeans: "What this means for you",
    step: "Step",
    noAnswersTitle: "No answers yet",
    askSomething: "Ask something",
    back: "Back",
    earlier: "Earlier answers",
    yesterday: "Yesterday",
    clearHistory: "Clear history",
    clearConfirm: "Delete all answers?",
    clearYes: "Yes, delete",
    cancel: "Cancel",
  },
  de: {
    addToCalendar: "In den Kalender",
    whatThisMeans: "Was das für Sie bedeutet",
    step: "Schritt",
    noAnswersTitle: "Noch keine Antworten",
    askSomething: "Etwas fragen",
    back: "Zurück",
    earlier: "Frühere Antworten",
    yesterday: "Gestern",
    clearHistory: "Verlauf löschen",
    clearConfirm: "Alle Antworten löschen?",
    clearYes: "Ja, löschen",
    cancel: "Abbrechen",
  },
};
