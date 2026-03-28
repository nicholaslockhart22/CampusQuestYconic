import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatTile } from "@/components/ui/stat-tile";
import type { CharacterProfile } from "@/lib/types";

export function ProfileStats({ profile }: { profile: CharacterProfile }) {
  return (
    <Card>
      <SectionHeading
        eyebrow="Character sheet"
        title="Core stats"
        description="Strength, Stamina, Knowledge, Social, and Focus represent the real-life traits students build every week."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile label="Strength" value={profile.stats.strength} />
        <StatTile label="Stamina" value={profile.stats.stamina} />
        <StatTile label="Knowledge" value={profile.stats.knowledge} />
        <StatTile label="Social" value={profile.stats.social} />
        <StatTile label="Focus" value={profile.stats.focus} />
      </div>
    </Card>
  );
}
