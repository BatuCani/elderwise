"use client";

import { downloadIcs } from "@/components/cards/ics";
import { parseWhen } from "@/components/cards/when";
import { AlertIcon, CalendarIcon, CheckIcon, PhoneIcon } from "@/components/icons";
import type { Profile } from "@/lib/profile";
import type { Answer } from "@/prompts/elderwise";
import type { ScanCopy } from "./copy";

type Props = { c: ScanCopy; answer: Answer; at: number; code: boolean; profile: Profile; onContinue: () => void };

type Step = { label: string; state: "done" | "now" | "next"; action?: React.ReactNode };

// "Letter understood!": a check badge, the short answer, a progress stepper and one big Continue.
// The last step is the useful next move: a calendar reminder for a due date, or telling the trusted person.
export function DoneStep({ c, answer, at, code, profile, onContinue }: Props) {
  const warning = answer.type === "warning";
  const parsed = answer.when ? parseWhen(answer.when, new Date(at)) : null;
  const tel = `tel:${profile.trusted.phone.replace(/\s/g, "")}`;
  const pill = "mt-2 inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-base font-bold";

  const steps: Step[] = [
    { label: c.stepRead, state: "done" },
    { label: c.stepExplained, state: "done" },
  ];
  if (warning) {
    steps.push({
      label: `${c.stepTell} ${profile.trusted.name}`,
      state: "now",
      action: (
        <a href={tel} className={`${pill} bg-warn text-white`}>
          <PhoneIcon className="h-5 w-5" />
          {answer.action?.label ?? `${c.stepTell} ${profile.trusted.name}`}
        </a>
      ),
    });
  } else if (parsed) {
    steps.push({
      label: c.stepReminder,
      state: "now",
      action: (
        <button
          type="button"
          onClick={() =>
            downloadIcs({ title: answer.headline, description: answer.sentence, place: parsed.place, start: parsed.date, hasTime: parsed.hasTime })
          }
          className={`${pill} bg-moss text-white`}
        >
          <CalendarIcon className="h-5 w-5" />
          {answer.when}
        </button>
      ),
    });
  } else {
    steps.push({ label: c.stepSaved, state: "done" });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center pt-2 text-center">
        <span
          className={`scan-pop flex h-24 w-24 items-center justify-center rounded-full text-white ${
            warning ? "bg-warn shadow-[0_14px_34px_rgba(142,36,36,0.3)]" : "bg-moss shadow-[0_14px_34px_rgba(63,90,58,0.35)]"
          }`}
        >
          {warning ? <AlertIcon className="h-12 w-12" /> : <CheckIcon className="h-12 w-12" />}
        </span>
        <p className="mt-4 text-lg font-bold text-muted">{code ? c.understoodCode : c.understoodLetter}</p>
        <h1 className={`mt-1 font-serif text-[2rem] font-medium leading-tight ${warning ? "text-warn" : "text-ink"}`}>{answer.headline}</h1>
        <p className="mt-2 text-[1.15rem] leading-snug text-ink">{answer.sentence}</p>
      </div>

      <section className="glass rounded-[24px] p-5">
        <h2 className="mb-3 text-base font-bold uppercase tracking-[0.08em] text-muted">{c.progress}</h2>
        <ol className="flex flex-col">
          {steps.map((step, i) => (
            <li key={step.label} className="relative flex gap-4 pb-4 last:pb-0">
              {i < steps.length - 1 && <span aria-hidden="true" className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-moss/30" />}
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  step.state === "done" ? "bg-moss text-white" : step.state === "now" ? "border-[3px] border-moss bg-white" : "border-2 border-line bg-white"
                }`}
              >
                {step.state === "done" ? <CheckIcon className="h-5 w-5" /> : <span className="h-3 w-3 rounded-full bg-moss" />}
              </span>
              <div className="min-w-0 pt-1.5">
                <p className="text-[1.1rem] font-bold leading-tight text-ink">{step.label}</p>
                <p className="text-base text-muted">{step.state === "done" ? c.done : step.state === "now" ? c.inProgress : c.next2}</p>
                {step.action}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <button
        type="button"
        onClick={onContinue}
        className="min-h-16 w-full rounded-full bg-moss px-6 text-[1.15rem] font-bold text-white shadow-[0_14px_34px_rgba(63,90,58,0.3)]"
      >
        {c.continue}
      </button>
    </div>
  );
}
