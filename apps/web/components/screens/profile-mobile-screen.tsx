"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { activityPrimaryStat } from "@/lib/activity-primary-stat";
import { ActivityLogPanel } from "@/components/dashboard/activity-log-panel";
import { useGameState } from "@/components/providers/game-state-provider";
import { RarityBadge } from "@/components/ui/rarity-badge";
import type { ActivityLog, CharacterProfile, EquipmentSlot, StatKey } from "@/lib/types";

const GUILD_MEMBERSHIPS_KEY = "campusquest-guild-memberships-v1";
const STREAK_XP_TARGET = 20;
const DAILY_TRAINING_MAX = 2;
const TRAINING_XP = 22;

const STAT_META: { key: StatKey; emoji: string; label: string }[] = [
  { key: "strength", emoji: "💪", label: "Strength" },
  { key: "stamina", emoji: "🏃", label: "Stamina" },
  { key: "knowledge", emoji: "📚", label: "Knowledge" },
  { key: "social", emoji: "👥", label: "Social" },
  { key: "focus", emoji: "🎯", label: "Focus" }
];

function slugHandle(name: string) {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 16);
  return s || "ram";
}

function displayAtHandle(profile: CharacterProfile) {
  const h = profile.handle.trim() || slugHandle(profile.name);
  return `@${h}`;
}

function countByStat(activities: ActivityLog[]): Record<StatKey, number> {
  const init: Record<StatKey, number> = {
    strength: 0,
    stamina: 0,
    knowledge: 0,
    social: 0,
    focus: 0
  };
  for (const a of activities) {
    init[activityPrimaryStat(a)] += 1;
  }
  return init;
}

function xpLoggedToday(activities: ActivityLog[]) {
  return activities
    .filter((a) => /today|just now/i.test(a.loggedAt))
    .reduce((sum, a) => sum + a.xpReward, 0);
}

function readGuildCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(GUILD_MEMBERSHIPS_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function Collapsible({
  title,
  icon,
  defaultOpen,
  children
}: {
  title: string;
  icon?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="rounded-xl border border-cq-keaney/30 bg-cq-white/90 shadow-sm">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="text-cq-keaney" aria-hidden>
          {open ? "▾" : "▶"}
        </span>
        {icon ? (
          <span aria-hidden className="text-base">
            {icon}
          </span>
        ) : null}
        <span className="text-sm font-bold text-cq-navy">{title}</span>
      </button>
      {open ? <div className="border-t border-cq-keaney/15 px-3 py-3">{children}</div> : null}
    </div>
  );
}

function LevelBar({ profile }: { profile: CharacterProfile }) {
  const pct = Math.min(100, Math.round((profile.xp / profile.xpToNext) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs text-ig-secondary">
        <span>Level progress</span>
        <span className="tabular-nums font-semibold text-cq-navy">
          {profile.xp} / {profile.xpToNext} XP
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-cq-keaneyIce ring-1 ring-cq-keaney/25">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cq-keaney to-cq-navy"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ProfileMobileScreen() {
  const {
    state,
    updateProfile,
    setEquipmentSlot,
    playDailyTraining,
    logOut,
    logActivity
  } = useGameState();
  const { profile, activities, quests, feed, feedFollowing, recruitedBosses, inventory } = state;

  const [subTab, setSubTab] = useState<"character" | "profile">("character");
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [avatarClass, setAvatarClass] = useState(profile.avatarClass);
  const [saved, setSaved] = useState(false);
  const [guildCount, setGuildCount] = useState(0);

  useEffect(() => {
    setName(profile.name);
    setHandle(profile.handle);
    setBio(profile.bio);
    setAvatarClass(profile.avatarClass);
  }, [profile.name, profile.handle, profile.bio, profile.avatarClass]);

  useEffect(() => {
    function refresh() {
      setGuildCount(readGuildCount());
    }
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const statCounts = useMemo(() => countByStat(activities), [activities]);
  const xpToday = useMemo(() => xpLoggedToday(activities), [activities]);
  const surpriseQuest = useMemo(
    () =>
      quests.find((q) => q.title === "Career spark") ??
      quests.find((q) => q.frequency === "daily" && !q.rewardClaimed && q.progress < q.goal),
    [quests]
  );
  const myPosts = useMemo(() => feed.filter((p) => p.author === profile.name), [feed, profile.name]);
  const followingAuthors = useMemo(
    () => new Set(feedFollowing.map((p) => p.author)).size,
    [feedFollowing]
  );
  const bossesDefeated = useMemo(
    () => recruitedBosses.filter((b) => b.hpRemaining <= 0).length,
    [recruitedBosses]
  );
  const finalBossesDefeated = useMemo(
    () => recruitedBosses.filter((b) => b.maxHp >= 500 && b.hpRemaining <= 0).length,
    [recruitedBosses]
  );

  const playsLeft = Math.max(0, DAILY_TRAINING_MAX - state.trainingPlaysUsed);
  const weeklyActivityCount = activities.length;

  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    const h = handle.trim().replace(/^@/, "").replace(/\s+/g, "");
    updateProfile({
      name: name.trim(),
      bio: bio.trim(),
      avatarClass: avatarClass.trim(),
      handle: h
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-cq-white pb-6">
      <header className="border-b border-cq-keaney/25 bg-gradient-to-b from-cq-keaneyIce/90 to-cq-white px-4 pb-4 pt-3">
        <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Your Ram</p>
        <p className="mt-1 text-sm text-ig-secondary">
          Level up, equip loot, and manage how you show up on the Quad.
        </p>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-cq-keaney/25 bg-cq-white/80 px-3 py-3">
          <span className="text-xl" aria-hidden>
            ⚡
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-cq-keaney">Quick stats</p>
            <div className="mt-1 flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-lg font-bold tabular-nums text-cq-navy">{profile.level}</p>
                <p className="text-[10px] font-medium text-ig-secondary">Level</p>
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums text-cq-navy">{profile.streakDays}d</p>
                <p className="text-[10px] font-medium text-ig-secondary">Streak</p>
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums text-cq-navy">{profile.xp}</p>
                <p className="text-[10px] font-medium text-ig-secondary">XP</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex rounded-xl border border-cq-keaney/30 bg-cq-keaneyIce/40 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wide transition ${
              subTab === "character"
                ? "bg-cq-navy text-white shadow-sm"
                : "text-cq-navy hover:bg-cq-white/60"
            }`}
            onClick={() => setSubTab("character")}
          >
            ⚔️ Character
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wide transition ${
              subTab === "profile"
                ? "bg-cq-navy text-white shadow-sm"
                : "text-cq-navy hover:bg-cq-white/60"
            }`}
            onClick={() => setSubTab("profile")}
          >
            👤 Profile
          </button>
        </div>
      </header>

      {subTab === "character" ? (
        <div className="space-y-3 px-4 pt-4">
          <section className="rounded-xl border border-cq-keaney/30 bg-gradient-to-br from-cq-white to-cq-keaneyIce/50 p-3 shadow-sm">
            <div className="flex gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cq-keaney to-cq-navy text-sm font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-cq-keaney">Profile</p>
                <p className="text-sm font-semibold text-cq-navy">
                  Log activities, skills, streaks, and weekly recap — your main progression hub.
                </p>
              </div>
            </div>
            <div className="mt-3 border-t border-cq-keaney/15 pt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-cq-navy">{profile.level}</span>
                <span className="text-sm font-semibold text-cq-navy">✏️ {profile.name}</span>
              </div>
              <p className="text-sm text-cq-keaney">{displayAtHandle(profile)}</p>
              <div className="mt-2">
                <LevelBar profile={profile} />
              </div>
            </div>
          </section>

          <section className="-mx-1">
            <ActivityLogPanel onLogActivity={logActivity} />
          </section>

          <section>
            <div className="mb-2 flex items-center gap-2 px-1">
              <span aria-hidden>⚔️</span>
              <h2 className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Stats</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STAT_META.map(({ key, emoji, label }) => (
                <div
                  key={key}
                  className="rounded-xl border border-cq-keaney/25 bg-cq-white px-3 py-2.5 shadow-sm"
                >
                  <p className="text-xs text-ig-secondary">
                    {emoji} {label}
                  </p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-cq-navy">{profile.stats[key]}</p>
                </div>
              ))}
            </div>
          </section>

          <Collapsible title="Achievements" icon="🏅" defaultOpen>
            <ul className="space-y-2">
              <li className="rounded-lg border border-cq-keaney/20 bg-cq-keaneyIce/40 px-3 py-2 text-sm text-cq-navy">
                <span className="font-semibold">Log activity · Earn XP</span>
                <p className="mt-1 text-xs text-ig-secondary">
                  Add proof (photo URL, link, or note) to level up your stats.
                </p>
              </li>
              {profile.achievements.map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-cq-keaney/20 bg-cq-keaneyIce/40 px-3 py-2 text-sm"
                >
                  <span className="font-semibold text-cq-navy">{a.name}</span>
                  <p className="text-xs text-ig-secondary">{a.description}</p>
                </li>
              ))}
            </ul>
          </Collapsible>

          <div className="space-y-2">
            {STAT_META.map(({ key, emoji, label }) => (
              <Collapsible key={key} title={`${label}`} icon={emoji}>
                <p className="text-sm text-ig-secondary">
                  <span className="font-bold tabular-nums text-cq-navy">{statCounts[key]}</span> activities logged toward
                  this stat bucket.
                </p>
              </Collapsible>
            ))}
          </div>

          <div className="rounded-xl border border-orange-200/80 bg-gradient-to-br from-amber-50 to-cq-white p-3 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-bold text-cq-navy">
              <span aria-hidden>🔥</span>
              <span aria-hidden>🔥</span>
              <span>
                {profile.streakDays}-day streak
              </span>
            </p>
            <p className="mt-1 text-xs text-ig-secondary">Keep logging to extend your streak.</p>
            <p className="mt-2 text-xs font-semibold text-cq-navy">
              Today: {xpToday}/{STREAK_XP_TARGET} XP toward streak credit
            </p>
          </div>

          {surpriseQuest ? (
            <div className="rounded-xl border border-cq-keaney/35 bg-cq-white p-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-cq-keaney">💼 Surprise quest (daily)</p>
              <p className="mt-1 text-base font-bold text-cq-navy">{surpriseQuest.title}</p>
              <p className="mt-1 text-sm text-ig-secondary">{surpriseQuest.description}</p>
              <p className="mt-2 text-xs text-ig-secondary">
                Complete it by logging a matching activity. Bonus stacks on top of multipliers.
              </p>
            </div>
          ) : null}

          <Collapsible title="Skill tree" icon="🧠" defaultOpen>
            <p className="text-sm text-cq-navy">
              <span className="font-bold tabular-nums">{profile.skillPoints}</span> skill points available · Tap to unlock
              nodes <span className="text-ig-secondary">(coming soon)</span>
            </p>
          </Collapsible>

          <Collapsible title="Daily training" icon="🎮" defaultOpen>
            <p className="text-sm text-ig-secondary">
              One game per stat — <span className="font-semibold text-cq-navy">{playsLeft}</span> plays left today (max{" "}
              {DAILY_TRAINING_MAX}). Streak mult ×1.02 after full training days.
            </p>
            <p className="mt-2 text-xs text-ig-secondary">
              Second play today: +{TRAINING_XP} XP “Daily training complete”. Hit all five stats this week: +50 XP bonus
              once.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STAT_META.map(({ key, emoji, label }) => (
                <button
                  key={key}
                  type="button"
                  disabled={playsLeft <= 0}
                  onClick={() => playDailyTraining()}
                  className="rounded-lg border border-cq-keaney/40 bg-cq-keaneyIce/50 px-3 py-2 text-left text-xs font-semibold text-cq-navy disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
            {playsLeft <= 0 ? (
              <p className="mt-2 text-xs font-medium text-ig-secondary">
                You used both training sessions today. Come back tomorrow for more XP.
              </p>
            ) : null}
          </Collapsible>

          <Collapsible title="Weekly recap" icon="📅">
            <p className="text-sm text-ig-secondary">
              This week you logged <span className="font-bold text-cq-navy">{weeklyActivityCount}</span> activities in
              this browser. Open <strong className="text-cq-navy">Battle</strong> for boss progress and{" "}
              <strong className="text-cq-navy">Quad</strong> to share wins.
            </p>
          </Collapsible>

          <Collapsible title="Recent activities" icon="📋" defaultOpen>
            {activities.length === 0 ? (
              <p className="text-sm text-ig-secondary">No activities yet — log one from the Battle tab.</p>
            ) : (
              <ul className="space-y-2">
                {activities.slice(0, 8).map((a) => (
                  <li
                    key={a.id}
                    className="rounded-lg border border-cq-keaney/20 bg-cq-keaneyIce/30 px-3 py-2 text-sm text-cq-navy"
                  >
                    <span className="font-semibold">{a.title}</span>
                    <span className="text-ig-secondary"> · +{a.xpReward} XP</span>
                    <p className="text-[11px] text-ig-secondary">{a.loggedAt}</p>
                  </li>
                ))}
              </ul>
            )}
          </Collapsible>
        </div>
      ) : (
        <div className="space-y-4 px-4 pt-4">
          <div className="flex gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cq-keaneyBright via-cq-keaney to-cq-navy text-lg font-bold text-white shadow-md ring-4 ring-cq-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-cq-navy">{profile.name}</p>
              <p className="text-sm font-medium text-cq-keaney">{displayAtHandle(profile)}</p>
              <div className="mt-2">
                <LevelBar profile={profile} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-cq-keaney/25 bg-cq-keaneyIce/40 py-3">
              <p className="text-lg font-bold text-cq-navy">{myPosts.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ig-secondary">Posts</p>
            </div>
            <div className="rounded-xl border border-cq-keaney/25 bg-cq-keaneyIce/40 py-3">
              <p className="text-lg font-bold text-cq-navy">{guildCount}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ig-secondary">Friends</p>
            </div>
            <div className="rounded-xl border border-cq-keaney/25 bg-cq-keaneyIce/40 py-3">
              <p className="text-lg font-bold text-cq-navy">{followingAuthors}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ig-secondary">Following</p>
            </div>
          </div>

          <Collapsible title="Edit bio" icon="✏️" defaultOpen>
            <form className="space-y-3" onSubmit={handleSaveProfile}>
              <label className="block text-xs font-semibold text-cq-navy">
                Display name
                <input
                  className="mt-1 w-full rounded-xl border border-cq-keaney/40 bg-cq-keaneyIce/50 px-3 py-2 text-sm text-cq-navy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="block text-xs font-semibold text-cq-navy">
                Handle (no @)
                <input
                  className="mt-1 w-full rounded-xl border border-cq-keaney/40 bg-cq-keaneyIce/50 px-3 py-2 text-sm text-cq-navy"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))}
                  placeholder={slugHandle(name)}
                />
              </label>
              <label className="block text-xs font-semibold text-cq-navy">
                Class title
                <input
                  className="mt-1 w-full rounded-xl border border-cq-keaney/40 bg-cq-keaneyIce/50 px-3 py-2 text-sm text-cq-navy"
                  value={avatarClass}
                  onChange={(e) => setAvatarClass(e.target.value)}
                />
              </label>
              <label className="block text-xs font-semibold text-cq-navy">
                Bio
                <textarea
                  className="mt-1 min-h-24 w-full rounded-xl border border-cq-keaney/40 bg-cq-keaneyIce/50 px-3 py-2 text-sm text-cq-navy"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-xl bg-cq-navy py-2.5 text-sm font-bold text-white shadow-sm hover:bg-cq-navyLight"
              >
                Save profile
              </button>
              {saved ? <p className="text-center text-xs text-ig-secondary">Saved locally.</p> : null}
            </form>
          </Collapsible>

          <section>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-cq-keaney">
              <span aria-hidden>🎁</span> Loot Codex
            </p>
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-cq-keaney/30 bg-cq-keaneyIce/30 p-2">
              {inventory.length === 0 ? (
                <p className="col-span-3 py-4 text-center text-sm text-ig-secondary">No loot yet — clear quests.</p>
              ) : (
                inventory.map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square border border-cq-keaney/35 bg-cq-white p-2 shadow-sm"
                  >
                    <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-cq-navy">{item.name}</p>
                    <div className="mt-1">
                      <RarityBadge rarity={item.rarity} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-xl border border-cq-keaney/30 bg-cq-white p-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Equipment loadout</p>
            <p className="mt-1 text-xs text-ig-secondary">
              Equip unlocked loot for real XP & streak-save bonuses.
            </p>
            {(["hat", "glasses", "backpack"] as EquipmentSlot[]).map((slot) => (
              <label key={slot} className="mt-3 block text-xs font-semibold capitalize text-cq-navy">
                {slot}
                <select
                  className="mt-1 w-full rounded-lg border border-cq-keaney/40 bg-cq-keaneyIce/50 px-3 py-2 text-sm text-cq-navy"
                  value={state.equipmentLoadout[slot] ?? ""}
                  onChange={(e) =>
                    setEquipmentSlot(slot, e.target.value === "" ? null : e.target.value)
                  }
                >
                  <option value="">None</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </section>

          <section className="rounded-xl border border-cq-keaney/30 bg-gradient-to-br from-cq-keaneyIce/60 to-cq-white p-3 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-cq-keaney">
              <span aria-hidden>⚔️</span> Character stats
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 rounded-lg bg-cq-white/80 px-2 py-2">
                <span aria-hidden>📊</span>
                <div>
                  <p className="text-[10px] text-ig-secondary">Level</p>
                  <p className="font-bold text-cq-navy">{profile.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-cq-white/80 px-2 py-2">
                <span aria-hidden>✨</span>
                <div>
                  <p className="text-[10px] text-ig-secondary">Total XP</p>
                  <p className="font-bold tabular-nums text-cq-navy">{profile.xp}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-cq-white/80 px-2 py-2">
                <span aria-hidden>🐉</span>
                <div>
                  <p className="text-[10px] text-ig-secondary">Bosses defeated</p>
                  <p className="font-bold tabular-nums text-cq-navy">{bossesDefeated}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-cq-white/80 px-2 py-2">
                <span aria-hidden>👑</span>
                <div>
                  <p className="text-[10px] text-ig-secondary">Final bosses</p>
                  <p className="font-bold tabular-nums text-cq-navy">{finalBossesDefeated}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {STAT_META.map(({ key, emoji, label }) => (
                <div key={key} className="rounded-lg border border-cq-keaney/20 bg-cq-white/90 px-2 py-2 text-xs">
                  <span className="text-ig-secondary">
                    {emoji} {label}
                  </span>
                  <p className="text-lg font-bold tabular-nums text-cq-navy">{profile.stats[key]}</p>
                </div>
              ))}
            </div>
          </section>

          <button
            type="button"
            onClick={() => logOut()}
            className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-800 hover:bg-red-100"
          >
            Log out
          </button>

          <section>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-cq-keaney">
              <span aria-hidden>📜</span> Posts to the Quad
            </p>
            {myPosts.length === 0 ? (
              <p className="rounded-xl border border-dashed border-cq-keaney/40 bg-cq-keaneyIce/40 px-4 py-6 text-center text-sm text-ig-secondary">
                No posts yet.{" "}
                <Link href="/quad" className="font-semibold text-cq-navy underline">
                  Share something on The Quad
                </Link>
                !
              </p>
            ) : (
              <ul className="space-y-2">
                {myPosts.map((p) => (
                  <li key={p.id} className="rounded-xl border border-cq-keaney/25 bg-cq-white px-3 py-2 text-sm">
                    <p className="font-semibold text-cq-navy">{p.title}</p>
                    <p className="line-clamp-2 text-xs text-ig-secondary">{p.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
