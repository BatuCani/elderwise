import type { Lang } from "@/prompts/elderwise";

// All words on the Family view, in English and German.
export const FAMILY_TEXT: Record<
  Lang,
  {
    back: string;
    title: (name: string) => string;
    intro: (trusted: string) => string;
    demo: string;
    summaryWriting: string;
    summary: (name: string, asked: number, scams: number) => string;
    alerts: string;
    noAlerts: string;
    activity: string;
    skills: (n: number, total: number) => string;
    call: (name: string) => string;
    message: string;
    messageBody: (name: string, trusted: string) => string;
    prompt: (name: string, trusted: string, facts: string) => string;
  }
> = {
  en: {
    back: "Profile",
    title: (n) => `${n}'s week`,
    intro: (t) => `What ${t} sees: the answers Grace gave this week.`,
    demo: "Demo",
    summaryWriting: "Grace is writing a short summary…",
    summary: (n, a, s) =>
      `${n} asked ${a} ${a === 1 ? "question" : "questions"} this week.` +
      (s ? ` Grace spotted ${s === 1 ? "one scam message" : `${s} scam messages`}.` : " No scam messages."),
    alerts: "Scam warnings",
    noAlerts: "No scam warnings this week.",
    activity: "Latest questions",
    skills: (n, t) => `AI skills learned: ${n} of ${t}`,
    call: (n) => `Call ${n}`,
    message: "Send a kind message",
    messageBody: (n, t) => `Hi ${n}, I saw you used Grace this week. Well done! Love, ${t}`,
    prompt: (n, t, f) =>
      `Write one short, warm and calm sentence for ${t} about how ${n} used Grace this week. ` +
      `Use only these facts, add nothing: ${f}. Answer as an info card; put the sentence in "sentence".`,
  },
  de: {
    back: "Profil",
    title: (n) => `${n}s Woche`,
    intro: (t) => `Das sieht ${t}: die Antworten von Grace aus dieser Woche.`,
    demo: "Demo",
    summaryWriting: "Grace schreibt eine kurze Zusammenfassung…",
    summary: (n, a, s) =>
      `${n} hat diese Woche ${a} ${a === 1 ? "Frage" : "Fragen"} gestellt.` +
      (s ? ` Grace hat ${s === 1 ? "eine Betrugsnachricht" : `${s} Betrugsnachrichten`} erkannt.` : " Keine Betrugsnachrichten."),
    alerts: "Betrugswarnungen",
    noAlerts: "Diese Woche keine Betrugswarnungen.",
    activity: "Letzte Fragen",
    skills: (n, t) => `Gelernte KI-Fähigkeiten: ${n} von ${t}`,
    call: (n) => `${n} anrufen`,
    message: "Liebe Nachricht senden",
    messageBody: (n, t) => `Hallo ${n}, ich habe gesehen, dass du diese Woche Grace benutzt hast. Toll! Liebe Grüße, ${t}`,
    prompt: (n, t, f) =>
      `Schreibe einen kurzen, warmen und ruhigen Satz für ${t} darüber, wie ${n} diese Woche Grace genutzt hat. ` +
      `Nutze nur diese Fakten, erfinde nichts dazu: ${f}. Antworte als Info-Karte; der Satz kommt in "sentence".`,
  },
};
