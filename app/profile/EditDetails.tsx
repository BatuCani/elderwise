"use client";

import { useState } from "react";
import { GlassSheet } from "@/components/GlassSheet";
import { updateProfile, useProfile } from "@/lib/profile";
import type { Lang } from "@/prompts/elderwise";

export type EditWhat = "me" | "trusted" | null;

const COPY: Record<Lang, Record<string, string>> = {
  en: {
    me: "Your name",
    trusted: "Your trusted person",
    name: "Name",
    relation: "Who is this? (e.g. daughter, son, neighbour)",
    phone: "Phone number",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
  },
  de: {
    me: "Ihr Name",
    trusted: "Ihre Vertrauensperson",
    name: "Name",
    relation: "Wer ist das? (z.B. Tochter, Sohn, Nachbarin)",
    phone: "Telefonnummer",
    save: "Speichern",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
  },
};

export const editLabel = (lang: Lang) => COPY[lang].edit;

const input =
  "mt-2 min-h-14 w-full rounded-2xl border-2 border-line bg-white px-4 text-[20px] text-ink outline-none focus:border-moss";
const label = "block text-[18px] font-bold text-ink";

// Sheet with big fields to change your own name, or the trusted person used by "Tell Anna".
export function EditDetails({ what, relationLabel, onClose }: { what: EditWhat; relationLabel: string; onClose: () => void }) {
  const profile = useProfile();
  const c = COPY[profile.lang];
  return (
    <GlassSheet open={what !== null} title={what === "me" ? c.me : c.trusted} closeLabel={c.cancel} onClose={onClose}>
      {what === "me" ? (
        <MeForm key="me" name={profile.name} c={c} onClose={onClose} />
      ) : (
        <TrustedForm key="trusted" trusted={profile.trusted} relationLabel={relationLabel} c={c} onClose={onClose} />
      )}
    </GlassSheet>
  );
}

function Buttons({ c, disabled, onClose }: { c: Record<string, string>; disabled: boolean; onClose: () => void }) {
  return (
    <div className="mt-6 flex flex-col gap-3">
      <button type="submit" disabled={disabled} className="min-h-14 w-full rounded-2xl bg-moss px-5 text-[20px] font-bold text-white disabled:opacity-40">
        {c.save}
      </button>
      <button type="button" onClick={onClose} className="min-h-14 w-full rounded-2xl px-5 text-[20px] font-bold text-muted">
        {c.cancel}
      </button>
    </div>
  );
}

function MeForm({ name, c, onClose }: { name: string; c: Record<string, string>; onClose: () => void }) {
  const [value, setValue] = useState(name);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        updateProfile({ name: value.trim() });
        onClose();
      }}
    >
      <label className={label}>
        {c.name}
        <input value={value} onChange={(e) => setValue(e.target.value)} autoComplete="given-name" className={input} />
      </label>
      <Buttons c={c} disabled={!value.trim()} onClose={onClose} />
    </form>
  );
}

type Trusted = { name: string; relation: string; phone: string };

function TrustedForm({ trusted, relationLabel, c, onClose }: { trusted: Trusted; relationLabel: string; c: Record<string, string>; onClose: () => void }) {
  const [name, setName] = useState(trusted.name);
  const [relation, setRelation] = useState(relationLabel);
  const [phone, setPhone] = useState(trusted.phone);
  const ok = name.trim() && /\d{3,}/.test(phone.replace(/\D/g, ""));
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        // Keep the built-in "daughter" key if unchanged, so it still shows translated.
        const rel = relation.trim() === relationLabel ? trusted.relation : relation.trim();
        updateProfile({ trusted: { name: name.trim(), relation: rel, phone: phone.trim() } });
        onClose();
      }}
    >
      <label className={label}>
        {c.name}
        <input value={name} onChange={(e) => setName(e.target.value)} className={input} />
      </label>
      <label className={label}>
        {c.relation}
        <input value={relation} onChange={(e) => setRelation(e.target.value)} className={input} />
      </label>
      <label className={label}>
        {c.phone}
        <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" className={input} />
      </label>
      <Buttons c={c} disabled={!ok} onClose={onClose} />
    </form>
  );
}
