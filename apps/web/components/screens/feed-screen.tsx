"use client";

import { useGameState } from "@/components/providers/game-state-provider";
import { FeedPanel } from "@/components/dashboard/feed-panel";
import { AppShell } from "@/components/ui/app-shell";
import { Card } from "@/components/ui/card";

export function FeedScreen() {
  const { state, reactToFeedPost } = useGameState();

  return (
    <AppShell
      title="The Quad — campus momentum"
      subtitle="Confirm wins from other Rhody players. Every confirmation boosts guild energy without turning into doomscrolling."
    >
      <Card>
        <p className="text-xs uppercase tracking-[0.24em] text-uri-navy/52">How confirmations work</p>
        <p className="mt-2 text-sm leading-7 text-uri-navy/72">
          <strong>Verify</strong> maps to the Quad&apos;s verify reaction—lightweight social proof for campus wins. Open the Quad tab for photos, ramarks, and full reactions.
        </p>
      </Card>
      <FeedPanel posts={state.feed} onReact={reactToFeedPost} />
    </AppShell>
  );
}
