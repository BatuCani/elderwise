"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, type MouseEvent } from "react";
import { TEXT } from "@/app/copy";
import { inViewTransition, navigate, routeCommitted } from "@/lib/navigate";
import { useProfile } from "@/lib/profile";
import { ChatIcon, ListIcon, UserIcon } from "./icons";

// Exactly three tabs: Talk (home), Answers and Profile. A soft glass pill glides under the active one.
export function BottomNav() {
  const path = usePathname();
  const router = useRouter();
  const t = TEXT[useProfile().lang];
  const first = useRef(true);
  const tabs = [
    { href: "/", label: t.tabTalk, Icon: ChatIcon },
    { href: "/answers", label: t.tabAnswers, Icon: ListIcon },
    { href: "/profile", label: t.tabProfile, Icon: UserIcon },
  ];
  const activeIndex = tabs.findIndex((tab) => tab.href === path);

  // iOS Safari only shows :active press states when the page listens for touches.
  useEffect(() => {
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => document.removeEventListener("touchstart", noop);
  }, []);

  // The new screen is on the page: let the view transition capture it, or fade it in where there is none.
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (inViewTransition()) routeCommitted();
    else if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelector("[data-page]")?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: "ease-out" });
    }
  }, [path]);

  // The welcome screens are full screen, without tabs.
  if (path === "/welcome") return null;

  function onTab(e: MouseEvent<HTMLAnchorElement>, href: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate((to) => router.push(to), path, href);
  }

  return (
    <nav className="tab-bar fixed inset-x-5 bottom-[calc(26px+env(safe-area-inset-bottom))] z-20 mx-auto max-w-[440px] rounded-[32px] glass-nav">
      <div className="relative flex px-2">
        {activeIndex >= 0 && (
          <span
            aria-hidden
            className="tab-pill absolute inset-y-1.5 left-2 w-[calc((100%-16px)/3)] rounded-[26px]"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />
        )}
        {tabs.map(({ href, label, Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => onTab(e, href)}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-tab font-bold transition-[color,transform] duration-200 ${
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
