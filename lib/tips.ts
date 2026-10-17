import type { Lang } from "@/prompts/elderwise";

// "AI tip of the day": one small AI skill per day, with a question to try it right away.
export type Tip = { id: string; title: string; sentence: string; tryIt: string };

type Localized = { id: string } & Record<Lang, Omit<Tip, "id">>;

const TIPS: Localized[] = [
  {
    id: "show",
    en: { title: "Show, don't type", sentence: "Take a photo of a letter and ask what it means for you.", tryIt: "What can I show you in a photo?" },
    de: { title: "Zeigen statt tippen", sentence: "Fotografieren Sie einen Brief und fragen Sie, was er für Sie bedeutet.", tryIt: "Was kann ich dir auf einem Foto zeigen?" },
  },
  {
    id: "slower",
    en: { title: "Ask for slower", sentence: "If an answer was too fast, just ask again, more slowly.", tryIt: "Please explain how you work again, slower." },
    de: { title: "Langsamer bitten", sentence: "War eine Antwort zu schnell, bitten Sie einfach um eine langsamere.", tryIt: "Bitte erkläre noch einmal langsamer, wie du funktionierst." },
  },
  {
    id: "check-pay",
    en: { title: "Check before you pay", sentence: "Ask the AI about a strange message before you pay anything.", tryIt: "A text says I must pay 1.99 euro for a parcel. Is this real?" },
    de: { title: "Erst prüfen, dann zahlen", sentence: "Fragen Sie die KI nach einer seltsamen Nachricht, bevor Sie etwas bezahlen.", tryIt: "Eine SMS sagt, ich soll 1,99 Euro für ein Paket zahlen. Ist das echt?" },
  },
  {
    id: "simple-words",
    en: { title: "Ask for simple words", sentence: "Say “in simple words” and the AI drops the jargon.", tryIt: "What is a blood pressure reading, in simple words?" },
    de: { title: "Einfache Worte verlangen", sentence: "Sagen Sie „in einfachen Worten“, dann lässt die KI Fachwörter weg.", tryIt: "Was ist ein Blutdruckwert, in einfachen Worten?" },
  },
  {
    id: "example",
    en: { title: "Ask for an example", sentence: "An example often explains more than a definition.", tryIt: "What is a phishing email? Give me one example." },
    de: { title: "Nach Beispielen fragen", sentence: "Ein Beispiel erklärt oft mehr als eine Definition.", tryIt: "Was ist eine Phishing-Mail? Gib mir ein Beispiel." },
  },
  {
    id: "steps",
    en: { title: "Ask for steps", sentence: "Say “step by step” to get a short list you can follow.", tryIt: "How do I make the text on my phone bigger, step by step?" },
    de: { title: "Schritt für Schritt", sentence: "Sagen Sie „Schritt für Schritt“ für eine kurze Liste zum Nachmachen.", tryIt: "Wie mache ich die Schrift auf meinem Handy größer, Schritt für Schritt?" },
  },
  {
    id: "remind",
    en: { title: "Let it remember dates", sentence: "Say a date and time, and the AI turns it into a reminder.", tryIt: "Remind me: doctor on Tuesday at 10:30." },
    de: { title: "Termine merken lassen", sentence: "Nennen Sie Datum und Uhrzeit, die KI macht eine Erinnerung daraus.", tryIt: "Erinnere mich: Arzt am Dienstag um 10:30 Uhr." },
  },
  {
    id: "follow-up",
    en: { title: "Ask a follow-up", sentence: "You can always ask “why?” or “what does that mean?”.", tryIt: "Why do scammers ask for gift cards?" },
    de: { title: "Nachfragen erlaubt", sentence: "Sie können immer „warum?“ oder „was heißt das?“ fragen.", tryIt: "Warum wollen Betrüger Gutscheinkarten?" },
  },
  {
    id: "not-sure",
    en: { title: "AI can be wrong", sentence: "For health and money, check the answer with a real person.", tryIt: "When should I ask my doctor instead of you?" },
    de: { title: "KI kann sich irren", sentence: "Bei Gesundheit und Geld prüfen Sie die Antwort mit einem Menschen.", tryIt: "Wann sollte ich lieber meinen Arzt fragen statt dich?" },
  },
  {
    id: "private",
    en: { title: "Keep your PIN private", sentence: "Never tell an AI or anyone your PIN or passwords.", tryIt: "What should I never tell an AI?" },
    de: { title: "PIN bleibt geheim", sentence: "Nennen Sie nie einer KI oder jemand anderem Ihre PIN oder Passwörter.", tryIt: "Was sollte ich einer KI nie verraten?" },
  },
  {
    id: "write",
    en: { title: "Let it help you write", sentence: "The AI can draft a short, polite message for you.", tryIt: "Help me write a short thank-you text to my neighbour." },
    de: { title: "Schreibhilfe nutzen", sentence: "Die KI kann eine kurze, höfliche Nachricht für Sie entwerfen.", tryIt: "Hilf mir, eine kurze Danke-Nachricht an meine Nachbarin zu schreiben." },
  },
  {
    id: "compare",
    en: { title: "Ask to compare", sentence: "Ask for the difference between two things you are unsure about.", tryIt: "What is the difference between a bus and a tram ticket in Berlin?" },
    de: { title: "Vergleichen lassen", sentence: "Fragen Sie nach dem Unterschied zwischen zwei Dingen.", tryIt: "Was ist der Unterschied zwischen WhatsApp und SMS?" },
  },
  {
    id: "repeat",
    en: { title: "Hear it again", sentence: "Tap “Read aloud” on any answer to hear it one more time.", tryIt: "How can you read your answers aloud to me?" },
    de: { title: "Noch einmal hören", sentence: "Tippen Sie bei jeder Antwort auf „Vorlesen“, um sie erneut zu hören.", tryIt: "Wie kannst du mir deine Antworten vorlesen?" },
  },
  {
    id: "anything",
    en: { title: "No question is silly", sentence: "The AI is patient: ask the same thing as often as you like.", tryIt: "What is the cloud, and is my data there?" },
    de: { title: "Keine Frage ist dumm", sentence: "Die KI ist geduldig: Fragen Sie so oft, wie Sie möchten.", tryIt: "Was ist die Cloud, und sind meine Daten dort?" },
  },
];

// Today's date as YYYY-MM-DD in local time.
export function todayKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// The same tip all day; a new one tomorrow, cycling through all 14.
export function tipOfTheDay(lang: Lang, now = new Date()): Tip {
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
  const tip = TIPS[day % TIPS.length];
  return { id: tip.id, ...tip[lang] };
}
