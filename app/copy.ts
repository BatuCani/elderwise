// UI text in German (default) and English. Keep sentences short and plain.

export const TEXT = {
  de: {
    intro: "Zeigen Sie mir etwas und fragen Sie einfach laut. Ich erkläre es Ihnen.",
    takePhoto: "Foto machen oder auswählen",
    photoAlt: "Ihr Foto",
    removePhoto: "Weg",
    samplesLabel: "Oder ein Beispiel ausprobieren:",
    orbSpeak: "Drücken und sprechen",
    orbAsk: "Fragen",
    orbListening: "Ich höre zu…",
    orbThinking: "Ich denke nach…",
    typePlaceholder: "Oder hier tippen",
    send: "Fragen",
    readAgain: "Nochmal vorlesen",
    learnedTitle: "Das hast du gerade mit KI gemacht",
    tipLabel: "Tipp:",
    error: "Das hat leider nicht geklappt. Bitte versuchen Sie es gleich noch einmal.",
    langSwitchLabel: "Switch to English",
  },
  en: {
    intro: "Show me something and just ask out loud. I will explain it.",
    takePhoto: "Take or choose a photo",
    photoAlt: "Your photo",
    removePhoto: "Remove",
    samplesLabel: "Or try an example:",
    orbSpeak: "Press and speak",
    orbAsk: "Ask",
    orbListening: "Listening…",
    orbThinking: "Thinking…",
    typePlaceholder: "Or type here",
    send: "Ask",
    readAgain: "Read again",
    learnedTitle: "This is what you just did with AI",
    tipLabel: "Tip:",
    error: "Sorry, that did not work. Please try again in a moment.",
    langSwitchLabel: "Auf Deutsch wechseln",
  },
} as const;

// Fake sample documents (no real personal data) so the demo works without a camera.
export const SAMPLES = [
  { src: "/samples/scam-sms.svg", label: { de: "Verdächtige SMS", en: "Suspicious SMS" } },
  { src: "/samples/doctor-letter.svg", label: { de: "Arztbrief", en: "Doctor's letter" } },
  { src: "/samples/timetable.svg", label: { de: "Fahrplan", en: "Timetable" } },
] as const;
