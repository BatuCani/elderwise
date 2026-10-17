"use client";

import type { ReactNode } from "react";
import { GlobeIcon, PhoneIcon, SpeakerIcon, TextSizeIcon } from "@/components/icons";
import { updateProfile, useProfile, type FontSize } from "@/lib/profile";
import { TEXT } from "../copy";

const FONT_ORDER: FontSize[] = ["normal", "large", "xlarge"];

function Row({ icon, label, value, onClick }: { icon: ReactNode; label: string; value: string; onClick: () => void }) {
  return (
    // flex-wrap: with very large text the value moves to its own line instead of running off the screen.
    <button onClick={onClick} className="flex min-h-16 w-full flex-wrap items-center gap-x-4 gap-y-1 glass rounded-[20px] px-5 py-3 text-left">
      <span className="shrink-0 text-muted">{icon}</span>
      <span className="min-w-0 flex-[1_1_auto] break-words text-lg font-bold text-ink">{label}</span>
      <span className="ml-auto text-lg font-bold text-moss">{value}</span>
    </button>
  );
}

// Profile tab: who you are, three settings, and your trusted person.
export default function ProfilePage() {
  const profile = useProfile();
  const t = TEXT[profile.lang];
  const nextFont = FONT_ORDER[(FONT_ORDER.indexOf(profile.fontSize) + 1) % FONT_ORDER.length];

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-7 px-5 pb-40 pt-8">
      <header className="flex items-center gap-4">
        <div aria-hidden className="flex h-20 w-20 items-center justify-center rounded-full bg-moss font-serif text-4xl font-medium text-white">
          {profile.name[0]}
        </div>
        <h1 className="font-serif text-4xl font-medium text-ink">{profile.name}</h1>
      </header>

      <section className="flex flex-col gap-3">
        <Row
          icon={<TextSizeIcon className="h-7 w-7" />}
          label={t.fontSize}
          value={t.fontSizes[profile.fontSize]}
          onClick={() => updateProfile({ fontSize: nextFont })}
        />
        <div className="glass rounded-[20px] px-5 py-4">
          <div className="flex items-center gap-4">
            <SpeakerIcon className="h-7 w-7 text-muted" />
            <label htmlFor="rate" className="flex-1 text-lg font-bold text-ink">
              {t.speechRate}
            </label>
          </div>
          <input
            id="rate"
            type="range"
            min={0.6}
            max={1.2}
            step={0.05}
            value={profile.speechRate}
            // Screen readers say "Slow / Normal / Fast" instead of "0.9".
            aria-valuetext={profile.speechRate < 0.8 ? t.slow : profile.speechRate > 1 ? t.fast : t.fontSizes.normal}
            onChange={(e) => updateProfile({ speechRate: Number(e.target.value) })}
            className="rate-slider mt-3 w-full"
          />
          <div className="flex justify-between text-base text-muted">
            <span>{t.slow}</span>
            <span>{t.fast}</span>
          </div>
        </div>
        <Row
          icon={<GlobeIcon className="h-7 w-7" />}
          label={t.language}
          value={profile.lang === "en" ? "English" : "Deutsch"}
          onClick={() => updateProfile({ lang: profile.lang === "en" ? "de" : "en" })}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-muted">{t.trustedTitle}</h2>
        <div className="flex flex-wrap items-center gap-4 glass rounded-[20px] p-4">
          <div aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-paper font-serif text-2xl font-medium text-ink">
            {profile.trusted.name[0]}
          </div>
          <div className="min-w-0 flex-[1_1_auto]">
            <p className="text-xl font-bold text-ink">{profile.trusted.name}</p>
            <p className="text-lg text-muted">{t.relations[profile.trusted.relation] ?? profile.trusted.relation}</p>
          </div>
          <a
            href={`tel:${profile.trusted.phone.replace(/\s/g, "")}`}
            className="ml-auto flex min-h-12 items-center gap-2 rounded-full bg-moss px-5 text-lg font-bold text-white"
          >
            <PhoneIcon className="h-6 w-6 shrink-0" />
            {t.call}
          </a>
        </div>
      </section>
    </main>
  );
}
