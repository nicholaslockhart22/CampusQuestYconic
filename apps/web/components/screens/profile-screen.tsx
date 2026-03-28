"use client";

import { useEffect, useState } from "react";
import { useGameState } from "@/components/providers/game-state-provider";
import { HeroPanel } from "@/components/dashboard/hero-panel";
import { ProfileStats } from "@/components/dashboard/profile-stats";
import { AppShell } from "@/components/ui/app-shell";
import { Card } from "@/components/ui/card";

export function ProfileScreen() {
  const { state, updateProfile } = useGameState();
  const [name, setName] = useState(state.profile.name);
  const [bio, setBio] = useState(state.profile.bio);
  const [avatarClass, setAvatarClass] = useState(state.profile.avatarClass);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(state.profile.name);
    setBio(state.profile.bio);
    setAvatarClass(state.profile.avatarClass);
  }, [state.profile.name, state.profile.bio, state.profile.avatarClass]);

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    updateProfile({ name: name.trim(), bio: bio.trim(), avatarClass: avatarClass.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }

  return (
    <AppShell
      title="Character sheet"
      subtitle="Tune your adventurer identity. Stats and XP stay in sync everywhere you play in this build."
    >
      <HeroPanel profile={state.profile} />
      <ProfileStats profile={state.profile} />

      <Card>
        <p className="text-xs uppercase tracking-[0.24em] text-uri-navy/52">Loadout editor</p>
        <h3 className="mt-2 text-xl font-semibold text-uri-ink">Name, class, and saga</h3>
        <form className="mt-6 grid gap-4" onSubmit={handleSave}>
          <label className="grid gap-2 text-sm font-medium text-uri-ink">
            Display name
            <input
              className="rounded-2xl border border-uri-navy/12 bg-white px-4 py-3"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-uri-ink">
            Class title
            <input
              className="rounded-2xl border border-uri-navy/12 bg-white px-4 py-3"
              value={avatarClass}
              onChange={(event) => setAvatarClass(event.target.value)}
              placeholder="Scholar Ranger, Keaney Berserker..."
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-uri-ink">
            Bio
            <textarea
              className="min-h-28 rounded-2xl border border-uri-navy/12 bg-white px-4 py-3"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-full bg-uri-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17386e]"
            >
              Save profile
            </button>
            {saved ? <span className="text-sm text-uri-navy/66">Saved to this browser.</span> : null}
          </div>
        </form>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-[0.24em] text-uri-navy/52">Achievements</p>
        <ul className="mt-4 space-y-4">
          {state.profile.achievements.map((achievement) => (
            <li key={achievement.id} className="rounded-2xl border border-uri-navy/10 bg-white/70 px-4 py-3">
              <strong className="text-uri-ink">{achievement.name}</strong>
              <p className="mt-1 text-sm text-uri-navy/66">{achievement.description}</p>
            </li>
          ))}
        </ul>
      </Card>
    </AppShell>
  );
}
