"use client";

import { BotAvatar } from "bot-avatars";
import { useAssistant } from "@/lib/assistant";
import { PERSONALITY_AVATARS } from "./AssistantSettings";

// "You learned": the assistant's own little bot gives the tip, like a note from a friend.
export function LearnedCard({ title, learned, tip }: { title: string; learned: string; tip: string }) {
  const assistant = useAssistant();
  return (
    <div className="glass-moss row-in flex items-start gap-4 rounded-3xl p-5 text-learn" style={{ animationDelay: "220ms" }}>
      <BotAvatar {...PERSONALITY_AVATARS[assistant.personality]} shading="fabric" size={52} interactive={false} aria-hidden className="mt-1 shrink-0" />
      <div className="min-w-0">
        <p className="text-lg font-bold">{title}</p>
        <p className="mt-1 text-lg leading-snug">{learned}</p>
        <p className="mt-2 text-lg leading-snug">{tip}</p>
      </div>
    </div>
  );
}
