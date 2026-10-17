"use client";

import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Answer } from "@/prompts/elderwise";
import { currentEntries, mergeEntries, type Entry } from "./answers";
import { applyRemoteProfile, currentProfile, type Profile } from "./profile";
import { supabase } from "./supabase";

// Account sync: when someone is signed in, answers and profile settings are also saved
// to their Supabase account and loaded back on sign-in. localStorage stays the offline cache,
// so the app works the same without an account or without a connection.

type ProfileRow = { id: string; name: string; font_size: string; speech_rate: number; lang: string; trusted: Profile["trusted"] };
type AnswerRow = { id: string; at: number; question: string; answer: Answer };

// undefined = still checking, null = signed out, string = the signed-in email.
let email: string | null | undefined = undefined;
let userId: string | null = null;
const listeners = new Set<() => void>();

function setSession(session: Session | null) {
  userId = session?.user.id ?? null;
  email = session ? (session.user.email ?? "") : null;
  listeners.forEach((l) => l());
}

let started = false;
function start() {
  const sb = supabase();
  if (started) return;
  started = true;
  if (!sb) {
    setSession(null);
    return;
  }
  sb.auth.onAuthStateChange((event, session) => {
    setSession(session);
    // Load the account's data on page load and right after signing in.
    // Deferred: Supabase must not be called from inside this callback.
    if (session && (event === "INITIAL_SESSION" || event === "SIGNED_IN")) setTimeout(() => void pull(session.user.id), 0);
  });
}
// Deferred so the circular imports with answers.ts and profile.ts finish first.
if (typeof window !== "undefined") queueMicrotask(start);

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAccount(): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => email,
    () => undefined,
  );
}

const toRow = (e: Entry) => ({ id: e.id, at: e.at, question: e.question, answer: e.answer });

// Merges the account's answers and profile with this device's.
// Answers: union of both. Profile: the account's copy wins; a new account gets this device's.
let pulling: Promise<void> | null = null;
function pull(uid: string) {
  pulling ??= (async () => {
    const sb = supabase();
    if (!sb) return;
    const [prof, rows] = await Promise.all([
      sb.from("profiles").select("id,name,font_size,speech_rate,lang,trusted").eq("id", uid).maybeSingle<ProfileRow>(),
      sb.from("answers").select("id,at,question,answer").order("at", { ascending: false }).limit(30).returns<AnswerRow[]>(),
    ]);
    if (prof.error || rows.error) return;

    if (prof.data) {
      const p = prof.data;
      applyRemoteProfile({
        name: p.name || currentProfile().name,
        fontSize: p.font_size as Profile["fontSize"],
        speechRate: p.speech_rate,
        lang: p.lang as Profile["lang"],
        trusted: { ...currentProfile().trusted, ...p.trusted },
      });
    } else {
      await saveProfile(currentProfile());
    }

    const remote: Entry[] = rows.data;
    const known = new Set(remote.map((r) => r.id));
    const localOnly = currentEntries().filter((e) => !known.has(e.id));
    if (localOnly.length) await sb.from("answers").upsert(localOnly.map(toRow));
    mergeEntries(remote);
  })().finally(() => {
    pulling = null;
  });
  return pulling;
}

export function pushAnswer(entry: Entry) {
  const sb = supabase();
  if (!sb || !userId) return;
  // Query builders only send when awaited or then-ed; a missed save is uploaded on the next app start (see pull).
  void sb.from("answers").upsert(toRow(entry)).then();
}

async function saveProfile(p: Profile) {
  const sb = supabase();
  if (!sb || !userId) return;
  await sb.from("profiles").upsert({
    id: userId,
    name: p.name,
    font_size: p.fontSize,
    speech_rate: p.speechRate,
    lang: p.lang,
    trusted: p.trusted,
    updated_at: new Date().toISOString(),
  });
}

// Debounced: the speech-rate slider fires many changes per second.
let profileTimer: ReturnType<typeof setTimeout> | undefined;
export function pushProfile(p: Profile) {
  if (!userId) return;
  clearTimeout(profileTimer);
  profileTimer = setTimeout(() => void saveProfile(p), 600);
}

// Deletes the account's saved answers (used by "Clear history"). Resolves at once when signed out.
export async function deleteRemoteAnswers() {
  const sb = supabase();
  if (!sb || !userId) return;
  await sb.from("answers").delete().eq("user_id", userId);
}

// Signs out and removes this account's data from the device; it stays safe in the account.
export async function signOut() {
  await supabase()?.auth.signOut();
  try {
    localStorage.removeItem("elderwise.answers");
    localStorage.removeItem("elderwise.profile");
  } catch {
    // Storage blocked: nothing was cached.
  }
  window.location.replace("/profile");
}
