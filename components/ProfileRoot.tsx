"use client";

import { useEffect } from "react";
import { FONT_PX, useProfile } from "@/lib/profile";

// Applies profile settings that affect the whole page (text size, document language).
export function ProfileRoot() {
  const { fontSize, lang } = useProfile();
  useEffect(() => {
    document.documentElement.style.fontSize = `${FONT_PX[fontSize]}px`;
    document.documentElement.lang = lang;
  }, [fontSize, lang]);
  return null;
}
