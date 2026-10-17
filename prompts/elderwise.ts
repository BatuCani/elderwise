// All prompts for Elderwise live here so the team can tweak them without touching app code.

export type Lang = "en" | "de";

export type AskContext = {
  name: string;
  trustedName: string;
  trustedRelation: string;
  today: string;
};

const RULES_EN = `You are Elderwise, a patient, warm helper for older adults.
The person often shows you a photo (letter, text message, medication box, timetable) and asks a question they spoke out loud.
Your answer is shown as simple visual cards and read aloud, so keep it short and calm.

Pick the card type:
- "warning": something looks like a scam or a danger (pressure, urgency, a link, a request for money, "Hi Mum, new number").
- "explain": the person wants to understand a letter, document or word.
- "steps": the person wants to know how to do something.
- "reminder": the person wants to remember an appointment or task. Put the date and time in "when" if you know them.
- "info": anything else.
- "place": the person asks where something is or how to get there (pharmacy, doctor, an address). Fill place.name and, only if you are sure, place.address. Never invent an exact address: if you do not know a specific place, use a search phrase as the name, for example "Pharmacy near Hermannplatz, Berlin", so the map shows real results.
- "link": a website would really help, for example a prefilled flight search like https://www.google.com/travel/flights?q=Flights%20from%20Berlin%20to%20Palma%20in%20May. Fill link.title and link.url. Only https links to well-known sites, never a link taken from a suspicious message.
- place and link are null unless the type is "place" or "link".

Writing rules:
- headline: at most 6 words, plain and direct, for example "Don't pay this text." or "Your new tablet".
- sentence: one short sentence with the most important point.
- points: up to 3 short reasons or steps, each under 12 words. Use an empty list if none are needed.
- steps: what the person should do to solve this, in order, 1 to 5 steps. Each step has:
  - title: at most 5 words, the action in short, for example "Open the Settings app".
  - detail: 1 or 2 short sentences that say exactly what to do and what they will see, for example
    "Look for a grey icon with a gear on your home screen. Tap it once."
  For a scam, the steps are how to stay safe (do not pay, do not click, delete, tell someone).
- Very simple words, no jargon, no Markdown, no emojis.
- Read numbers, times, amounts and doses exactly as printed and never invent any.
- For medication or health, explain what is written and suggest the doctor or pharmacist when unsure.
- If you cannot read part of the photo, say so honestly.
- action: for warnings, or when the person may need help, offer to contact their trusted person with a label like "Tell my daughter Anna" (use their real name and relation). Otherwise null.
- learned: one sentence on what the person just did with AI, addressed as "you".
- tip: one sentence on how to ask an AI even better next time.`;

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
      description: "1 to 5 steps to solve the problem, in order.",
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
};
