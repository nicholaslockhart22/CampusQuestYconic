import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import type { BossBattle } from "@/lib/types";

export function BossBattlePanel({ boss }: { boss: BossBattle }) {
  return (
    <Card className="bg-gradient-to-br from-[#fff7ea] to-white">
      <SectionHeading
        eyebrow="Boss battle"
        title={boss.name}
        description={boss.theme}
      />
      <ProgressBar value={boss.prepProgress} max={boss.prepGoal} />
      <div className="mt-3 flex items-center justify-between text-sm text-uri-navy/66">
        <span>
          Prep progress {boss.prepProgress}/{boss.prepGoal}
        </span>
        <strong className="text-uri-navy">Boss drops</strong>
      </div>
      <div className="mt-5 space-y-3">
        {boss.lootPreview.map((loot) => (
          <div key={loot.name} className="flex items-center justify-between rounded-2xl border border-uri-navy/10 bg-white/80 px-4 py-3">
            <span className="font-medium text-uri-ink">{loot.name}</span>
            <RarityBadge rarity={loot.rarity} />
          </div>
        ))}
      </div>
    </Card>
  );
}
