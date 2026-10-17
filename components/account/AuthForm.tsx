"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { AuthError } from "@supabase/supabase-js";
import { useProfile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";
import { ACCOUNT, type ErrorKey } from "./copy";
import { safeNext } from "./safeNext";

type Mode = "signin" | "signup";

// Turns Supabase's technical errors into one of our plain-language messages.
function errorKey(error: AuthError): ErrorKey {
  switch (error.code) {
    case "invalid_credentials":
      return "wrongLogin";
    case "user_already_exists":
    case "email_exists":
      return "exists";
    case "weak_password":
      return "shortPassword";
    case "email_address_invalid":
    case "validation_failed":
      return "badEmail";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "tooMany";
  }
  if (error.name === "AuthRetryableFetchError" || error.status === 0) return "offline";
  return "other";
}

// Sign in or create an account with email and password. Big fields, plain errors,
// and a way out at every point so the app never blocks on an account.
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const a = ACCOUNT[useProfile().lang];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const sb = supabase();
  const signUp = mode === "signup";
  const other = `${signUp ? "/signin" : "/signup"}?next=${encodeURIComponent(next)}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!sb) return;
    if (!email.trim() || !password) return setError("missing");
    if (signUp && password.length < 6) return setError("shortPassword");
    setBusy(true);
    setError(null);
    setCheckEmail(false);
    const credentials = { email: email.trim(), password };
    const { data, error } = signUp ? await sb.auth.signUp(credentials) : await sb.auth.signInWithPassword(credentials);
    setBusy(false);
    if (error) return setError(errorKey(error));
    if (!data.session) return setCheckEmail(true);
    router.replace(next);
  }

  const field =
    "min-h-16 w-full rounded-3xl border border-line bg-white/80 px-5 text-[20px] text-ink outline-none placeholder:text-muted/70 focus:ring-4 focus:ring-moss/30";

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-5 pb-40 pt-[calc(32px+env(safe-area-inset-top))]">
      <form onSubmit={submit} noValidate className="glass flex flex-col gap-5 rounded-[32px] p-6">
        <div>
          <h1 className="font-serif text-[34px] font-medium leading-[1.1] text-ink">{signUp ? a.signUpTitle : a.signInTitle}</h1>
          <p className="mt-2 text-[20px] leading-snug text-ink">{signUp ? a.signUpBody : a.signInBody}</p>
        </div>

        {!sb ? (
          <p className="text-[20px] leading-snug text-ink">{a.notAvailable}</p>
        ) : (
          <>
            <label className="flex flex-col gap-2">
              <span className="text-lg font-bold text-ink">{a.email}</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
              />
            </label>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-lg font-bold text-ink">
                {a.password}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete={signUp ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby={signUp ? "password-hint" : undefined}
                  className={`${field} pr-28`}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-pressed={show}
                  className="absolute inset-y-2 right-2 min-w-20 rounded-full bg-paper px-4 text-lg font-bold text-moss"
                >
                  {show ? a.hide : a.show}
                </button>
              </div>
              {signUp && (
                <p id="password-hint" className="text-lg text-muted">
                  {a.passwordHint}
                </p>
              )}
            </div>

            {checkEmail && (
              <p role="status" className="rounded-3xl bg-moss/10 px-5 py-4 text-[20px] leading-snug font-bold text-ink">
                {a.checkEmail}
              </p>
            )}

            {error && (
              <p role="alert" className="rounded-3xl bg-warn/10 px-5 py-4 text-[20px] leading-snug font-bold text-warn">
                {a.errors[error]}
              </p>
            )}

            <button type="submit" disabled={busy} className="min-h-16 w-full rounded-full bg-moss text-xl font-bold text-white shadow-lg disabled:opacity-70">
              {busy ? a.working : signUp ? a.signUp : a.signIn}
            </button>

            <p className="text-center text-lg text-muted">
              {signUp ? a.haveAccount : a.noAccount}{" "}
              <Link href={other} replace className="font-bold text-moss underline underline-offset-4">
                {signUp ? a.switchToSignIn : a.switchToSignUp}
              </Link>
            </p>
          </>
        )}
      </form>

      <Link href={next} replace className="glass flex min-h-16 items-center justify-center rounded-full px-6 text-center text-xl font-bold text-ink">
        {a.skip}
      </Link>
    </main>
  );
}
