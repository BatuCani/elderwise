"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { CameraIcon, ChatIcon, CheckIcon, ListIcon } from "@/components/icons";
import { TOPICS } from "@/lib/lessons";
import { useProfile } from "@/lib/profile";
import { LEARN_TEXT } from "./text";
import { TopicArt } from "./TopicArt";

// Learn tab: search, four quick links and the topic tiles. Each topic has three short lessons.
export default function LearnPage() {
  const profile = useProfile();
  const lang = profile.lang;
  const L = LEARN_TEXT[lang];
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const topics = q
    ? TOPICS.filter(
        (t) =>
          t.title[lang].toLowerCase().includes(q) ||
          t.lessons.some((l) => l[lang].title.toLowerCase().includes(q) || l[lang].body.toLowerCase().includes(q)),
      )
    : TOPICS;

  const quick: { href: string; label: string; icon: ReactNode }[] = [
    { href: "/answers", label: L.quick.answers, icon: <ListIcon className="h-7 w-7" /> },
    { href: "/profile#skills", label: L.quick.skills, icon: <CheckIcon className="h-7 w-7" /> },
    { href: "/", label: L.quick.ask, icon: <ChatIcon className="h-7 w-7" /> },
    { href: "/scan", label: L.quick.scan, icon: <CameraIcon className="h-7 w-7" /> },
  ];

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-5 pb-40 pt-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-4xl font-medium leading-tight text-ink">{L.title}</h1>
        <p className="text-lg leading-snug text-muted">{L.intro}</p>
      </header>

      <label className="glass flex min-h-14 items-center gap-3 rounded-full px-5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden="true"
          className="h-6 w-6 shrink-0 text-muted"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <span className="sr-only">{L.search}</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={L.search}
          className="min-h-12 min-w-0 flex-1 bg-transparent text-lg text-ink outline-none placeholder:text-muted"
        />
      </label>

      {!q && (
        <nav aria-label={L.title} className="grid grid-cols-2 gap-3">
          {quick.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="glass flex min-h-20 flex-col justify-between gap-2 rounded-[22px] p-4 text-ink"
            >
              <span className="text-moss">{item.icon}</span>
              <span className="text-lg font-bold leading-tight">{item.label}</span>
            </Link>
          ))}
        </nav>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-muted">{L.topics}</h2>
        {topics.length === 0 ? (
          <p className="text-lg leading-snug text-ink">{L.noResults}</p>
        ) : (
          <div className="tile-grid gap-3">
            {topics.map((t) => (
              <Link
                key={t.id}
                href={`/learn/${t.id}`}
                className="glass relative flex min-h-44 flex-col justify-between gap-3 rounded-[24px] border-2 border-white/80 p-4 text-ink"
              >
                <span className="absolute right-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-sm font-bold text-moss">
                  {L.lessons(t.lessons.length)}
                </span>
                <TopicArt id={t.id} className="mt-6 h-16 w-16" />
                <span className="tile-title text-lg font-bold leading-tight">{t.title[lang]}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
