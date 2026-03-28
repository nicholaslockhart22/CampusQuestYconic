import type { CharacterProfile, LeaderboardEntry } from "@/lib/types";

export function applyXpGain(profile: CharacterProfile, gain: number): CharacterProfile {
  let { level, xp, xpToNext } = profile;
  xp += gain;
  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    xpToNext = Math.round(xpToNext * 1.04 + 120);
  }
  return { ...profile, level, xp, xpToNext };
}

/** Composite score for sorting; blends level breakpoint progress with current XP bar */
export function leaderboardPower(profile: CharacterProfile): number {
  return profile.level * 420 + profile.xp;
}

export function syncLeaderboard(entries: LeaderboardEntry[], profile: CharacterProfile): LeaderboardEntry[] {
  const power = leaderboardPower(profile);
  const updated = entries.map((entry) =>
    entry.name === profile.name ? { ...entry, xp: power, streak: profile.streakDays } : entry
  );
  return [...updated].sort((left, right) => right.xp - left.xp);
}

export function rankForPlayer(entries: LeaderboardEntry[], playerName: string): number {
  const index = entries.findIndex((entry) => entry.name === playerName);
  return index === -1 ? 0 : index + 1;
}
