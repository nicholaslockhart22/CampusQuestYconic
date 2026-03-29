"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/campus-auth";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!getSession()) {
      router.replace("/");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-dvh min-h-[100dvh] items-center justify-center bg-cq-white">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-cq-keaney/30 border-t-cq-keaneyBright"
          aria-hidden
        />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  return <>{children}</>;
}
