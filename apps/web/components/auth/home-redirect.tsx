"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/campus-auth";

/** Shown only when `AuthGate` has a session — sends the user into the app shell. */
export function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (getSession()) {
      router.replace("/quad");
    }
  }, [router]);

  return (
    <div className="flex min-h-dvh min-h-[100dvh] items-center justify-center bg-cq-navy">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-cq-keaney/30 border-t-cq-keaneyBright"
        aria-hidden
      />
      <span className="sr-only">Entering CampusQuest…</span>
    </div>
  );
}
