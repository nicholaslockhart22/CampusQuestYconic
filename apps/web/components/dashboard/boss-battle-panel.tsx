import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import type { BossBattle, BossWeakness } from "@/lib/types";

const WEAKNESS_LABEL: Record<BossWeakness, string> = {
  random: "Random — lucky crits on logs",
  strength: "Strength",
  stamina: "Stamina",
  knowledge: "Knowledge",
  social: "Social",
  focus: "Focus"
};

export function BossBattlePanel({ boss }: { boss: BossBattle }) {
  const dealt = boss.maxHp - boss.hpRemaining;
  const isFinalTier = boss.maxHp >= 500;

  return (
    <Card className="bg-gradient-to-br from-cq-keaneyIce via-cq-white to-cq-keaneySoft/40">
      <SectionHeading
        eyebrow="Boss battle"
        title={boss.name}
        description={
          <>
            {boss.theme}
            <span className="mt-1 block text-xs text-ig-secondary">
              Weakness — bonus damage when logs match:{" "}
              <strong className="text-cq-navy">{WEAKNESS_LABEL[boss.weakness]}</strong>
            </span>
          </>
        }
      />
      {isFinalTier ? (
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-uri-gold">
          Final tier (500+ HP) · better loot odds
        </p>
      ) : null}
      <ProgressBar value={dealt} max={boss.maxHp} tone="blue" />
      <div className="mt-3 flex items-center justify-between text-sm text-ig-secondary">
        <span className="tabular-nums">
          <strong className="text-cq-navy">{boss.hpRemaining}</strong> / {boss.maxHp} HP
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
