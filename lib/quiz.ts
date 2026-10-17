// Built-in questions for the Practice quiz (/practice). Fake messages only, no real data.

export type QuizKind = "scam" | "ask" | "share";

export type QuizQuestion = {
  kind: QuizKind;
  prompt: string;
  message?: string; // a fake SMS or email, shown as a message bubble
  options: string[];
  correct: number; // index into options
  why: string; // one sentence shown after answering
  skill: string; // the AI or safety skill this practises
};

export const QUIZ: QuizQuestion[] = [
  {
    kind: "scam",
    prompt: "Real or scam?",
    message: "DHL: Your parcel is held at customs. Pay the 1.99 EUR fee here: dhl-parcel-fee.info/pay",
    options: ["Real", "Scam"],
    correct: 1,
    why: "A strange link and a small fee are a classic trick to steal card details.",
    skill: "Spot a fake text",
  },
  {
    kind: "scam",
    prompt: "Real or scam?",
    message: "Hi Grandma, this is my new number. I'm in trouble and need 900 euro today. Please don't tell Mum.",
    options: ["Real", "Scam"],
    correct: 1,
    why: "A new number, a rush and a secret are warning signs. Call the old number you know.",
    skill: "Spot a fake text",
  },
  {
    kind: "scam",
    prompt: "Real or scam?",
    message: "Dr. Weber's practice: reminder of your appointment on Tuesday at 10:30. Please bring your insurance card.",
    options: ["Real", "Scam"],
    correct: 0,
    why: "It asks for no money, no link and no PIN, it only reminds you.",
    skill: "Spot a fake text",
  },
  {
    kind: "scam",
    prompt: "Real or scam?",
    message: "Your bank account is locked. Confirm your PIN within 24 hours or your account will be closed.",
    options: ["Real", "Scam"],
    correct: 1,
    why: "Your bank never asks for your PIN by email or text.",
    skill: "Spot a fake text",
  },
  {
    kind: "ask",
    prompt: "You got a letter you don't understand. What would you ask Grace?",
    options: ["Letter?", "Can you explain this letter in simple words?", "Is it bad?"],
    correct: 1,
    why: "A clear, whole question with a photo gets the clearest answer.",
    skill: "Ask a clear question",
  },
  {
    kind: "ask",
    prompt: "You want to make the text on your phone bigger. What would you ask Grace?",
    options: ["Phone too small", "Fix my phone", "How do I make the text on my iPhone bigger?"],
    correct: 2,
    why: "Saying what you want and which phone you have gets steps that fit.",
    skill: "Ask a clear question",
  },
  {
    kind: "ask",
    prompt: "A text asks you to pay a fee. What would you ask Grace?",
    options: ["Is this text real, and what should I do?", "Pay it for me", "Who is DHL?"],
    correct: 0,
    why: "Asking if it is real before you act keeps you safe.",
    skill: "Check before you act",
  },
  {
    kind: "share",
    prompt: "A caller says he is from your bank. Which is safe to tell him?",
    options: ["Your PIN", "Your birthday", "Nothing, hang up and call the bank yourself"],
    correct: 2,
    why: "Hang up and call the number on your bank card. Then you know who you are talking to.",
    skill: "Keep your details safe",
  },
  {
    kind: "share",
    prompt: "Which is safe to type into a chat with an AI?",
    options: ["Your bank PIN", "A question about your pension letter", "Your password"],
    correct: 1,
    why: "Ask about your letters freely, but never share PINs or passwords.",
    skill: "Keep your details safe",
  },
  {
    kind: "share",
    prompt: "\"Microsoft\" calls about a virus and wants to install a program. What do you share?",
    options: ["Nothing, hang up", "Access to your computer", "Your email password"],
    correct: 0,
    why: "Microsoft never calls you about viruses. Hang up and tell your trusted person.",
    skill: "Keep your details safe",
  },
];

// 5 questions per round: 2 "Real or scam?", 2 "What would you ask?", 1 "Safe to share?", shuffled.
export function pickRound(): QuizQuestion[] {
  const take = (kind: QuizKind, n: number) => shuffle(QUIZ.filter((q) => q.kind === kind)).slice(0, n);
  return shuffle([...take("scam", 2), ...take("ask", 2), ...take("share", 1)]);
}

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
