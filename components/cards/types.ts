import type { Answer, Lang } from "@/prompts/elderwise";

// What every answer card gets: the answer, its small label ("Reminder · 10:42"),
// the language, and when the answer was given (relative dates count from there).
export type CardProps = { answer: Answer; kicker: string; lang: Lang; at: number };
