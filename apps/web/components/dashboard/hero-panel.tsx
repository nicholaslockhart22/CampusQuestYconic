import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { CharacterProfile } from "@/lib/types";

export function HeroPanel({ profile }: { profile: CharacterProfile }) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-uri-navy via-[#17386e] to-[#234a83] text-white">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/70">Scholar Realm</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">{profile.name}</h2>
          <p className="mt-2 text-lg text-uri-ember">{profile.avatarClass}</p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">{profile.bio}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Level</p>
              <strong className="mt-2 block text-3xl">{profile.level}</strong>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Streak</p>
              <strong className="mt-2 block text-3xl">{profile.streakDays} days</strong>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Campus Rank</p>
              <strong className="mt-2 block text-3xl">#{profile.rank}</strong>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/10 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/60">XP Track</p>
          <strong className="mt-3 block text-4xl">{profile.xp} XP</strong>
          <p className="mt-2 text-sm text-white/72">{profile.xpToNext - profile.xp} XP until the next level break.</p>
          <div className="mt-4">
            <ProgressBar value={profile.xp} max={profile.xpToNext} />
          </div>
          <div className="mt-6 rounded-3xl bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Achievement Highlights</p>
            <ul className="mt-3 space-y-3 text-sm text-white/82">
              {profile.achievements.map((achievement) => (
                <li key={achievement.id}>
                  <strong className="block text-white">{achievement.name}</strong>
                  <span>{achievement.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
