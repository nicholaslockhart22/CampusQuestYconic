"use client";

import { ActivityLogBannerStrip } from "@/components/mobile/activity-log-banner-strip";
import { BottomTabBar } from "@/components/mobile/bottom-tab-bar";
import { TopToolbar } from "@/components/mobile/top-toolbar";
import { BossVictoryOverlay } from "@/components/overlays/boss-victory-overlay";

export function MobileAppChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-cq-navy via-cq-navyMid to-cq-deep text-cq-navy">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.14]"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(107,184,232,0.9), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(107,184,232,0.35), transparent 50%)"
        }}
      />
      <TopToolbar />
      <main className="relative mx-auto max-w-lg overflow-x-hidden rounded-t-[1.75rem] border-x border-t border-cq-keaney/35 bg-cq-white shadow-cq-glow px-0 pb-[calc(4.5rem+env(safe-area-inset-bottom,0))] pt-[calc(3.5rem+env(safe-area-inset-top,0))]">
        <ActivityLogBannerStrip />
        {children}
      </main>
      <BottomTabBar />
      <BossVictoryOverlay />
    </div>
  );
}
