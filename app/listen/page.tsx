"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BackIcon } from "@/components/icons";
import { addEntry, setPending } from "@/lib/answers";
import { useProfile } from "@/lib/profile";
import { getRecognition, LOCALE, speak, spokenText, unlockSpeech, type Recognition } from "@/lib/speech";
import type { Answer } from "@/prompts/elderwise";

// "Listen for me": at the doctor's or a counter, Grace writes along live in very large text.
// "Done" sends the text to Claude (/api/listen), which turns it into one answer card on the Answers tab.
// Only text is kept, never sound.

const TEXT = {
  en: {
    title: "Listen for me",
    back: "Back",
    consentKicker: "Show this to the person speaking",
    consent: "I hear poorly. May my phone write down what you say? Nothing is saved as sound.",
    start: "Start writing along",
    privacy: "Only the text stays on this phone. When you tap Done, Grace sends it to Claude to sum it up.",
    writing: "Writing along",
    waiting: "Waiting for someone to speak…",
    done: "Done, sum it up",
    cancel: "Cancel",
    summing: "Summing up the conversation…",
    error: "That did not work. Your text is still here.",
    retry: "Try again",
    tooShort: "I did not hear enough yet. Keep the phone close to the person speaking.",
    unsupported: "This browser cannot write along. Please open Grace in Safari or Chrome.",
    entry: "Conversation, written along",
  },
  de: {
    title: "Für mich zuhören",
    back: "Zurück",
    consentKicker: "Zeigen Sie das Ihrem Gegenüber",
    consent: "Ich höre schlecht. Darf mein Handy mitschreiben, was Sie sagen? Es wird kein Ton gespeichert.",
    start: "Mitschreiben starten",
    privacy: "Nur der Text bleibt auf diesem Handy. Wenn Sie auf Fertig tippen, schickt Grace ihn an Claude zum Zusammenfassen.",
    writing: "Schreibt mit",
    waiting: "Warte, bis jemand spricht…",
    done: "Fertig, zusammenfassen",
    cancel: "Abbrechen",
    summing: "Ich fasse das Gespräch zusammen…",
    error: "Das hat nicht geklappt. Ihr Text ist noch da.",
    retry: "Nochmal versuchen",
    tooShort: "Ich habe noch zu wenig gehört. Halten Sie das Handy näher an die sprechende Person.",
    unsupported: "Dieser Browser kann nicht mitschreiben. Bitte öffnen Sie Grace in Safari oder Chrome.",
    entry: "Gespräch, mitgeschrieben",
  },
} as const;

type Phase = "consent" | "listening" | "summing" | "error" | "unsupported";
type WakeLock = { release: () => Promise<void> };
type WakeNavigator = Navigator & { wakeLock?: { request: (type: "screen") => Promise<WakeLock> } };

// Speech recognition fails right away when the mic is blocked; after this many errors in a row we stop.
const MAX_ERRORS = 4;

export default function ListenPage() {
  const router = useRouter();
  const profile = useProfile();
  const L = TEXT[profile.lang];
  const [phase, setPhase] = useState<Phase>("consent");
  // Text from earlier recognition runs, and the run that is happening right now.
  const [done, setDone] = useState("");
  const [current, setCurrent] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const onRef = useRef(false);
  const doneRef = useRef("");
  const currentRef = useRef("");
  const errorsRef = useRef(0);
  const lockRef = useRef<WakeLock | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const text = `${done} ${current}`.trim();

  // Keep the newest words in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [text]);

  // Leaving the page stops listening and lets the screen sleep again.
  useEffect(
    () => () => {
      onRef.current = false;
      recRef.current?.stop();
      lockRef.current?.release().catch(() => {});
    },
    [],
  );

  // One recognition run. Browsers end a run after a pause, so it restarts until Done or Cancel.
  function run() {
    const Ctor = getRecognition();
    if (!Ctor) {
      onRef.current = false;
      setPhase("unsupported");
      return;
    }
    const rec = new Ctor();
    rec.lang = LOCALE[profile.lang];
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      errorsRef.current = 0;
      currentRef.current = Array.from(e.results, (r) => r[0].transcript).join(" ");
      setCurrent(currentRef.current);
    };
    rec.onerror = () => {
      errorsRef.current += 1;
    };
    rec.onend = () => {
      recRef.current = null;
      doneRef.current = `${doneRef.current} ${currentRef.current}`.trim();
      currentRef.current = "";
      setDone(doneRef.current);
      setCurrent("");
      if (!onRef.current) return;
      if (errorsRef.current >= MAX_ERRORS) {
        onRef.current = false;
        setPhase("unsupported");
        return;
      }
      run();
    };
    recRef.current = rec;
    rec.start();
  }

  async function start() {
    unlockSpeech();
    doneRef.current = "";
    currentRef.current = "";
    errorsRef.current = 0;
    setDone("");
    setCurrent("");
    setHint(null);
    onRef.current = true;
    setPhase("listening");
    run();
    try {
      lockRef.current = (await (navigator as WakeNavigator).wakeLock?.request("screen")) ?? null;
    } catch {
      // No screen wake lock on this phone: writing along still works while the screen is on.
    }
  }

  function stop() {
    onRef.current = false;
    recRef.current?.stop();
    lockRef.current?.release().catch(() => {});
    lockRef.current = null;
  }

  function cancel() {
    stop();
    setPhase("consent");
  }

  async function summarise(transcript: string) {
    setPhase("summing");
    setPending(true);
    try {
      const body = new FormData();
      body.append("lang", profile.lang);
      body.append("transcript", transcript);
      body.append("name", profile.name);
      body.append("trustedName", profile.trusted.name);
      body.append("trustedRelation", profile.trusted.relation);
      body.append(
        "today",
        new Date().toLocaleDateString(LOCALE[profile.lang], { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      );
      const res = await fetch("/api/listen", { method: "POST", body });
      if (!res.ok) throw new Error(String(res.status));
      const answer: Answer = await res.json();
      addEntry(L.entry, answer);
      speak(spokenText(answer), profile.lang, profile.speechRate);
      router.push("/answers");
    } catch {
      setPhase("error");
    } finally {
      setPending(false);
    }
  }

  function finish() {
    const transcript = `${doneRef.current} ${currentRef.current}`.trim();
    if (transcript.length < 10) {
      setHint(L.tooShort);
      return;
    }
    stop();
    summarise(transcript);
  }

  const primary =
    "flex min-h-16 w-full items-center justify-center rounded-full bg-moss px-6 py-3 text-center text-xl font-bold text-white";
  const secondary =
    "glass flex min-h-14 w-full items-center justify-center rounded-full px-6 py-3 text-center text-lg font-bold text-ink";

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-5 pb-44 pt-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl font-medium text-ink">{L.title}</h1>
        {phase === "consent" && (
          <Link href="/" className="glass flex min-h-12 items-center gap-2 rounded-full px-5 text-lg font-bold text-ink">
            <BackIcon className="h-6 w-6" />
            {L.back}
          </Link>
        )}
      </header>

      {phase === "consent" && (
        <>
          <section className="rounded-3xl bg-white p-6 text-ink shadow-[0_8px_24px_rgba(30,36,32,0.08)]">
            <p className="mb-4 text-base font-bold uppercase tracking-[0.08em] text-muted">{L.consentKicker}</p>
            <p className="font-serif text-3xl font-medium leading-snug">{L.consent}</p>
          </section>
          <button type="button" onClick={start} className={primary}>
            {L.start}
          </button>
          <p className="text-lg leading-snug text-muted">{L.privacy}</p>
        </>
      )}

      {phase === "listening" && (
        <>
          <div role="status" className="flex items-center gap-3 text-lg font-bold text-moss">
            <span aria-hidden className="h-4 w-4 animate-pulse rounded-full bg-moss" />
            {L.writing}
          </div>
          <section
            aria-live="polite"
            className="max-h-[48vh] min-h-48 overflow-y-auto rounded-3xl bg-white p-6 text-ink shadow-[0_8px_24px_rgba(30,36,32,0.08)]"
          >
            {text ? (
              <p className="text-3xl font-bold leading-snug">
                {done}
                {current && <span className="text-muted"> {current}</span>}
              </p>
            ) : (
              <p className="text-2xl leading-snug text-muted">{L.waiting}</p>
            )}
            <div ref={endRef} />
          </section>
          {hint && <p className="text-lg font-bold leading-snug text-warn">{hint}</p>}
          <button type="button" onClick={finish} className={primary}>
            {L.done}
          </button>
          <button type="button" onClick={cancel} className={secondary}>
            {L.cancel}
          </button>
        </>
      )}

      {phase === "summing" && (
        <div role="status" className="flex items-center gap-4 rounded-3xl bg-white p-6 text-xl font-bold text-ink">
          <span aria-hidden className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-moss" />
          {L.summing}
        </div>
      )}

      {phase === "error" && (
        <>
          <p className="text-xl font-bold leading-snug text-warn">{L.error}</p>
          <section className="max-h-[40vh] overflow-y-auto rounded-3xl bg-white p-6 text-2xl leading-snug text-ink">{text}</section>
          <button type="button" onClick={() => summarise(text)} className={primary}>
            {L.retry}
          </button>
          <button type="button" onClick={cancel} className={secondary}>
            {L.cancel}
          </button>
        </>
      )}

      {phase === "unsupported" && (
        <>
          <p className="text-xl font-bold leading-snug text-ink">{L.unsupported}</p>
          <Link href="/" className={secondary}>
            {L.back}
          </Link>
        </>
      )}
    </main>
  );
}
