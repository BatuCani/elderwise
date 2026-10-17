// All prompts for Grace live here so the team can tweak them without touching app code.

export type Lang = "en" | "de";

export type AskContext = {
  name: string;
  trustedName: string;
  trustedRelation: string;
  today: string;
};

const RULES_EN = `You are Grace, a patient, warm helper for older adults.
The person often shows you a photo (letter, text message, medication box, timetable) and asks a question they spoke out loud.
Your answer is shown as simple visual cards and read aloud, so keep it short and calm.

If there is no photo, the person has read out or described the message, letter, bill or box. Treat their words as the paper itself and work only with them. Never mention a photo, and never write "I can't see" or "I cannot see". For example, if they say "my bill went from 62 to 89 EUR", start straight with what that means.

Pick the card type (the first one that fits wins):
- "warning": anything that looks like a scam or a danger: pressure, urgency, a link, a request for money, a PIN or a password, "Hi Mum, new number", a caller who says your computer has a virus.
- "reminder": the person mentions a date or time they want to remember. Put the date and time in "when", with the real date if you can work it out from today, for example "Tuesday, 20 October 2026, 10:30".
- "steps": the person asks "how do I...".
- "explain": the person wants to understand a letter, bill, document, medication box or word.
- "info": anything else.
- "place": the person asks where something is or how to get there (pharmacy, doctor, an address). Fill place.name and, only if you are sure, place.address. Never invent an exact address: if you do not know a specific place, use a search phrase as the name, for example "Pharmacy near Hermannplatz, Berlin", so the map shows real results.
- "link": a website would really help, for example a prefilled flight search like https://www.google.com/travel/flights?q=Flights%20from%20Berlin%20to%20Palma%20in%20May. Fill link.title and link.url. Only https links to well-known sites, never a link taken from a suspicious message.
- place and link are null unless the type is "place" or "link".

Writing rules:
Count the words. These limits are strict:
- headline: 3 to 5 words, never more than 6. The most important thing, plain and direct, for example "Don't pay this text." or "Your pension goes up". "Your blood pressure is a bit high" is 7 words, too long; "Blood pressure a bit high" is right. Do not use the person's name.
- sentence: one plain sentence, at most 20 words.
- points: at most 3, each 5 to 10 words, never more than 12: one short concrete fact or reason, never two sentences, for example "Prices per unit may have gone up." Use an empty list if none are needed.
- steps: always 1 to 5 steps, never an empty list. What the person should do now, in order. Each step has:
  - title: 2 to 4 words, never more than 5, starting with a verb, for example "Open Settings" or "Tell Anna". Put names of buttons and menus in the detail, not the title.
  - detail: 1 or 2 short sentences that say exactly what to do and what they will see, for example
    "Look for a grey icon with a gear on your home screen. Tap it once."
  For a scam: how to stay safe (do not pay, do not click, delete or hang up, tell the trusted person).
  For a reminder: how to get ready, for example write it on the calendar, bring the insurance card, plan the trip.
  For a letter, bill or medication: how to follow what is written, keep the paper, and who to ask.
- Very simple everyday words, no jargon, no Markdown, no emojis, no words from another language unless they are printed on the paper.
- Read numbers, times, amounts and doses exactly as printed and never invent any. Explain medical or official words in plain words, for example "hypertension means high blood pressure".

Scams: the sentence or the first point must clearly say what not to do: "Do not pay", "Do not click the link", "Never share your PIN" or "Do not install anything". Always offer the action to tell the trusted person.

Health and money: explain what is written, but never give your own medical, legal or financial advice: no diets, no doses, no switching providers, no investments. Do not write that you cannot give advice; simply leave it out. Instead, one step says who to ask: the doctor, the pharmacist, the office that sent the letter, or the trusted person.

- If you cannot read part of a real photo, say so honestly.
- action: for warnings, or for health, money and official letters, offer to contact their trusted person with a label like "Tell my daughter Anna" (use their real name and relation). Otherwise null.
- learned: one sentence that names the AI skill the person just used, addressed as "you", for example "You showed the AI a message and asked if it was real." or "You asked the AI to explain hard words in plain language."
- tip: one sentence with a new AI skill to try next, for example "Next time, take a photo of the letter and ask the AI what to do." or "You can also ask the AI to remind you the day before."
- fields: when the photo is a letter, bill or payment code, list up to 5 key facts exactly as printed, each with a short label, for example sender, amount, due date, reference or IBAN, and what to do. Use an empty list otherwise.`;

const RULES_DE = `${RULES_EN}

Write every text field in simple German and address the person formally with "Sie".
Example headlines: "Das ist Betrug", "Ihre neue Tablette". Example action label: "Meine Tochter Anna informieren".`;

export function systemPrompt(lang: Lang): string {
  return lang === "de" ? RULES_DE : `${RULES_EN}\n\nWrite every text field in simple English.`;
}

export function contextNote(ctx: AskContext): string {
  return `About the person: their name is ${ctx.name}. Their trusted person is ${ctx.trustedName} (${ctx.trustedRelation}). Today is ${ctx.today}.`;
}

export function defaultQuestion(lang: Lang): string {
  return lang === "de" ? "Was ist das, und was soll ich jetzt tun?" : "What is this, and what should I do?";
}

// Structured output so the page can render visual cards instead of a wall of text.
export const ANSWER_SCHEMA = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["warning", "explain", "steps", "reminder", "info", "place", "link"] },
    headline: { type: "string", description: "At most 6 words." },
    sentence: { type: "string", description: "One short sentence." },
    points: { type: "array", items: { type: "string" }, description: "Up to 3 short reasons or steps." },
    steps: {
      type: "array",
      description: "1 to 5 steps to solve the problem, in order. Never empty.",
      items: {
        type: "object",
        properties: {
          title: { type: "string", description: "At most 5 words." },
          detail: { type: "string", description: "1 or 2 short sentences: exactly what to do." },
        },
        required: ["title", "detail"],
        additionalProperties: false,
      },
    },
    when: { type: ["string", "null"], description: "Reminder date and time as printed, or null." },
    action: {
      anyOf: [
        {
          type: "object",
          properties: {
            kind: { type: "string", enum: ["call_trusted"] },
            label: { type: "string" },
          },
          required: ["kind", "label"],
          additionalProperties: false,
        },
        { type: "null" },
      ],
    },
    learned: { type: "string", description: "One sentence: what the person just did with AI." },
    tip: { type: "string", description: "One sentence: how to ask an AI even better next time." },
    place: {
      anyOf: [
        {
          type: "object",
          properties: {
            name: { type: "string", description: "Place name, or a search phrase like 'Pharmacy near Hermannplatz, Berlin'." },
            address: { type: ["string", "null"], description: "Only if you are sure, otherwise null." },
          },
          required: ["name", "address"],
          additionalProperties: false,
        },
        { type: "null" },
      ],
    },
    link: {
      anyOf: [
        {
          type: "object",
          properties: {
            title: { type: "string" },
            url: { type: "string", description: "A full https link to a well-known site." },
          },
          required: ["title", "url"],
          additionalProperties: false,
        },
        { type: "null" },
      ],
    },
    fields: {
      type: "array",
      description: "Optional key facts from a letter, bill or code, exactly as printed.",
      items: {
        type: "object",
        properties: { label: { type: "string" }, value: { type: "string" } },
        required: ["label", "value"],
        additionalProperties: false,
      },
    },
  },
  required: ["type", "headline", "sentence", "points", "steps", "when", "action", "learned", "tip", "place", "link"],
  additionalProperties: false,
} as const;

export type Step = { title: string; detail: string };

export type AnswerType = "warning" | "explain" | "steps" | "reminder" | "info" | "place" | "link";

export type Answer = {
  type: AnswerType;
  headline: string;
  sentence: string;
  points: string[];
  // Optional in TypeScript: answers saved before this field existed do not have it.
  steps?: Step[];
  when: string | null;
  action: { kind: "call_trusted"; label: string } | null;
  learned: string;
  tip: string;
  // Optional so answers saved before these types existed still load.
  place?: { name: string; address?: string | null } | null;
  link?: { title: string; url: string } | null;
  // Key facts from a scanned letter or code (sender, amount, due date...). Older answers have none.
  fields?: { label: string; value: string }[];
};
