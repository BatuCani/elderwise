"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// One shared browser client. Null when the Supabase keys are not set,
// so the app still works without accounts (everything stays on this device).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

// Known at build time, so server and browser render the same screens.
export const accountsEnabled = Boolean(url && key);

export function supabase(): SupabaseClient | null {
  if (!accountsEnabled || typeof window === "undefined") return null;
  client ??= createBrowserClient(url!, key!);
  return client;
}
