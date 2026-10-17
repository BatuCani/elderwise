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

  // The welcome screens are full screen, without tabs.
  if (path === "/welcome") return null;

  return (
    <nav className="fixed inset-x-5 bottom-[calc(26px+env(safe-area-inset-bottom))] z-20 mx-auto max-w-[440px] rounded-[32px] glass-nav">
      <div className="flex px-2">
        {tabs.map(({ href, label, Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-tab font-bold ${
                active ? "text-moss" : "text-muted"
              }`}
            >
              <Icon className="h-6 w-6 shrink-0" />
              <span className="max-w-full truncate px-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
