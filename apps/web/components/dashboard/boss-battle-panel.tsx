import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import type { BossBattle } from "@/lib/types";

export function BossBattlePanel({ boss }: { boss: BossBattle }) {
  return (
    <Card className="bg-gradient-to-br from-cq-keaneyIce via-cq-white to-cq-keaneySoft/40">
      <SectionHeading
        eyebrow="Boss battle"
        title={boss.name}
        description={boss.theme}
      />
      <ProgressBar value={boss.prepProgress} max={boss.prepGoal} />
      <div className="mt-3 flex items-center justify-between text-sm text-ig-secondary">
        <span>
          Prep progress {boss.prepProgress}/{boss.prepGoal}
        </span>
        <strong className="text-cq-navy">Boss drops</strong>
      </div>
      <div className="mt-5 space-y-3">
        {boss.lootPreview.map((loot) => (
          <div
            key={loot.name}
            className="flex items-center justify-between rounded-2xl border border-cq-keaney/35 bg-cq-white px-4 py-3 shadow-sm"
          >
            <span className="font-medium text-cq-navy">{loot.name}</span>
            <RarityBadge rarity={loot.rarity} />
          </div>
        ))}
      </div>
    </Card>
  );
}
