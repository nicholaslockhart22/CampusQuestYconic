"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/campus-auth";
import { AuthScreen } from "@/components/auth/auth-screen";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(false);

  useEffect(() => {
    setSession(!!getSession());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-dvh min-h-[100dvh] items-center justify-center bg-gradient-to-b from-cq-navy via-cq-navyMid to-cq-deep">
        <div
          className="h-11 w-11 animate-spin rounded-full border-2 border-cq-keaney/30 border-t-cq-keaneyBright"
          aria-hidden
        />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}
