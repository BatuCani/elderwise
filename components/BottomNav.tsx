"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TEXT } from "@/app/copy";
import { useProfile } from "@/lib/profile";
import { ChatIcon, ListIcon, UserIcon } from "./icons";

// Exactly three tabs: Talk (home), Answers and Profile.
export function BottomNav() {
  const path = usePathname();
  const t = TEXT[useProfile().lang];
  const tabs = [
    { href: "/", label: t.tabTalk, Icon: ChatIcon },
    { href: "/answers", label: t.tabAnswers, Icon: ListIcon },
    { href: "/profile", label: t.tabProfile, Icon: UserIcon },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-xl">
        {tabs.map(({ href, label, Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-base font-bold ${
                active ? "text-moss" : "text-muted"
              }`}
            >
              <Icon className="h-7 w-7" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
