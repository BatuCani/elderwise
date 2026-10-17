// Welcome screen text in English (default) and German. Keep sentences short and plain.

export const WELCOME = {
  en: {
    skip: "Skip",
    next: "Next",
    start: "Start talking",
    step: (n: number) => `Step ${n} of 3`,
    meetTitle: "Meet Grace",
    meetBody: "Show me a letter, a message or a medicine box, ask out loud, and I explain it in plain words.",
    talkTitle: "Just talk",
    talkBody: "Press the green button and speak. The glow shows that I am listening.",
    talkDemo: "Just say it",
    nameTitle: "What's your name?",
    nameBody: "So I know how to greet you.",
    namePlaceholder: "Your name",
  },
  de: {
    skip: "Überspringen",
    next: "Weiter",
    start: "Los geht's",
    step: (n: number) => `Schritt ${n} von 3`,
    meetTitle: "Das ist Grace",
    meetBody: "Zeigen Sie mir einen Brief, eine Nachricht oder eine Medikamentenschachtel, fragen Sie laut, und ich erkläre es in einfachen Worten.",
    talkTitle: "Einfach sprechen",
    talkBody: "Drücken Sie den grünen Knopf und sprechen Sie. Das Leuchten zeigt, dass ich zuhöre.",
    talkDemo: "Sagen Sie es einfach",
    nameTitle: "Wie heißen Sie?",
    nameBody: "Damit ich Sie richtig begrüßen kann.",
    namePlaceholder: "Ihr Name",
  },
} as const;
