"use client";

import { useGameState } from "@/components/providers/game-state-provider";
import { FeedPanel } from "@/components/dashboard/feed-panel";
import { AppShell } from "@/components/ui/app-shell";
import { Card } from "@/components/ui/card";

export function FeedScreen() {
  const { state, confirmFeedPost } = useGameState();

  return (
    <AppShell
      title="The Quad — campus momentum"
      subtitle="Confirm wins from other Rhody players. Every confirmation boosts guild energy without turning into doomscrolling."
    >
      <Card>
        <p className="text-xs uppercase tracking-[0.24em] text-uri-navy/52">How confirmations work</p>
        <p className="mt-2 text-sm leading-7 text-uri-navy/72">
          Tapping <strong>Confirm</strong> nudges that post&apos;s visibility and mirrors the supportive energy you want on campus. It is lightweight social proof, not a popularity score.
        </p>
      </Card>
      <FeedPanel posts={state.feed} onConfirm={confirmFeedPost} />
    </AppShell>
  );
}
