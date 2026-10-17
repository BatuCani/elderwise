"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasSeenWelcome } from "@/lib/welcome";

// Sends a first-time visitor of the Talk tab to the welcome screens.
export function FirstRun() {
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (path === "/" && !hasSeenWelcome()) router.replace("/welcome");
  }, [path, router]);
  return null;
}
