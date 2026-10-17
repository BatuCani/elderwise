"use client";

import type { Profile } from "@/lib/profile";
import { LOCALE, toJpeg } from "@/lib/speech";
import type { Answer } from "@/prompts/elderwise";

// One question (and optional photo) to Claude through /api/ask. Throws if it fails.
export async function askClaude(question: string, photo: string | null, profile: Profile): Promise<Answer> {
  const body = new FormData();
  body.append("lang", profile.lang);
  body.append("question", question);
  body.append("name", profile.name);
  body.append("trustedName", profile.trusted.name);
  body.append("trustedRelation", profile.trusted.relation);
  body.append(
    "today",
    new Date().toLocaleDateString(LOCALE[profile.lang], { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  );
  if (photo) body.append("image", await toJpeg(photo), "photo.jpg");
  const res = await fetch("/api/ask", { method: "POST", body });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}
