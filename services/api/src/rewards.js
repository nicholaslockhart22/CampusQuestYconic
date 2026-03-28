import { activityTypes, defaultStats } from "../../../packages/contracts/src/index.js";

export function computeLevel(totalXp) {
  return Math.max(1, Math.floor(totalXp / 250) + 1);
}

export function getActivityReward(activityType) {
  const reward = activityTypes[activityType];
  if (!reward) {
    throw new Error(`Unsupported activity type: ${activityType}`);
  }
  return reward;
}

export function mergeStats(currentStats = defaultStats, deltaStats = {}) {
  const merged = { ...defaultStats, ...currentStats };
  for (const [key, value] of Object.entries(deltaStats)) {
    merged[key] = (merged[key] ?? 0) + value;
  }
  return merged;
}

export function applyActivityReward(user, activityType) {
  const reward = getActivityReward(activityType);
  const nextXp = user.totalXp + reward.xp;
  return {
    xpDelta: reward.xp,
    statDelta: reward.stats,
    totalXp: nextXp,
    level: computeLevel(nextXp),
    stats: mergeStats(user.stats, reward.stats)
  };
}

export function applyDirectReward(user, reward) {
  const nextXp = user.totalXp + Number(reward.xp || 0);
  return {
    xpDelta: Number(reward.xp || 0),
    statDelta: reward.stats || {},
    totalXp: nextXp,
    level: computeLevel(nextXp),
    stats: mergeStats(user.stats, reward.stats || {})
  };
}
