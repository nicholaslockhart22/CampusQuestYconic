"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ActivityLog, ActivityType, StatBlock } from "@/lib/types";

const activityTemplates: Record<
  ActivityType,
  { title: string; xpReward: number; statDelta: Partial<StatBlock> }
> = {
  study: { title: "Study session", xpReward: 120, statDelta: { knowledge: 5, focus: 4 } },
  workout: { title: "Workout", xpReward: 90, statDelta: { strength: 5, stamina: 4 } },
  club: { title: "Club meeting", xpReward: 75, statDelta: { social: 4, stamina: 2 } },
  networking: { title: "Networking", xpReward: 100, statDelta: { social: 5, knowledge: 2 } },
  event: { title: "Campus event", xpReward: 85, statDelta: { social: 4, stamina: 2 } },
  focus: { title: "Focus sprint", xpReward: 110, statDelta: { focus: 6, knowledge: 2 } }
};

export function ActivityLogPanel({
  onLogActivity
}: {
  onLogActivity: (activity: ActivityLog) => void;
}) {
  const [activityType, setActivityType] = useState<ActivityType>("study");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState("");
  const [rewardMessage, setRewardMessage] = useState("Log a win and watch the reward hit instantly.");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const template = activityTemplates[activityType];
    const activity: ActivityLog = {
      id: `activity-${Date.now()}`,
      type: activityType,
      title: template.title,
      durationMinutes,
      notes,
      xpReward: template.xpReward,
      statDelta: template.statDelta,
      loggedAt: "just now"
    };
    onLogActivity(activity);
    setRewardMessage(`+${template.xpReward} XP earned. ${template.title} updated your build instantly.`);
    setNotes("");
    setDurationMinutes(60);
  }

  return (
    <Card>
      <SectionHeading
        eyebrow="Activity logging"
        title="Turn effort into XP"
        description="Study, train, join campus life, and get immediate stat gains."
      />

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-uri-ink">
            Activity type
            <select
              className="rounded-2xl border border-uri-navy/12 bg-white px-4 py-3"
              value={activityType}
              onChange={(event) => setActivityType(event.target.value as ActivityType)}
            >
              {Object.keys(activityTemplates).map((key) => (
                <option key={key} value={key}>
                  {activityTemplates[key as ActivityType].title}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium text-uri-ink">
            Duration
            <input
              className="rounded-2xl border border-uri-navy/12 bg-white px-4 py-3"
              min={5}
              step={5}
              type="number"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium text-uri-ink">
          Notes
          <textarea
            className="min-h-28 rounded-2xl border border-uri-navy/12 bg-white px-4 py-3"
            placeholder="What did you finish, attend, or improve?"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <button
            className="rounded-full bg-uri-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17386e]"
            type="submit"
          >
            Log activity
          </button>
          <p className="text-sm text-uri-navy/62">{rewardMessage}</p>
        </div>
      </form>
    </Card>
  );
}
