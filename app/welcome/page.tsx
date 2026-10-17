"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  BackIcon,
  BellIcon,
  BusIcon,
  CheckIcon,
  MailIcon,
  PillIcon,
  ShieldIcon,
  SmartphoneIcon,
  SpeakerIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { haptic } from "@/lib/haptics";
import { useAssistant, updateAssistant, VOICES, type VoiceId } from "@/lib/assistant";
import { toggleTopic, updateOnboarding, useOnboarding, type HelpTopic, type TipFrequency } from "@/lib/onboarding";
import { updateProfile, useProfile, type FontSize } from "@/lib/profile";
import { LOCALE } from "@/lib/speech";
import { accountsEnabled } from "@/lib/supabase";
import { markWelcomeSeen } from "@/lib/welcome";
import { WELCOME } from "./copy";

// The free-account step only shows when accounts are set up (Supabase keys present).
const STEPS = ["hero", "who", "name", "topics", "learn", "tips", "size", "trusted", ...(accountsEnabled ? ["account"] : []), "done"] as const;

const TOPIC_ICONS: Record<HelpTopic, (p: { className?: string }) => ReactNode> = {
  scams: ShieldIcon,
  letters: MailIcon,
  phone: SmartphoneIcon,
  health: PillIcon,
  transport: BusIcon,
  family: UsersIcon,
};

const SIZES: FontSize[] = ["normal", "large", "xlarge"];
// The "Aa" sample on each text-size button, in the size that choice gives the app.
const SIZE_SAMPLE: Record<FontSize, string> = { normal: "text-[19px]", large: "text-[22px]", xlarge: "text-[25px]" };
// Days that get a tip in the habit preview (Monday first).
const TIP_DAYS: Record<TipFrequency, boolean[]> = {
  daily: [true, true, true, true, true, true, true],
  weekly: [true, false, true, false, true, false, false],
  ask: [false, false, false, false, false, false, false],
};

const title = "font-serif text-[clamp(26px,8vw,34px)] font-medium leading-[1.08] text-ink";
const body = "mt-3 text-[1.05rem] leading-snug text-muted";
const field =
  "min-h-16 w-full rounded-full border border-white/80 bg-white/70 px-6 text-[1.2rem] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none placeholder:text-muted/60 focus:ring-4 focus:ring-moss/25";

// Grace's app icon: white petal flower on the moss gradient squircle.
function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/grace-logo.svg" alt="" width={112} height={112} className={`shadow-[0_24px_60px_rgba(63,90,58,0.35)] ${className}`} />
  );
}

// One big tappable answer row: optional line icon, label and hint, and a radio circle or check box.
function Choice({
  selected,
  multi,
  onClick,
  icon,
  label,
  hint,
}: {
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
  icon?: ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={() => {
        haptic();
        onClick();
      }}
      className={`glass flex min-h-16 w-full items-center gap-4 rounded-[24px] px-5 py-3 text-left transition-[transform,box-shadow] active:scale-[0.98] ${
        selected ? "ring-2 ring-moss" : ""
      }`}
    >
      {icon && <span className={`shrink-0 ${selected ? "text-moss" : "text-ink"}`}>{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[1.05rem] font-bold leading-tight text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-[0.85rem] leading-snug text-muted">{hint}</span>}
      </span>
      <span
        aria-hidden
        className={`flex h-7 w-7 shrink-0 items-center justify-center border-2 transition-colors ${multi ? "rounded-lg" : "rounded-full"} ${
          selected ? "border-moss bg-moss text-white" : "border-ink/25 bg-white/60"
        }`}
      >
        {selected && (multi ? <CheckIcon className="h-5 w-5" /> : <span className="h-2.5 w-2.5 rounded-full bg-white" />)}
      </span>
    </button>
  );
}

// Plays a short sample in the phone's own voice; the pitch hints at the chosen Gemini voice.
function preview(text: string, locale: string, rate: number, pitch: number) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale;
  u.rate = rate;
  u.pitch = pitch;
  window.speechSynthesis.speak(u);
}

// The "Grace explains, you learn" picture: a letter, Grace's answer and the three answer parts, all in glass.
function LearnArt({ steps }: { steps: readonly string[] }) {
  return (
    <div aria-hidden className="relative mx-auto h-[min(230px,30dvh)] w-full max-w-[320px]">
      <span className="absolute bottom-0 left-[24%] h-20 w-20 rounded-full bg-[rgba(255,196,160,0.55)] blur-xl" />
      <span className="absolute -bottom-2 right-[6%] h-16 w-16 rounded-full bg-[rgba(170,196,150,0.6)] blur-xl" />
      <div className="absolute left-[8%] top-[18%] h-[60%] w-[46%] -rotate-6 rounded-[22px] glass p-4">
        <span className="block h-2 w-1/2 rounded-full bg-ink/25" />
        <span className="mt-3 block h-2 w-full rounded-full bg-ink/15" />
        <span className="mt-2 block h-2 w-5/6 rounded-full bg-ink/15" />
        <span className="mt-2 block h-2 w-full rounded-full bg-ink/15" />
        <span className="mt-2 block h-2 w-2/3 rounded-full bg-ink/15" />
      </div>
      <div className="absolute right-[4%] top-[4%] flex w-[56%] flex-col gap-2 rounded-[24px] glass-moss p-3 shadow-[0_18px_40px_rgba(63,90,58,0.18)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/grace-mark-moss.svg" alt="" width={28} height={28} className="h-7 w-7" />
        {steps.map((s, i) => (
          <span key={s} className="flex items-center gap-2 rounded-full bg-white/75 px-2.5 py-1.5 text-[13px] font-bold text-learn">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss text-[11px] text-white">{i + 1}</span>
            <span className="truncate">{s}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// First-run onboarding: one question per screen, then the Talk tab. Skippable at every step.
export default function Welcome() {
  const router = useRouter();
  const profile = useProfile();
  const onboarding = useOnboarding();
  const assistant = useAssistant();
  const w = WELCOME[profile.lang];
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [name, setName] = useState("");
  const [trustedName, setTrustedName] = useState("");
  const [trustedPhone, setTrustedPhone] = useState("");

  const id = STEPS[step];
  const them = onboarding.setupFor === "family";
  const shownName = name.trim() || (profile.name !== "Ingrid" ? profile.name : "");

  function saveTyped() {
    if (name.trim()) updateProfile({ name: name.trim().slice(0, 40) });
    if (trustedName.trim()) {
      updateProfile({
        trusted: { name: trustedName.trim().slice(0, 40), relation: w.trustedRelation, phone: trustedPhone.trim() || profile.trusted.phone },
      });
    }
  }

  function finish(to = "/") {
    saveTyped();
    markWelcomeSeen();
    router.replace(to);
  }

  function go(delta: 1 | -1) {
    saveTyped();
    setDir(delta);
    setStep(step + delta);
  }

  const sizeLabel = w.sizes[profile.fontSize];
  const trustedShown = trustedName.trim();
  const cta = id === "hero" ? w.getStarted : id === "done" ? w.start : id === "account" ? w.createAccount : w.next;

  return (
    <main className="mx-auto flex h-dvh w-full max-w-xl flex-col overflow-hidden">
      {/* Top bar: back, progress capsule and Skip. The hero and the last screen keep the bar quiet. */}
      <div className="flex min-h-12 items-center gap-3 px-5 pt-[calc(14px+env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={w.back}
          className={`glass flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink active:scale-95 ${step === 0 ? "invisible" : ""}`}
        >
          <BackIcon className="h-6 w-6" />
        </button>
        <div
          role="progressbar"
          aria-label={w.progress(step + 1, STEPS.length)}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={step + 1}
          className="glass h-3 flex-1 overflow-hidden rounded-full p-0.5"
        >
          <span
            className="block h-full rounded-full bg-moss transition-[width] duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <button
          type="button"
          onClick={() => finish()}
          className={`min-h-12 shrink-0 rounded-full px-3 text-[1rem] font-bold text-moss ${id === "done" ? "invisible" : ""}`}
        >
          {w.skip}
        </button>
      </div>

      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(e) => {
          e.preventDefault();
          if (id === "done") finish();
          else if (id === "account") finish("/signup?next=/");
          else go(1);
        }}
      >
        {/* Only the question scrolls; the button below always stays on screen. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
          <div
            key={step}
            className={`flex min-h-full flex-col justify-center gap-6 py-6 ${dir === 1 ? "row-in" : "answer-in"}`}
          >
            {id === "hero" && (
              <div className="flex flex-col items-center text-center">
                <Logo className="h-[min(132px,22dvh)] w-[min(132px,22dvh)] rounded-[30%]" />
                <h1 className="mt-8 font-serif text-[clamp(34px,11vw,46px)] font-medium leading-[1.02] text-ink">{w.meetTitle}</h1>
                <p className="mt-3 max-w-[22ch] text-[1.2rem] leading-snug text-ink">{w.meetBody}</p>
                <p className="mt-5 rounded-full glass px-4 py-2 text-[0.9rem] font-bold text-moss">{w.meetSmall}</p>
              </div>
            )}

            {id === "who" && (
              <>
                <h1 className={title}>{w.whoTitle}</h1>
                <div role="radiogroup" aria-label={w.whoTitle} className="flex flex-col gap-3">
                  <Choice
                    selected={!them}
                    onClick={() => updateOnboarding({ setupFor: "me" })}
                    icon={<UserIcon className="h-7 w-7" />}
                    label={w.whoMe}
                    hint={w.whoMeHint}
                  />
                  <Choice
                    selected={them}
                    onClick={() => updateOnboarding({ setupFor: "family" })}
                    icon={<UsersIcon className="h-7 w-7" />}
                    label={w.whoFamily}
                    hint={w.whoFamilyHint}
                  />
                </div>
              </>
            )}

            {id === "name" && (
              <>
                <div>
                  <h1 className={title}>{w.nameTitle(them)}</h1>
                  <p className={body}>{w.nameBody(them)}</p>
                </div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={w.namePlaceholder(them)}
                  aria-label={w.namePlaceholder(them)}
                  autoComplete={them ? "off" : "given-name"}
                  autoFocus
                  maxLength={40}
                  className={`${field} font-serif text-[1.5rem]`}
                />
              </>
            )}

            {id === "topics" && (
              <>
                <div>
                  <h1 className={title}>{w.topicsTitle(them)}</h1>
                  <p className={body}>{w.topicsBody}</p>
                </div>
                <div className="flex flex-col gap-3">
                  {(Object.keys(TOPIC_ICONS) as HelpTopic[]).map((t) => {
                    const Icon = TOPIC_ICONS[t];
                    return (
                      <Choice
                        key={t}
                        multi
                        selected={onboarding.topics.includes(t)}
                        onClick={() => toggleTopic(t)}
                        icon={<Icon className="h-7 w-7" />}
                        label={w.topics[t]}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {id === "learn" && (
              <>
                <LearnArt steps={w.learnSteps} />
                <div className="text-center">
                  <h1 className={title}>{w.learnTitle}</h1>
                  <p className={`${body} mx-auto max-w-[34ch]`}>{w.learnBody}</p>
                </div>
              </>
            )}

            {id === "tips" && (
              <>
                <h1 className={title}>{w.tipsTitle(them)}</h1>
                <div role="radiogroup" aria-label={w.tipsTitle(them)} className="flex flex-col gap-3">
                  {(
                    [
                      ["daily", w.tipsDaily],
                      ["weekly", w.tipsWeekly],
                      ["ask", w.tipsAsk],
                    ] as const
                  ).map(([v, label]) => (
                    <Choice key={v} selected={onboarding.tips === v} onClick={() => updateOnboarding({ tips: v })} label={label} />
                  ))}
                </div>
                {/* Daily-habit preview: which days get a tip, and when. */}
                <div className="glass-moss rounded-[24px] p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moss text-white">
                      <BellIcon className="h-5 w-5" />
                    </span>
                    <p className="min-w-0 flex-1 text-[1rem] font-bold leading-tight text-learn">
                      {onboarding.tips === "ask" ? w.habitAsk : w.habitAt}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-7 gap-1.5" aria-hidden>
                    {w.days.map((d, i) => (
                      <span key={i} className="flex flex-col items-center gap-1.5">
                        <span
                          className={`h-8 w-8 max-w-full rounded-full transition-colors ${
                            TIP_DAYS[onboarding.tips][i] ? "bg-moss shadow-[0_4px_10px_rgba(63,90,58,0.3)]" : "border-2 border-moss/25 bg-white/50"
                          }`}
                        />
                        <span className="text-[13px] font-bold text-muted">{d}</span>
                      </span>
                    ))}
                  </div>
                  {onboarding.tips !== "ask" && (
                    <label className="mt-4 flex items-center justify-between gap-3 border-t border-moss/15 pt-3">
                      <span className="text-[1rem] font-bold text-ink">{w.timeLabel}</span>
                      <input
                        type="time"
                        value={onboarding.tipTime}
                        onChange={(e) => e.target.value && updateOnboarding({ tipTime: e.target.value })}
                        className="min-h-12 rounded-full bg-white/80 px-4 text-[1.05rem] font-bold text-ink outline-none focus:ring-4 focus:ring-moss/25"
                      />
                    </label>
                  )}
                </div>
              </>
            )}

            {id === "size" && (
              <>
                <h1 className={title}>{w.sizeTitle}</h1>
                <div role="radiogroup" aria-label={w.sizeTitle} className="grid grid-cols-3 gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={profile.fontSize === s}
                      onClick={() => {
                        haptic();
                        updateProfile({ fontSize: s });
                      }}
                      className={`glass flex min-h-24 flex-col items-center justify-center gap-1 rounded-[22px] px-1 active:scale-95 ${
                        profile.fontSize === s ? "ring-2 ring-moss" : ""
                      }`}
                    >
                      <span className={`font-serif font-medium leading-none text-ink ${SIZE_SAMPLE[s]}`}>Aa</span>
                      <span className="text-[13px] font-bold leading-tight text-muted">{w.sizes[s]}</span>
                    </button>
                  ))}
                </div>
                {/* Live preview: rem-based, so it grows with the choice above. */}
                <p className="glass rounded-[22px] p-4 text-[1rem] leading-snug text-ink">{w.sizePreview}</p>
                <div>
                  <h2 className="flex items-center gap-2 text-[1rem] font-bold text-muted">
                    <SpeakerIcon className="h-5 w-5" />
                    {w.voiceTitle}
                  </h2>
                  <div role="radiogroup" aria-label={w.voiceTitle} className="mt-2 flex flex-wrap gap-2">
                    {VOICES.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        role="radio"
                        aria-checked={assistant.voice === v.id}
                        onClick={() => {
                          haptic();
                          updateAssistant({ voice: v.id as VoiceId });
                          preview(w.voiceSample(shownName || profile.name), LOCALE[profile.lang], profile.speechRate, v.pitch);
                        }}
                        className={`min-h-12 rounded-full px-4 text-[0.95rem] font-bold active:scale-95 ${
                          assistant.voice === v.id ? "bg-moss text-white shadow-[0_8px_20px_rgba(63,90,58,0.3)]" : "glass text-ink"
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[0.9rem] text-muted">{VOICES.find((v) => v.id === assistant.voice)?.[profile.lang]}</p>
                </div>
              </>
            )}

            {id === "trusted" && (
              <>
                <div>
                  <h1 className={title}>{w.trustedTitle(them)}</h1>
                  <p className={body}>{w.trustedBody}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <input
                    value={trustedName}
                    onChange={(e) => setTrustedName(e.target.value)}
                    placeholder={w.trustedName}
                    aria-label={w.trustedName}
                    autoComplete="off"
                    maxLength={40}
                    className={field}
                  />
                  <input
                    value={trustedPhone}
                    onChange={(e) => setTrustedPhone(e.target.value)}
                    placeholder={w.trustedPhone}
                    aria-label={w.trustedPhone}
                    type="tel"
                    inputMode="tel"
                    autoComplete="off"
                    maxLength={30}
                    className={field}
                  />
                </div>
              </>
            )}

            {id === "account" && (
              <div className="flex flex-col items-center text-center">
                <Logo className="h-20 w-20 rounded-[30%]" />
                <h1 className={`${title} mt-8`}>{w.saveTitle}</h1>
                <p className={`${body} max-w-[30ch]`}>{w.saveBody}</p>
              </div>
            )}

            {id === "done" && (
              <div className="flex flex-col items-center text-center">
                <span className="relative">
                  <Logo className="h-24 w-24 rounded-[30%]" />
                  <span className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-paper bg-moss text-white">
                    <CheckIcon className="h-5 w-5" />
                  </span>
                </span>
                <h1 className={`${title} mt-8`}>{w.doneTitle(shownName)}</h1>
                <p className={`${body} max-w-[30ch]`}>{w.doneBody}</p>
                <ul className="mt-6 flex flex-wrap justify-center gap-2">
                  {[
                    ...onboarding.topics.map((t) => w.topics[t]),
                    w.doneTips[onboarding.tips],
                    w.doneSize(sizeLabel),
                    ...(trustedShown ? [w.doneTrusted(trustedShown)] : []),
                  ].map((chip) => (
                    <li key={chip} className="glass rounded-full px-4 py-2 text-[0.9rem] font-bold text-ink">
                      {chip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3">
          <button
            type="submit"
            className="min-h-16 w-full rounded-full bg-moss text-[1.1rem] font-bold text-white shadow-[0_14px_34px_rgba(63,90,58,0.35)] transition-transform active:scale-[0.98]"
          >
            {cta}
          </button>
          {id === "account" && (
            <div className="mt-2 flex flex-col gap-1">
              <button type="button" onClick={() => finish("/signin?next=/")} className="glass min-h-14 w-full rounded-full text-[1.05rem] font-bold text-ink">
                {w.signIn}
              </button>
              <button type="button" onClick={() => go(1)} className="min-h-12 w-full rounded-full text-[1rem] font-bold text-moss underline underline-offset-4">
                {w.noAccount}
              </button>
            </div>
          )}
        </div>
      </form>
    </main>
  );
}
