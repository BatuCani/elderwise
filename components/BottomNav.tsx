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
    // Fixed px sizes (not rem): the navbar stays the same size at every text size, so it never covers the page.
    <nav className="fixed inset-x-5 bottom-[calc(26px+env(safe-area-inset-bottom))] z-20 mx-auto max-w-xl rounded-[34px] glass-nav">
      <div className="flex px-[8px]">
        {tabs.map(({ href, label, Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[64px] min-w-0 flex-1 flex-col items-center justify-center gap-[2px] text-[18px] font-bold ${
                active ? "text-moss" : "text-muted"
              }`}
            >
              <Icon className="h-[28px] w-[28px] shrink-0" />
              <span className="max-w-full truncate px-[4px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
