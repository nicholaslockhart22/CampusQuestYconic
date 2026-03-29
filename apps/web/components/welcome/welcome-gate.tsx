"use client";

import { useCallback, useEffect, useState } from "react";
import { getSession } from "@/lib/campus-auth";
import { WelcomeScreen } from "./welcome-screen";

/** Persisted after welcome completes (used to skip intro once you’re in the app). */
const STORAGE_KEY = "campusquest-welcome-seen-v1";
/** Tab session only: after welcome, go to sign-in without replaying on refresh in the same tab. */
const SESSION_WELCOME_KEY = "campusquest-welcome-before-auth";

type Phase = "init" | "welcome" | "after";

/**
 * Loading / welcome runs before auth. Signed-out users ignore old `welcome-seen` so the intro always
 * shows once per browser tab session; refresh after that skips to sign-in.
 */
export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>("init");

  useEffect(() => {
    const session = getSession();
    if (session) {
      try {
        if (localStorage.getItem(STORAGE_KEY) === "1") {
          setPhase("after");
          return;
        }
      } catch {
        /* private mode */
      }
      setPhase("welcome");
      return;
    }
    try {
      if (sessionStorage.getItem(SESSION_WELCOME_KEY) === "1") {
        setPhase("after");
        return;
      }
    } catch {
      /* sessionStorage blocked */
    }
    setPhase("welcome");
  }, []);

  const handleWelcomeComplete = useCallback(() => {
    try {
      sessionStorage.setItem(SESSION_WELCOME_KEY, "1");
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setPhase("after");
  }, []);

  if (phase === "init") {
    return (
      <div className="flex min-h-dvh min-h-[100dvh] items-center justify-center bg-cq-navy">
        <div
          className="h-11 w-11 animate-spin rounded-full border-2 border-cq-keaney/30 border-t-cq-keaneyBright"
          aria-hidden
        />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (phase === "welcome") {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return <>{children}</>;
}
