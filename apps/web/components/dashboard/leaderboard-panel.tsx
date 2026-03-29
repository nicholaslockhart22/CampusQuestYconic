import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { LeaderboardEntry } from "@/lib/types";

export function LeaderboardPanel({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <Card>
      <SectionHeading
        eyebrow="Leaderboards"
        title="Campus standings"
        description="Friendly competition by XP and streaks keeps progress social without turning toxic."
      />
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-2xl border border-cq-keaney/30 bg-cq-keaneyIce/50 px-4 py-4"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cq-keaney">Rank #{index + 1}</p>
              <h3 className="mt-1 text-lg font-semibold text-cq-navy">{entry.name}</h3>
            </div>
            <div className="text-right">
              <strong className="block text-lg text-cq-navy">{entry.xp} XP</strong>
              <span className="text-sm text-ig-secondary">{entry.streak} day streak</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
