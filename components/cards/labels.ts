import type { Lang } from "@/prompts/elderwise";

// Words used only by the answer cards, in English and German.
export const CARD_TEXT: Record<
  Lang,
  { addToCalendar: string; whatThisMeans: string; step: string; noAnswersTitle: string; askSomething: string }
> = {
  en: {
    addToCalendar: "Add to calendar",
    whatThisMeans: "What this means for you",
    step: "Step",
    noAnswersTitle: "No answers yet",
    askSomething: "Ask something",
  },
  de: {
    addToCalendar: "In den Kalender",
    whatThisMeans: "Was das für Sie bedeutet",
    step: "Schritt",
    noAnswersTitle: "Noch keine Antworten",
    askSomething: "Etwas fragen",
  },
};
