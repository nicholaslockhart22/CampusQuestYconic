"use client";

import { useEffect, useState } from "react";
import { useGameState } from "@/components/providers/game-state-provider";
import { RarityBadge } from "@/components/ui/rarity-badge";

export function ProfileMobileScreen() {
  const { state, updateProfile } = useGameState();
  const { profile } = state;
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [avatarClass, setAvatarClass] = useState(profile.avatarClass);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setBio(profile.bio);
    setAvatarClass(profile.avatarClass);
  }, [profile.name, profile.bio, profile.avatarClass]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({ name: name.trim(), bio: bio.trim(), avatarClass: avatarClass.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="bg-cq-white">
      <div className="border-b border-cq-keaney/25 bg-gradient-to-b from-cq-keaneyIce/80 to-cq-white px-4 pb-4 pt-3">
        <div className="flex gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cq-keaneyBright via-cq-keaney to-cq-navy text-xl font-bold text-white shadow-md ring-4 ring-cq-white">
            {initials}
          </div>
          <div className="flex flex-1 justify-around pt-2 text-center">
            <div>
              <p className="text-lg font-bold text-cq-navy">{profile.level}</p>
              <p className="text-[11px] font-medium text-cq-keaney">Level</p>
            </div>
            <div>
              <p className="text-lg font-bold text-cq-navy">{profile.streakDays}</p>
              <p className="text-[11px] font-medium text-cq-keaney">Streak</p>
            </div>
            <div>
              <p className="text-lg font-bold text-cq-navy">#{profile.rank}</p>
              <p className="text-[11px] font-medium text-cq-keaney">Campus</p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-cq-navy">{profile.name}</p>
        <p className="text-sm font-medium text-cq-keaney">{profile.avatarClass}</p>
        <p className="mt-2 text-sm leading-relaxed text-ig-secondary">{profile.bio}</p>
        <div className="mt-3 grid grid-cols-3 gap-1 border-t border-cq-keaney/25 pt-3 text-center text-xs">
          <div>
            <p className="font-bold text-cq-navy">{profile.xp}</p>
            <p className="text-ig-secondary">XP bar</p>
          </div>
          <div>
            <p className="font-bold text-cq-navy">{profile.xpToNext - profile.xp}</p>
            <p className="text-ig-secondary">To level</p>
          </div>
          <div>
            <p className="font-bold text-cq-navy">{state.inventory.length}</p>
            <p className="text-ig-secondary">Items</p>
          </div>
        </div>
      </div>

      <div className="border-b border-cq-keaney/20 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Edit profile</p>
        <form className="mt-3 space-y-3" onSubmit={handleSave}>
          <input
            className="w-full rounded-lg border border-cq-keaney/40 bg-cq-keaneyIce/50 px-3 py-2 text-sm text-cq-navy placeholder:text-ig-secondary/70 focus:border-cq-keaney focus:outline-none focus:ring-2 focus:ring-cq-keaney/35"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display name"
          />
          <input
            className="w-full rounded-lg border border-cq-keaney/40 bg-cq-keaneyIce/50 px-3 py-2 text-sm text-cq-navy placeholder:text-ig-secondary/70 focus:border-cq-keaney focus:outline-none focus:ring-2 focus:ring-cq-keaney/35"
            value={avatarClass}
            onChange={(e) => setAvatarClass(e.target.value)}
            placeholder="Class title"
          />
          <textarea
            className="min-h-20 w-full rounded-lg border border-cq-keaney/40 bg-cq-keaneyIce/50 px-3 py-2 text-sm text-cq-navy placeholder:text-ig-secondary/70 focus:border-cq-keaney focus:outline-none focus:ring-2 focus:ring-cq-keaney/35"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-cq-navy py-2.5 text-sm font-bold text-white shadow-md hover:bg-cq-navyLight"
          >
            Save
          </button>
          {saved ? <p className="text-center text-xs text-ig-secondary">Saved locally.</p> : null}
        </form>
      </div>

      <div className="px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Achievements</p>
        <ul className="mt-2 space-y-2">
          {profile.achievements.map((a) => (
            <li key={a.id} className="rounded-lg border border-cq-keaney/30 bg-cq-keaneyIce/40 px-3 py-2 text-sm">
              <span className="font-semibold text-cq-navy">{a.name}</span>
              <p className="text-xs text-ig-secondary">{a.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-cq-keaney/25 px-1 pb-6 pt-3">
        <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-cq-keaney">Collection</p>
        <div className="grid grid-cols-3 gap-0.5">
          {state.inventory.map((item) => (
            <div
              key={item.id}
              className="aspect-square border border-cq-keaney/35 bg-gradient-to-br from-cq-keaneyIce to-cq-keaneySoft/60 p-2"
            >
              <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-cq-navy">{item.name}</p>
              <div className="mt-1">
                <RarityBadge rarity={item.rarity} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
