"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackIcon, ChatIcon } from "@/components/icons";
import { addEntry, setPending } from "@/lib/answers";
import { askClaude } from "@/lib/ask";
import { findTopic, type TopicId } from "@/lib/lessons";
import { useProfile } from "@/lib/profile";
import { speak, spokenText, unlockSpeech } from "@/lib/speech";
import { LEARN_TEXT } from "../text";
import { TopicArt } from "../TopicArt";

// A topic with its three lessons. "Try it with Grace" asks Grace the lesson's example question,
// so the person sees a real answer card (and its "You learned" note) on the Answers tab.
export function TopicView({ id }: { id: TopicId }) {
  const router = useRouter();
  const profile = useProfile();
  const lang = profile.lang;
  const L = LEARN_TEXT[lang];
  const topic = findTopic(id);
  const [busy, setBusy] = useState<number | null>(null);
  const [failed, setFailed] = useState<number | null>(null);

  if (!topic) return null;

  async function tryIt(index: number, question: string) {
    if (busy !== null) return;
    unlockSpeech();
    setBusy(index);
    setFailed(null);
    setPending(true);
    try {
      const answer = await askClaude(question, null, profile);
      addEntry(question, answer);
      speak(spokenText(answer), lang, profile.speechRate);
      router.push("/answers");
    } catch {
      setFailed(index);
      setBusy(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-5 pb-40 pt-8">
      <Link href="/learn" className="glass flex min-h-12 w-fit items-center gap-2 rounded-full px-5 text-lg font-bold text-ink">
        <BackIcon className="h-6 w-6" />
        {L.back}
      </Link>

      <header className="flex items-center gap-4">
        <TopicArt id={topic.id} className="h-20 w-20 shrink-0" />
        <div className="min-w-0">
          <h1 className="font-serif text-4xl font-medium leading-tight text-ink">{topic.title[lang]}</h1>
          <p className="mt-1 text-lg text-muted">{L.lessons(topic.lessons.length)}</p>
        </div>
      </header>

      <ol className="flex flex-col gap-4">
        {topic.lessons.map((lesson, i) => {
          const w = lesson[lang];
          return (
            <li key={i} className="rounded-3xl bg-white p-6 text-ink shadow-[0_8px_24px_rgba(30,36,32,0.08)]">
              <p className="mb-2 text-base font-bold uppercase tracking-[0.08em] text-muted">{L.lesson(i + 1)}</p>
              <h2 className="font-serif text-3xl font-medium leading-tight">{w.title}</h2>
              <p className="mt-3 text-xl leading-snug">{w.body}</p>
              <div className="mt-5 rounded-2xl bg-paper p-4">
                <p className="text-base font-bold text-muted">{L.sayIt}</p>
                <p className="mt-1 text-lg font-bold leading-snug">“{w.try}”</p>
              </div>
              <button
                type="button"
                onClick={() => tryIt(i, w.try)}
                disabled={busy !== null}
                className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-moss px-5 py-3 text-center text-lg font-bold text-white disabled:opacity-60"
              >
                <ChatIcon className="h-6 w-6 shrink-0" />
                {busy === i ? L.asking : L.tryIt}
              </button>
              {failed === i && <p className="mt-3 text-lg font-bold text-warn">{L.error}</p>}
            </li>
          );
        })}
      </ol>
    </main>
  );
}
