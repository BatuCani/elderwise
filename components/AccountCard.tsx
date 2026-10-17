"use client";

import Link from "next/link";
import { useState } from "react";
import { useProfile } from "@/lib/profile";
import { accountsEnabled } from "@/lib/supabase";
import { signOut, useAccount } from "@/lib/sync";
import { ACCOUNT } from "./account/copy";
import { UserIcon } from "./icons";
import { CARD, Section } from "./profile/ui";

// Profile tab card: who is signed in plus Sign out, or a way to create an account.
export function AccountCard() {
  const a = ACCOUNT[useProfile().lang];
  const email = useAccount();
  const [busy, setBusy] = useState(false);

  // Still checking, or accounts are not set up: show nothing rather than a flicker.
  if (email === undefined || !accountsEnabled) return null;

  return (
    <Section title={a.cardTitle}>
      <div className={`${CARD} flex flex-col gap-4 p-5`}>
        {email !== null ? (
          <>
            <div className="flex items-center gap-4">
              <UserIcon className="h-7 w-7 shrink-0 text-moss" />
              <div className="min-w-0">
                <p className="text-lg text-muted">{a.signedInAs}</p>
                <p className="break-words text-xl font-bold text-ink">{email}</p>
              </div>
            </div>
            <p className="text-lg leading-snug text-ink">{a.savedNote}</p>
            <button
              onClick={() => {
                setBusy(true);
                void signOut();
              }}
              disabled={busy}
              className="min-h-14 rounded-full border border-[#e6e1d6] bg-paper px-6 text-lg font-bold text-ink disabled:opacity-70"
            >
              {busy ? a.working : a.signOut}
            </button>
          </>
        ) : (
          <>
            <p className="text-lg leading-snug text-ink">{a.guestNote}</p>
            <Link href="/signup?next=/profile" className="flex min-h-14 items-center justify-center rounded-full bg-moss px-6 text-lg font-bold text-white">
              {a.signUp}
            </Link>
            <Link href="/signin?next=/profile" className="flex min-h-14 items-center justify-center rounded-full border border-[#e6e1d6] bg-paper px-6 text-lg font-bold text-ink">
              {a.signIn}
            </Link>
          </>
        )}
      </div>
    </Section>
  );
}
