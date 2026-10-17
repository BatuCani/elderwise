"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VoiceBeam } from "voice-glow";
import { CameraIcon, MicIcon } from "@/components/icons";
import { updateProfile, useProfile } from "@/lib/profile";
import { markWelcomeSeen } from "@/lib/welcome";
import { WELCOME } from "./copy";

// A gentle, breathing level so the glow on "Just talk" looks like someone speaking.
const demoLevel = () => 0.45 + 0.25 * Math.sin(performance.now() / 450) * Math.sin(performance.now() / 1300);

// Grace's app icon: white petal flower on the moss gradient squircle.
function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/grace-logo.svg" alt="" width={112} height={112} className={`rounded-[26px] shadow-[0_24px_60px_rgba(63,90,58,0.35)] ${className}`} />
  );
}

// First-run onboarding: three calm screens, then the Talk tab. Skippable at every step.
export default function Welcome() {
  const router = useRouter();
  const profile = useProfile();
  const w = WELCOME[profile.lang];
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");

  function finish() {
    if (name.trim()) updateProfile({ name: name.trim() });
    markWelcomeSeen();
    router.replace("/");
  }

  const last = step === 2;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-6 pb-[calc(32px+env(safe-area-inset-bottom))] pt-[calc(24px+env(safe-area-inset-top))]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="whitespace-nowrap text-lg text-muted">{w.step(step + 1)}</p>
        <button onClick={finish} className="glass min-h-12 rounded-full px-6 text-lg font-bold text-ink">
          {w.skip}
        </button>
      </div>

      <form
        key={step}
        className="flex flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          if (last) finish();
          else setStep(step + 1);
        }}
      >
        <div className="flex flex-1 flex-col justify-center gap-8 py-6">
          {step === 0 && (
            <>
              <Logo className="h-28 w-28 self-center" />
              <div className="glass rounded-[32px] p-6">
                <h1 className="font-serif text-[36px] font-medium leading-[1.05] text-ink">{w.meetTitle}</h1>
                <p className="mt-3 text-[22px] leading-snug text-ink">{w.meetBody}</p>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <VoiceBeam type="mobile" level={demoLevel} sensitivity={5} reach={1.8} colorVariant="colorful" theme="light">
                <div aria-hidden className="glass flex items-center gap-1 rounded-full p-2">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/70 text-ink">
                    <CameraIcon className="h-7 w-7" />
                  </span>
                  <span className="flex-1 px-1 text-lg text-muted">{w.talkDemo}</span>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-moss text-white">
                    <MicIcon className="h-7 w-7" />
                  </span>
                </div>
              </VoiceBeam>
              <div className="glass rounded-[32px] p-6">
                <h1 className="font-serif text-[36px] font-medium leading-[1.05] text-ink">{w.talkTitle}</h1>
                <p className="mt-3 text-[22px] leading-snug text-ink">{w.talkBody}</p>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="glass rounded-[32px] p-6">
              <h1 className="font-serif text-[36px] font-medium leading-[1.05] text-ink">{w.nameTitle}</h1>
              <p className="mt-3 text-[22px] leading-snug text-ink">{w.nameBody}</p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={w.namePlaceholder}
                aria-label={w.namePlaceholder}
                autoComplete="given-name"
                autoFocus
                maxLength={40}
                className="mt-6 min-h-20 w-full rounded-3xl border border-line bg-white/80 px-5 font-serif text-3xl text-ink outline-none placeholder:text-muted/70 focus:ring-4 focus:ring-moss/30"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className={`h-2.5 rounded-full transition-all ${i === step ? "w-8 bg-moss" : "w-2.5 bg-moss/25"}`} />
            ))}
          </div>
          <button type="submit" className="min-h-16 w-full rounded-full bg-moss text-xl font-bold text-white shadow-lg">
            {last ? w.start : w.next}
          </button>
        </div>
      </form>
    </main>
  );
}
