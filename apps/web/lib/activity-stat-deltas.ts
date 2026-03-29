import type { ActivityLog, StatKey, StatBlock } from "./types";

const KEYS: StatKey[] = ["strength", "stamina", "knowledge", "social", "focus"];

/** Sum of positive statDelta entries per stat across all logged activities. */
export function sumStatDeltasFromActivities(activities: ActivityLog[]): Record<StatKey, number> {
  const out: Record<StatKey, number> = {
    strength: 0,
    stamina: 0,
    knowledge: 0,
    social: 0,
    focus: 0
  };
  for (const a of activities) {
    const d = a.statDelta;
    if (!d) continue;
    for (const k of KEYS) {
      const add = d[k];
      if (typeof add === "number" && add > 0) out[k] += add;
    }
  }
  return out;
}

export function activityCountTouchingStat(activities: ActivityLog[], key: StatKey): number {
  return activities.filter((a) => (a.statDelta?.[key] ?? 0) !== 0).length;
}

const STAT_LABEL: Record<StatKey, string> = {
  strength: "Strength",
  stamina: "Stamina",
  knowledge: "Knowledge",
  social: "Social",
  focus: "Focus"
};

/** Human-readable "+4 Knowledge, +2 Focus" for notifications. */
export function formatStatDeltaLine(delta: Partial<StatBlock>): string {
  const parts: string[] = [];
  for (const k of KEYS) {
    const n = delta[k];
    if (typeof n === "number" && n !== 0) {
      parts.push(`${n > 0 ? "+" : ""}${n} ${STAT_LABEL[k]}`);
    }
  }
  return parts.join(", ");
}
