import type { Lang } from "@/prompts/elderwise";

// Content of the Learn hub: 8 topics, 3 short lessons each, in English and German.
// Every lesson ends with a question the person can try with Grace right away (no photo needed).

export type TopicId = "scams" | "letters" | "health" | "money" | "phone" | "travel" | "family" | "ai";

type Words = { title: string; body: string; try: string };
export type Lesson = Record<Lang, Words>;
export type Topic = { id: TopicId; title: Record<Lang, string>; lessons: Lesson[] };

export const TOPICS: Topic[] = [
  {
    id: "scams",
    title: { en: "Spot scams", de: "Betrug erkennen" },
    lessons: [
      {
        en: {
          title: "The new number trick",
          body: "A message says: \"Hi Mum, my phone broke, this is my new number.\" Soon after, they ask for money. Before you do anything, call your child on the number you already have.",
          try: "I got a message from a new number saying it's my son. Is it real?",
        },
        de: {
          title: "Der Trick mit der neuen Nummer",
          body: "Eine Nachricht sagt: „Hallo Mama, mein Handy ist kaputt, das ist meine neue Nummer.“ Kurz darauf geht es um Geld. Rufen Sie Ihr Kind zuerst unter der Nummer an, die Sie schon kennen.",
          try: "Ich habe eine Nachricht von einer neuen Nummer bekommen, angeblich von meinem Sohn. Ist das echt?",
        },
      },
      {
        en: {
          title: "Pressure is a warning sign",
          body: "Scammers rush you: \"today only\", \"your account will be closed\". Real banks and offices give you time. When someone pushes you, stop and ask Grace.",
          try: "A message says my bank account will be closed today. What should I do?",
        },
        de: {
          title: "Zeitdruck ist ein Warnsignal",
          body: "Betrüger drängen: „nur heute“, „Ihr Konto wird gesperrt“. Echte Banken und Ämter geben Ihnen Zeit. Wenn jemand drängt, halten Sie inne und fragen Sie Grace.",
          try: "In einer Nachricht steht, mein Bankkonto wird heute gesperrt. Was soll ich tun?",
        },
      },
      {
        en: {
          title: "Parcel fees and links",
          body: "Texts about a small parcel fee often lead to fake websites. Don't tap the link. If you expect a parcel, check with the shop or in the delivery company's own app.",
          try: "I got a text that my parcel is waiting and I need to pay a fee. Is that a scam?",
        },
        de: {
          title: "Paketgebühren und Links",
          body: "SMS über eine kleine Paketgebühr führen oft auf gefälschte Seiten. Tippen Sie den Link nicht an. Wenn Sie ein Paket erwarten, prüfen Sie es beim Shop oder in der App des Paketdienstes.",
          try: "Ich habe eine SMS bekommen, mein Paket wartet und ich soll eine Gebühr zahlen. Ist das Betrug?",
        },
      },
    ],
  },
  {
    id: "letters",
    title: { en: "Letters & forms", de: "Briefe & Formulare" },
    lessons: [
      {
        en: {
          title: "Find the deadline",
          body: "Most official letters have one date that matters most: the deadline. Show the letter to Grace and ask what you need to do, and by when.",
          try: "What should I look for first in an official letter?",
        },
        de: {
          title: "Die Frist finden",
          body: "In den meisten Behördenbriefen zählt vor allem ein Datum: die Frist. Zeigen Sie Grace den Brief und fragen Sie, was zu tun ist und bis wann.",
          try: "Worauf sollte ich in einem Behördenbrief zuerst achten?",
        },
      },
      {
        en: {
          title: "Words you don't know",
          body: "Letters are full of hard words. You can ask Grace about one word at a time, as often as you like.",
          try: "What does \"appeal\" mean in an official letter?",
        },
        de: {
          title: "Wörter, die Sie nicht kennen",
          body: "Briefe sind voller schwieriger Wörter. Sie können Grace nach jedem einzelnen Wort fragen, so oft Sie möchten.",
          try: "Was bedeutet „Widerspruch“ in einem Behördenbrief?",
        },
      },
      {
        en: {
          title: "Filling in a form",
          body: "Take one field at a time. Ask Grace what belongs in it, and keep a copy of what you send.",
          try: "How do I fill in a form from my health insurer, step by step?",
        },
        de: {
          title: "Ein Formular ausfüllen",
          body: "Nehmen Sie sich ein Feld nach dem anderen vor. Fragen Sie Grace, was hineingehört, und behalten Sie eine Kopie von allem, was Sie abschicken.",
          try: "Wie fülle ich ein Formular meiner Krankenkasse Schritt für Schritt aus?",
        },
      },
    ],
  },
  {
    id: "health",
    title: { en: "Health & medicines", de: "Gesundheit & Medikamente" },
    lessons: [
      {
        en: {
          title: "Read the medicine leaflet",
          body: "Show Grace the box or the leaflet, and she reads out what is printed, in plain words. For changes or worries, your pharmacist or doctor decides.",
          try: "How do I read a medicine leaflet?",
        },
        de: {
          title: "Den Beipackzettel lesen",
          body: "Zeigen Sie Grace die Packung oder den Beipackzettel, und sie liest vor, was dort steht, in einfachen Worten. Bei Änderungen oder Sorgen entscheiden Apotheke oder Arztpraxis.",
          try: "Wie lese ich einen Beipackzettel?",
        },
      },
      {
        en: {
          title: "Prepare your doctor's visit",
          body: "Write down your questions before you go. Grace can help you put them in order, so nothing gets forgotten.",
          try: "Help me prepare questions for my doctor's appointment about my knee.",
        },
        de: {
          title: "Den Arztbesuch vorbereiten",
          body: "Schreiben Sie Ihre Fragen vorher auf. Grace hilft Ihnen, sie zu ordnen, damit nichts vergessen wird.",
          try: "Hilf mir, Fragen für meinen Arzttermin wegen meines Knies vorzubereiten.",
        },
      },
      {
        en: {
          title: "Understand a doctor's letter",
          body: "Doctors' letters use many medical words. Grace explains them in everyday language, and anything that worries you, you can ask your doctor.",
          try: "What does \"hypertension\" mean in a doctor's letter?",
        },
        de: {
          title: "Einen Arztbrief verstehen",
          body: "Arztbriefe enthalten viele Fachwörter. Grace erklärt sie in Alltagssprache, und alles, was Sie beunruhigt, können Sie Ihre Ärztin oder Ihren Arzt fragen.",
          try: "Was bedeutet „Hypertonie“ in einem Arztbrief?",
        },
      },
    ],
  },
  {
    id: "money",
    title: { en: "Money & bills", de: "Geld & Rechnungen" },
    lessons: [
      {
        en: {
          title: "Check a bill",
          body: "Before you pay, check three things: who sent it, the amount, and the due date. Grace can point them out for you.",
          try: "What should I check before I pay a bill?",
        },
        de: {
          title: "Eine Rechnung prüfen",
          body: "Prüfen Sie vor dem Bezahlen drei Dinge: wer sie geschickt hat, den Betrag und das Fälligkeitsdatum. Grace zeigt sie Ihnen.",
          try: "Was sollte ich prüfen, bevor ich eine Rechnung bezahle?",
        },
      },
      {
        en: {
          title: "Your bank never asks for your PIN",
          body: "A real bank never asks for your PIN or passwords by phone, text or email. If someone does, hang up and call your bank on the number on your card.",
          try: "Someone called and asked for my PIN. They said they are from my bank. What should I do?",
        },
        de: {
          title: "Ihre Bank fragt nie nach der PIN",
          body: "Eine echte Bank fragt nie am Telefon, per SMS oder E-Mail nach Ihrer PIN oder Ihren Passwörtern. Wenn das jemand tut, legen Sie auf und rufen Sie Ihre Bank unter der Nummer auf Ihrer Karte an.",
          try: "Jemand hat angerufen und nach meiner PIN gefragt, angeblich von meiner Bank. Was soll ich tun?",
        },
      },
      {
        en: {
          title: "Cancel a contract",
          body: "Many contracts can be cancelled with a short letter. Grace can help you write it in clear words.",
          try: "Help me write a short letter to cancel my magazine subscription.",
        },
        de: {
          title: "Einen Vertrag kündigen",
          body: "Viele Verträge lassen sich mit einem kurzen Schreiben kündigen. Grace hilft Ihnen, es in klaren Worten aufzusetzen.",
          try: "Hilf mir, ein kurzes Schreiben zu verfassen, um mein Zeitschriften-Abo zu kündigen.",
        },
      },
    ],
  },
  {
    id: "phone",
    title: { en: "Your phone", de: "Ihr Handy" },
    lessons: [
      {
        en: {
          title: "Make the text bigger",
          body: "Your phone can show larger text everywhere, not only in Grace. Ask Grace for the steps on your phone.",
          try: "How do I make the text bigger on my phone?",
        },
        de: {
          title: "Die Schrift vergrößern",
          body: "Ihr Handy kann überall größere Schrift zeigen, nicht nur in Grace. Fragen Sie Grace nach den Schritten für Ihr Handy.",
          try: "Wie mache ich die Schrift auf meinem Handy größer?",
        },
      },
      {
        en: {
          title: "Updates are normal",
          body: "Phones ask to update now and then. A real update comes from your phone's settings, never from a pop-up on a website.",
          try: "My phone wants to update. Should I do it?",
        },
        de: {
          title: "Updates sind normal",
          body: "Handys möchten ab und zu aktualisiert werden. Ein echtes Update kommt aus den Einstellungen Ihres Handys, nie aus einem Fenster auf einer Webseite.",
          try: "Mein Handy möchte ein Update machen. Soll ich das tun?",
        },
      },
      {
        en: {
          title: "A good photo for Grace",
          body: "Lay the letter flat in good light and hold the phone straight above it until the text looks sharp. Then show it to Grace.",
          try: "How do I take a good photo of a letter?",
        },
        de: {
          title: "Ein gutes Foto für Grace",
          body: "Legen Sie den Brief flach ins Licht und halten Sie das Handy gerade darüber, bis die Schrift scharf ist. Dann zeigen Sie ihn Grace.",
          try: "Wie mache ich ein gutes Foto von einem Brief?",
        },
      },
    ],
  },
  {
    id: "travel",
    title: { en: "Getting around", de: "Unterwegs" },
    lessons: [
      {
        en: {
          title: "Find a place nearby",
          body: "Ask Grace for a pharmacy or a doctor near you. She shows it on a map, with directions.",
          try: "Where is the nearest pharmacy to Hermannplatz?",
        },
        de: {
          title: "Einen Ort in der Nähe finden",
          body: "Fragen Sie Grace nach einer Apotheke oder Arztpraxis in Ihrer Nähe. Sie zeigt sie auf der Karte, mit Wegbeschreibung.",
          try: "Wo ist die nächste Apotheke am Hermannplatz?",
        },
      },
      {
        en: {
          title: "Take the bus or train",
          body: "Say where you are and where you want to go. Grace helps you find the way by bus or train.",
          try: "How do I get from Hermannplatz to Alexanderplatz by public transport?",
        },
        de: {
          title: "Mit Bus und Bahn",
          body: "Sagen Sie, wo Sie sind und wohin Sie möchten. Grace hilft Ihnen, den Weg mit Bus oder Bahn zu finden.",
          try: "Wie komme ich mit Bus und Bahn vom Hermannplatz zum Alexanderplatz?",
        },
      },
      {
        en: {
          title: "Plan a trip",
          body: "Grace can open a ready-made search for flights, so you only need to look and choose.",
          try: "Find me a flight from Berlin to Mallorca in May.",
        },
        de: {
          title: "Eine Reise planen",
          body: "Grace kann eine fertig ausgefüllte Flugsuche öffnen, Sie müssen nur noch schauen und auswählen.",
          try: "Finde mir einen Flug von Berlin nach Mallorca im Mai.",
        },
      },
    ],
  },
  {
    id: "family",
    title: { en: "Family & photos", de: "Familie & Fotos" },
    lessons: [
      {
        en: {
          title: "Messages from the grandchildren",
          body: "Young people write in short forms and emojis. Ask Grace what they mean, without feeling silly.",
          try: "What does \"lol\" mean in a message from my grandson?",
        },
        de: {
          title: "Nachrichten der Enkel",
          body: "Junge Leute schreiben in Abkürzungen und Emojis. Fragen Sie Grace, was sie bedeuten, ganz ohne Scheu.",
          try: "Was bedeutet „lol“ in einer Nachricht von meinem Enkel?",
        },
      },
      {
        en: {
          title: "Reach your trusted person",
          body: "When something feels wrong, Grace helps you reach your trusted person with one tap.",
          try: "I got a strange message. Help me tell my daughter about it.",
        },
        de: {
          title: "Ihre Vertrauensperson erreichen",
          body: "Wenn sich etwas falsch anfühlt, hilft Grace Ihnen, Ihre Vertrauensperson mit einem Tipp zu erreichen.",
          try: "Ich habe eine seltsame Nachricht bekommen. Hilf mir, meiner Tochter davon zu erzählen.",
        },
      },
      {
        en: {
          title: "Write a warm reply",
          body: "Not sure what to answer? Grace suggests a short, warm message in your own words.",
          try: "Help me write a birthday message for my granddaughter.",
        },
        de: {
          title: "Eine herzliche Antwort schreiben",
          body: "Sie wissen nicht, was Sie antworten sollen? Grace schlägt eine kurze, herzliche Nachricht vor, in Ihren Worten.",
          try: "Hilf mir, eine Geburtstagsnachricht für meine Enkelin zu schreiben.",
        },
      },
    ],
  },
  {
    id: "ai",
    title: { en: "Talking to AI", de: "Mit KI sprechen" },
    lessons: [
      {
        en: {
          title: "What AI is",
          body: "AI is a computer program that understands language. It can explain, sum up and write. It can also be wrong, so double-check important things.",
          try: "What is AI, in simple words?",
        },
        de: {
          title: "Was KI ist",
          body: "KI ist ein Computerprogramm, das Sprache versteht. Es kann erklären, zusammenfassen und schreiben. Es kann sich auch irren, prüfen Sie Wichtiges deshalb nach.",
          try: "Was ist KI, in einfachen Worten?",
        },
      },
      {
        en: {
          title: "Ask good questions",
          body: "Say what you want and what it is about. \"Explain this letter in simple words\" works better than \"What's this?\"",
          try: "What is a good way to ask an AI a question?",
        },
        de: {
          title: "Gute Fragen stellen",
          body: "Sagen Sie, was Sie möchten und worum es geht. „Erkläre mir diesen Brief in einfachen Worten“ klappt besser als „Was ist das?“",
          try: "Wie stelle ich einer KI eine gute Frage?",
        },
      },
      {
        en: {
          title: "Ask again, as often as you like",
          body: "If an answer is unclear, just ask again or say: \"Simpler, please.\" Grace never minds.",
          try: "Can AI explain things more simply if I ask?",
        },
        de: {
          title: "Nachfragen, so oft Sie möchten",
          body: "Wenn eine Antwort unklar ist, fragen Sie einfach nach oder sagen Sie: „Bitte einfacher.“ Grace macht das nichts aus.",
          try: "Kann eine KI Dinge einfacher erklären, wenn ich darum bitte?",
        },
      },
    ],
  },
];

export function findTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}
