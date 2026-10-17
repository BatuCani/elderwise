"use client";

import Link from "next/link";
import { UsersIcon } from "@/components/icons";
import { useProfile } from "@/lib/profile";

// "See what Anna sees": opens the Family view from the trusted-person card on Profile.
export function FamilyLink() {
  const profile = useProfile();
  const label = profile.lang === "de" ? `Das sieht ${profile.trusted.name}` : `See what ${profile.trusted.name} sees`;
  return (
    <Link
      href="/family"
      className="glass flex min-h-14 items-center justify-center gap-2 rounded-full px-5 text-lg font-bold text-ink"
    >
      <UsersIcon className="h-6 w-6 shrink-0" />
      {label}
    </Link>
  );
}
