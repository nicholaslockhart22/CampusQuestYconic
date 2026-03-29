"use client";

import Image from "next/image";
import { useState } from "react";
import { login, signUp } from "@/lib/campus-auth";
import { createFreshGameState } from "@/lib/fresh-game-state";
import { loadState, saveState } from "@/lib/storage";

type Mode = "signin" | "signup";

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const r = await signUp({ email, displayName, password });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      const fresh = createFreshGameState(email.trim().toLowerCase(), displayName.trim());
      saveState(fresh);
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const r = await login({ email, password });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      const em = email.trim().toLowerCase();
      if (!loadState()) {
        saveState(createFreshGameState(em, r.displayName));
      }
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-gradient-to-br from-[#050d1c] via-cq-navy to-[#0a1830] px-4 py-10 text-cq-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(159,212,244,0.5), transparent 50%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(203,161,53,0.25), transparent 45%)"
        }}
      />
      <div className="relative z-[1] mx-auto flex w-full max-w-[420px] flex-col items-center">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-cq-keaneyBright/90">
            University of Rhode Island
          </p>
          <div className="mx-auto mt-4 w-[200px] sm:w-[240px]">
            <Image
              src="/branding/campusquest-logo.png"
              alt="CampusQuest"
              width={1024}
              height={1024}
              className="h-auto w-full mix-blend-lighten drop-shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
              priority
              sizes="240px"
            />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]">
            CampusQuest
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-cq-keaneySoft/90">
            Your campus life, leveled up. Sign in with your student email to begin.
          </p>
        </div>

        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.06] p-1 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex rounded-xl bg-cq-navy/40 p-1">
            <button
              type="button"
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                mode === "signup"
                  ? "bg-gradient-to-r from-[#FFC20E] to-[#e6a800] text-cq-navy shadow-md"
                  : "text-cq-keaneySoft/80 hover:text-white"
              }`}
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
            >
              Create account
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                mode === "signin"
                  ? "bg-gradient-to-r from-[#FFC20E] to-[#e6a800] text-cq-navy shadow-md"
                  : "text-cq-keaneySoft/80 hover:text-white"
              }`}
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
            >
              Sign in
            </button>
          </div>

          <div className="px-5 pb-6 pt-5">
            {mode === "signup" ? (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label htmlFor="cq-email-su" className="mb-1.5 block text-xs font-semibold text-cq-keaneySoft">
                    School email
                  </label>
                  <input
                    id="cq-email-su"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourschool.edu"
                    className="w-full rounded-xl border border-white/15 bg-cq-deep/60 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-cq-keaney/60 focus:outline-none focus:ring-2 focus:ring-cq-keaney/30"
                  />
                  <p className="mt-1.5 text-[11px] text-cq-keaney/90">
                    Must end in <span className="font-semibold text-cq-keaneyBright">.edu</span> — we verify you&apos;re a
                    student.
                  </p>
                </div>
                <div>
                  <label htmlFor="cq-name" className="mb-1.5 block text-xs font-semibold text-cq-keaneySoft">
                    Display name
                  </label>
                  <input
                    id="cq-name"
                    type="text"
                    autoComplete="nickname"
                    required
                    minLength={2}
                    maxLength={40}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How you appear on the Quad"
                    className="w-full rounded-xl border border-white/15 bg-cq-deep/60 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-cq-keaney/60 focus:outline-none focus:ring-2 focus:ring-cq-keaney/30"
                  />
                </div>
                <div>
                  <label htmlFor="cq-pw-su" className="mb-1.5 block text-xs font-semibold text-cq-keaneySoft">
                    Password
                  </label>
                  <input
                    id="cq-pw-su"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-cq-deep/60 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-cq-keaney/60 focus:outline-none focus:ring-2 focus:ring-cq-keaney/30"
                  />
                  <p className="mt-1 text-[11px] text-white/45">At least 8 characters.</p>
                </div>
                <div>
                  <label htmlFor="cq-pw2" className="mb-1.5 block text-xs font-semibold text-cq-keaneySoft">
                    Confirm password
                  </label>
                  <input
                    id="cq-pw2"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-cq-deep/60 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-cq-keaney/60 focus:outline-none focus:ring-2 focus:ring-cq-keaney/30"
                  />
                </div>
                {error ? (
                  <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200 ring-1 ring-red-400/30" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-gradient-to-r from-[#FFC20E] via-[#e6a800] to-[#cba135] py-3.5 text-sm font-bold text-cq-navy shadow-lg shadow-amber-900/20 transition hover:brightness-105 disabled:opacity-60"
                >
                  {busy ? "Creating…" : "Start at level 1"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label htmlFor="cq-email-in" className="mb-1.5 block text-xs font-semibold text-cq-keaneySoft">
                    School email
                  </label>
                  <input
                    id="cq-email-in"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourschool.edu"
                    className="w-full rounded-xl border border-white/15 bg-cq-deep/60 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-cq-keaney/60 focus:outline-none focus:ring-2 focus:ring-cq-keaney/30"
                  />
                </div>
                <div>
                  <label htmlFor="cq-pw-in" className="mb-1.5 block text-xs font-semibold text-cq-keaneySoft">
                    Password
                  </label>
                  <input
                    id="cq-pw-in"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-cq-deep/60 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-cq-keaney/60 focus:outline-none focus:ring-2 focus:ring-cq-keaney/30"
                  />
                </div>
                {error ? (
                  <p className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200 ring-1 ring-red-400/30" role="alert">
                    {error}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-gradient-to-r from-[#FFC20E] via-[#e6a800] to-[#cba135] py-3.5 text-sm font-bold text-cq-navy shadow-lg shadow-amber-900/20 transition hover:brightness-105 disabled:opacity-60"
                >
                  {busy ? "Signing in…" : "Sign in"}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="mt-8 max-w-sm text-center text-[11px] leading-relaxed text-white/40">
          Passwords are hashed on this device only. For production, connect a secure backend. CampusQuest is a demo
          experience for URI students.
        </p>
      </div>
    </div>
  );
}
