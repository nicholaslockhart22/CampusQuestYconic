import type { ActivityLog, StatKey } from "./types";

/** Primary stat bucket for an activity (matches boss weakness mapping). */
export function activityPrimaryStat(activity: ActivityLog): StatKey {
  switch (activity.type) {
    case "workout":
      return activity.durationMinutes >= 25 ? "stamina" : "strength";
    case "study":
      return "knowledge";
    case "focus":
      return "focus";
    case "club":
    case "event":
    case "networking":
      return "social";
    default:
      return "focus";
  }
}
