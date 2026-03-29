import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Quest } from "@/lib/types";

export function QuestBoard({
  quests,
  onClaimReward
}: {
  quests: Quest[];
  onClaimReward?: (questId: string) => void;
}) {
  return (
    <Card>
      <SectionHeading
        eyebrow="Quest board"
        title="Daily, weekly, and campus quests"
        description="Each quest is designed to reward real student success and URI involvement."
      />
      <div className="space-y-4">
        {quests.map((quest) => {
          const ready = quest.progress >= quest.goal && !quest.rewardClaimed;
          const claimed = Boolean(quest.rewardClaimed);
          return (
            <article
              key={quest.id}
              className="rounded-2xl border border-cq-keaney/35 bg-cq-keaneyIce/40 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cq-keaney">{quest.frequency}</p>
                  <h3 className="mt-1 text-lg font-semibold text-cq-navy">{quest.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ig-secondary">{quest.description}</p>
                </div>
                <div className="rounded-full bg-cq-keaneySoft px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cq-navy ring-1 ring-cq-keaney/45">
                  {quest.tag}
                </div>
              </div>
              <div className="mt-4">
                <ProgressBar value={quest.progress} max={quest.goal} tone="blue" />
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-ig-secondary">
                <span>
                  {quest.progress}/{quest.goal} complete
                  {claimed ? " · reward claimed" : ""}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-cq-navy">+{quest.xpReward} XP</strong>
                  {ready && onClaimReward ? (
                    <button
                      type="button"
                      className="rounded-full bg-cq-navy px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-cq-navyLight"
                      onClick={() => onClaimReward(quest.id)}
                    >
                      Claim reward
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Card>
  );
}
