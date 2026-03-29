import type { ActivityType } from "./types";

const EMOJI: Record<ActivityType, string> = {
  study: "✍️",
  workout: "💪",
  club: "🎭",
  networking: "🤝",
  event: "🎉",
  focus: "🎯"
};

export function activityTypeEmoji(type: ActivityType): string {
  return EMOJI[type] ?? "⭐";
}
