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
          <div key={entry.id} className="flex items-center justify-between rounded-3xl border border-uri-navy/10 bg-white/70 px-4 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-uri-navy/50">Rank #{index + 1}</p>
              <h3 className="mt-1 text-lg font-semibold text-uri-ink">{entry.name}</h3>
            </div>
            <div className="text-right">
              <strong className="block text-lg text-uri-navy">{entry.xp} XP</strong>
              <span className="text-sm text-uri-navy/58">{entry.streak} day streak</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
