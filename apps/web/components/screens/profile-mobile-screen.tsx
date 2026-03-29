"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useGameState } from "@/components/providers/game-state-provider";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RarityBadge } from "@/components/ui/rarity-badge";
import { STORAGE_KEY } from "@/lib/storage";
import type { ActivityLog, StatKey } from "@/lib/types";

const GUILD_MEMBERSHIPS_KEY = "campusquest-guild-memberships-v1";
const TRAINING_LS_KEY = "campusquest-daily-training-v1";
const SKILL_NODES_LS_KEY = "campusquest-skill-nodes-v1";
const EQUIP_LS_KEY = "campusquest-equipment-v1";

const STAT_ROWS: { key: StatKey; emoji: string; label: string }[] = [
  { key: "strength", emoji: "💪", label: "Strength" },
  { key: "stamina", emoji: "🏃", label: "Stamina" },
  { key: "knowledge", emoji: "📚", label: "Knowledge" },
  { key: "social", emoji: "👥", label: "Social" },
  { key: "focus", emoji: "🎯", label: "Focus" }
];

const SKILL_NODES: { id: string; label: string; emoji: string }[] = [
  { id: "n-strength", label: "Power node", emoji: "💪" },
  { id: "n-stamina", label: "Endurance node", emoji: "🏃" },
  { id: "n-knowledge", label: "Scholar node", emoji: "📚" },
  { id: "n-social", label: "Network node", emoji: "👥" },
  { id: "n-focus", label: "Deep work node", emoji: "🎯" },
  { id: "n-core", label: "Ram core", emoji: "🐏" }
];

type EquipmentSlot = "hat" | "glasses" | "backpack";
type Loadout = Record<EquipmentSlot, string | null>;

function slugHandle(name: string): string {
  const s = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  return s || "ram";
}

function activityPrimaryStat(a: ActivityLog): StatKey {
  switch (a.type) {
    case "workout":
      return a.durationMinutes >= 25 ? "stamina" : "strength";
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

function countByPrimaryStat(activities: ActivityLog[]): Record<StatKey, number> {
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

function readGuildCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(GUILD_MEMBERSHIPS_KEY);
    if (!raw) return 0;
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p) ? p.length : 0;
  } catch {
    return 0;
  }
}

function readTrainingDay(): { day: string; count: number } {
  const day = new Date().toISOString().slice(0, 10);
  if (typeof window === "undefined") return { day, count: 0 };
  try {
    const raw = window.localStorage.getItem(TRAINING_LS_KEY);
    if (!raw) return { day, count: 0 };
    const p = JSON.parse(raw) as { day?: string; count?: number };
    if (p.day !== day) return { day, count: 0 };
    return { day, count: Math.min(2, Math.max(0, Number(p.count) || 0)) };
  } catch {
    return { day, count: 0 };
  }
}

function writeTrainingDay(day: string, count: number) {
  window.localStorage.setItem(TRAINING_LS_KEY, JSON.stringify({ day, count }));
}

function readSkillNodes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SKILL_NODES_LS_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p) ? p.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeSkillNodes(ids: string[]) {
  window.localStorage.setItem(SKILL_NODES_LS_KEY, JSON.stringify(ids));
}

function readLoadout(): Loadout {
  const empty: Loadout = { hat: null, glasses: null, backpack: null };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(EQUIP_LS_KEY);
    if (!raw) return empty;
    const p = JSON.parse(raw) as Partial<Loadout>;
    return {
      hat: typeof p.hat === "string" ? p.hat : null,
      glasses: typeof p.glasses === "string" ? p.glasses : null,
      backpack: typeof p.backpack === "string" ? p.backpack : null
    };
  } catch {
    return empty;
  }
}

function writeLoadout(l: Loadout) {
  window.localStorage.setItem(EQUIP_LS_KEY, JSON.stringify(l));
}

function Collapsible({
  title,
  emoji,
  defaultOpen,
  children
}: {
  title: string;
  emoji?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="rounded-xl border border-cq-keaney/25 bg-cq-white">
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="text-cq-keaney">{open ? "▼" : "▶"}</span>
        {emoji ? <span aria-hidden>{emoji}</span> : null}
        <span className="text-sm font-semibold text-cq-navy">{title}</span>
      </button>
      {open ? <div className="border-t border-cq-keaney/15 px-3 py-3">{children}</div> : null}
    </div>
  );
}

export function ProfileMobileScreen() {
  const { state, updateProfile, logActivity } = useGameState();
  const { profile } = state;

  const [subtab, setSubtab] = useState<"character" | "profile">("character");
  const [guildCount, setGuildCount] = useState(0);
  const [training, setTraining] = useState({ day: "", count: 0 });
  const [skillUnlocked, setSkillUnlocked] = useState<string[]>([]);
  const [loadout, setLoadout] = useState<Loadout>({
    hat: null,
    glasses: null,
    backpack: null
  });
  const [equipPicker, setEquipPicker] = useState<EquipmentSlot | null>(null);

  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle ?? "");
  const [bio, setBio] = useState(profile.bio);
  const [avatarClass, setAvatarClass] = useState(profile.avatarClass);
  const [saved, setSaved] = useState(false);
  const [bioEditing, setBioEditing] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setHandle(profile.handle ?? "");
    setBio(profile.bio);
    setAvatarClass(profile.avatarClass);
  }, [profile.name, profile.handle, profile.bio, profile.avatarClass]);

  useEffect(() => {
    setGuildCount(readGuildCount());
    setTraining(readTrainingDay());
    setSkillUnlocked(readSkillNodes());
    setLoadout(readLoadout());
  }, []);

  const displayHandle = profile.handle?.trim() || slugHandle(profile.name);

  const statCounts = useMemo(() => countByPrimaryStat(state.activities), [state.activities]);

  const surpriseQuest = useMemo(() => {
    const dailies = state.quests.filter((q) => q.frequency === "daily" && !q.rewardClaimed);
    return dailies[0] ?? state.quests.find((q) => !q.rewardClaimed) ?? null;
  }, [state.quests]);

  const postsCount = useMemo(() => {
    const mine = (p: { author: string }) => p.author === profile.name;
    return state.feed.filter(mine).length + state.feedFollowing.filter(mine).length;
  }, [state.feed, state.feedFollowing, profile.name]);

  const followingCount = state.feedFollowing.length;

  const defeated = state.recruitedBosses.filter((b) => b.hpRemaining <= 0);
  const bossesDefeatedStd = defeated.filter((b) => b.maxHp < 500).length;
  const finalBossesDefeated = defeated.filter((b) => b.maxHp >= 500).length;

  const skillPointsBudget = Math.max(0, profile.level - 1);
  const skillPointsLeft = Math.max(0, skillPointsBudget - skillUnlocked.length);

  const trainingMax = 2;
  const trainingLeft = Math.max(0, trainingMax - training.count);

  const bumpTraining = useCallback(() => {
    const t = readTrainingDay();
    if (t.count >= trainingMax) return;
    const next = { day: t.day, count: t.count + 1 };
    writeTrainingDay(next.day, next.count);
    setTraining(next);
  }, [trainingMax]);

  const onTrainingPlay = (stat: StatKey) => {
    if (trainingLeft <= 0) return;
    logActivity({
      id: `training-${Date.now()}`,
      type: "focus",
      title: "Daily training",
      durationMinutes: 20,
      notes: `${STAT_ROWS.find((r) => r.key === stat)?.label ?? stat} drill`,
      xpReward: 22,
      statDelta: { [stat]: 2 },
      loggedAt: "just now"
    });
    bumpTraining();
  };

  const unlockSkillNode = (id: string) => {
    if (skillPointsLeft <= 0 || skillUnlocked.includes(id)) return;
    const next = [...skillUnlocked, id];
    writeSkillNodes(next);
    setSkillUnlocked(next);
  };

  const setSlotItem = (slot: EquipmentSlot, itemName: string | null) => {
    const next = { ...loadout, [slot]: itemName };
    setLoadout(next);
    writeLoadout(next);
    setEquipPicker(null);
  };

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      bio: bio.trim(),
      avatarClass: avatarClass.trim(),
      handle: handle.trim()
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function logOut() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const streakGoalXp = 20;
  const streakTodayXp = state.activities[0]?.xpReward ?? 0;

  const userPosts: { post: (typeof state.feed)[0]; feed: "foryou" | "friends" }[] = useMemo(() => {
    const out: { post: (typeof state.feed)[0]; feed: "foryou" | "friends" }[] = [];
    for (const p of state.feed) {
      if (p.author === profile.name) out.push({ post: p, feed: "foryou" });
    }
    for (const p of state.feedFollowing) {
      if (p.author === profile.name) out.push({ post: p, feed: "friends" });
    }
    return out;
  }, [state.feed, state.feedFollowing, profile.name]);

  return (
    <div className="bg-cq-keaneyIce/30 pb-8">
      <header className="border-b border-cq-keaney/20 bg-gradient-to-b from-cq-white to-cq-keaneyIce/50 px-4 pb-4 pt-4">
        <h1 className="text-xl font-bold text-cq-navy">Your Ram</h1>
        <p className="mt-1 text-sm text-ig-secondary">
          Level up, equip loot, and manage how you show up on the Quad.
        </p>
        <div className="mt-4 flex gap-3 rounded-xl border border-cq-keaney/25 bg-cq-white/90 p-3 shadow-sm">
          <span className="text-2xl" aria-hidden>
            ⚡
          </span>
          <div className="grid flex-1 grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-cq-keaney">Level</p>
              <p className="text-lg font-bold tabular-nums text-cq-navy">{profile.level}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-cq-keaney">Streak</p>
              <p className="text-lg font-bold tabular-nums text-cq-navy">{profile.streakDays}d</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-cq-keaney">XP</p>
              <p className="text-lg font-bold tabular-nums text-cq-navy">{profile.xp}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex rounded-xl border border-cq-keaney/30 bg-cq-keaneyIce/40 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-colors ${
              subtab === "character"
                ? "bg-cq-navy text-white shadow-sm"
                : "text-cq-navy hover:bg-cq-white/60"
            }`}
            onClick={() => setSubtab("character")}
          >
            ⚔️ Character
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-colors ${
              subtab === "profile"
                ? "bg-cq-navy text-white shadow-sm"
                : "text-cq-navy hover:bg-cq-white/60"
            }`}
            onClick={() => setSubtab("profile")}
          >
            👤 Profile
          </button>
        </div>
      </header>

      {subtab === "character" ? (
        <div className="space-y-3 px-3 pt-3">
          <section className="rounded-xl border border-cq-keaney/25 bg-cq-white p-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cq-keaneyBright to-cq-navy text-lg font-bold text-white">
                👤
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Profile</p>
                <p className="mt-1 text-sm leading-relaxed text-ig-secondary">
                  Log activities, skills, streaks, and weekly recap — your main progression hub.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 border-t border-cq-keaney/15 pt-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cq-keaney text-sm font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-cq-navy">{profile.name}</p>
                <p className="text-sm text-cq-keaney">@{displayHandle}</p>
                <p className="text-xs text-ig-secondary">{profile.avatarClass}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-cq-navy">Level progress</p>
              <p className="mt-1 text-sm tabular-nums text-ig-secondary">
                <span className="font-bold text-cq-navy">{profile.xp}</span> / {profile.xpToNext} XP
              </p>
              <div className="mt-2">
                <ProgressBar value={profile.xp} max={profile.xpToNext} tone="blue" />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-cq-keaney/25 bg-cq-white p-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">⚔️ Stats</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {STAT_ROWS.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between rounded-lg border border-cq-keaney/20 bg-cq-keaneyIce/40 px-3 py-2"
                >
                  <span className="text-sm font-medium text-cq-navy">
                    <span className="mr-2" aria-hidden>
                      {row.emoji}
                    </span>
                    {row.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-cq-navy">{profile.stats[row.key]}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <p className="px-1 text-xs font-bold uppercase tracking-wide text-cq-keaney">Achievements</p>
            <Collapsible title="Log activity · Earn XP" emoji="✏️" defaultOpen>
              <p className="text-sm text-ig-secondary">
                Add proof (photo URL, link, or note) on the Battle tab when you log — it levels your stats and XP.
              </p>
              <Link
                href="/battle"
                className="mt-3 inline-block rounded-lg bg-cq-navy px-4 py-2 text-xs font-bold text-white"
              >
                Open Battle to log
              </Link>
            </Collapsible>
            {STAT_ROWS.map((row) => (
              <Collapsible
                key={row.key}
                title={`${row.label}`}
                emoji={row.emoji}
                defaultOpen={false}
              >
                <p className="text-sm font-semibold text-cq-navy">{statCounts[row.key]} activities</p>
                <p className="mt-1 text-xs text-ig-secondary">
                  Logs that map to {row.label} build this track. Long workouts lean Stamina; short ones lean Strength.
                </p>
              </Collapsible>
            ))}
          </section>

          <section className="rounded-xl border border-orange-200/80 bg-gradient-to-br from-orange-50 to-cq-white p-3 shadow-sm">
            <p className="text-lg" aria-hidden>
              🔥
            </p>
            <p className="text-sm font-bold text-cq-navy">{profile.streakDays}-day streak</p>
            <p className="mt-1 text-sm text-ig-secondary">Keep logging to extend your streak.</p>
            <p className="mt-2 text-xs text-ig-secondary">
              Today:{" "}
              <span className="font-semibold text-cq-navy">
                {streakTodayXp}/{streakGoalXp} XP
              </span>{" "}
              toward streak credit (from your most recent log).
            </p>
          </section>

          {surpriseQuest ? (
            <section className="rounded-xl border border-cq-keaney/25 bg-cq-white p-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">💼 Surprise quest (daily)</p>
              <p className="mt-2 text-base font-bold text-cq-navy">{surpriseQuest.title}</p>
              <p className="mt-1 text-sm text-ig-secondary">{surpriseQuest.description}</p>
              <p className="mt-2 text-xs font-semibold text-cq-keaney">
                +{surpriseQuest.xpReward} XP · Complete it by logging a matching activity. Bonus stacks on top of
                multipliers.
              </p>
            </section>
          ) : null}

          <section className="rounded-xl border border-cq-keaney/25 bg-cq-white p-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">🧠 Skill tree</p>
            <p className="mt-1 text-sm text-ig-secondary">
              <span className="font-bold text-cq-navy">{skillPointsLeft}</span> skill point
              {skillPointsLeft === 1 ? "" : "s"} available · Tap to unlock nodes
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {SKILL_NODES.map((n) => {
                const on = skillUnlocked.includes(n.id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    disabled={on || skillPointsLeft <= 0}
                    onClick={() => unlockSkillNode(n.id)}
                    className={`rounded-xl border px-2 py-3 text-center text-xs font-semibold transition-colors ${
                      on
                        ? "border-cq-keaney bg-cq-keaney text-white"
                        : skillPointsLeft > 0
                          ? "border-cq-keaney/40 bg-cq-keaneyIce/50 text-cq-navy hover:border-cq-keaney"
                          : "cursor-not-allowed border-cq-keaney/20 bg-cq-keaneyIce/30 text-ig-secondary"
                    }`}
                  >
                    <span className="text-lg leading-none" aria-hidden>
                      {n.emoji}
                    </span>
                    <span className="mt-1 block">{on ? "Unlocked" : n.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <Collapsible title="Daily training" emoji="🎮" defaultOpen>
            <p className="text-sm text-ig-secondary">
              One game per stat — <strong className="text-cq-navy">{trainingLeft}</strong> play
              {trainingLeft === 1 ? "" : "s"} left today (max {trainingMax}). Streak mult ×1.02 after full training days.
            </p>
            <p className="mt-2 text-xs text-ig-secondary">
              Second play today: +22 XP &quot;Daily training complete&quot;. Hit all five stats this week: +50 XP bonus
              once.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STAT_ROWS.map((row) => (
                <button
                  key={row.key}
                  type="button"
                  disabled={trainingLeft <= 0}
                  onClick={() => onTrainingPlay(row.key)}
                  className="rounded-full border border-cq-keaney/40 bg-cq-white px-3 py-1.5 text-xs font-bold text-cq-navy disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {row.emoji} {row.label}
                </button>
              ))}
            </div>
            {trainingLeft <= 0 ? (
              <p className="mt-3 text-xs font-medium text-ig-secondary">
                You used both training sessions today. Come back tomorrow for more XP.
              </p>
            ) : null}
          </Collapsible>

          <Collapsible title="Weekly recap" emoji="📅" defaultOpen={false}>
            <p className="text-sm text-ig-secondary">
              This week you logged <strong className="text-cq-navy">{state.activities.length}</strong> activities, earned{" "}
              <strong className="text-cq-navy">{profile.xp}</strong> total XP, and sit at level{" "}
              <strong className="text-cq-navy">{profile.level}</strong>. Check Battle for bosses and the Quad for posts.
            </p>
          </Collapsible>

          <Collapsible title="Recent activities" emoji="📋" defaultOpen>
            <ul className="space-y-2">
              {state.activities.slice(0, 8).map((a) => (
                <li
                  key={a.id}
                  className="rounded-lg border border-cq-keaney/20 bg-cq-keaneyIce/40 px-3 py-2 text-sm text-cq-navy"
                >
                  <span className="font-semibold">{a.title}</span>
                  <span className="text-ig-secondary"> · +{a.xpReward} XP · {a.loggedAt}</span>
                </li>
              ))}
            </ul>
            {state.activities.length === 0 ? (
              <p className="text-sm text-ig-secondary">Nothing logged yet — start on Battle.</p>
            ) : null}
          </Collapsible>
        </div>
      ) : (
        <div className="space-y-3 px-3 pt-3">
          <section className="rounded-xl border border-cq-keaney/25 bg-cq-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cq-keaneyBright to-cq-navy text-lg font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-cq-navy">{profile.name}</p>
                <p className="text-sm font-medium text-cq-keaney">@{displayHandle}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-cq-navy">Level progress</p>
              <p className="mt-1 text-sm tabular-nums text-ig-secondary">
                <span className="font-bold text-cq-navy">{profile.xp}</span> / {profile.xpToNext} XP
              </p>
              <div className="mt-2">
                <ProgressBar value={profile.xp} max={profile.xpToNext} tone="blue" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-cq-keaney/15 pt-4 text-center">
              <div>
                <p className="text-xl font-bold text-cq-navy">{postsCount}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-cq-keaney">Posts</p>
              </div>
              <div>
                <p className="text-xl font-bold text-cq-navy">{guildCount}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-cq-keaney">Friends</p>
              </div>
              <div>
                <p className="text-xl font-bold text-cq-navy">{followingCount}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-cq-keaney">Following</p>
              </div>
            </div>
          </section>

          <button
            type="button"
            className="w-full rounded-xl border border-cq-keaney/30 bg-cq-white py-3 text-sm font-bold text-cq-navy shadow-sm"
            onClick={() => setBioEditing((e) => !e)}
          >
            {bioEditing ? "Close bio editor" : "Edit bio"}
          </button>

          {bioEditing ? (
            <form className="space-y-3 rounded-xl border border-cq-keaney/25 bg-cq-white p-3 shadow-sm" onSubmit={handleSaveProfile}>
              <label className="block">
                <span className="text-xs font-semibold text-cq-navy">Display name</span>
                <input
                  className="mt-1 w-full rounded-lg border border-cq-keaney/40 bg-cq-keaneyIce/50 px-3 py-2 text-sm text-cq-navy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-cq-navy">@Handle</span>
                <input
                  className="mt-1 w-full rounded-lg border border-cq-keaney/40 bg-cq-keaneyIce/50 px-3 py-2 text-sm text-cq-navy"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace(/^@+/, ""))}
                  placeholder={slugHandle(name)}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-cq-navy">Class title</span>
                <input
                  className="mt-1 w-full rounded-lg border border-cq-keaney/40 bg-cq-keaneyIce/50 px-3 py-2 text-sm text-cq-navy"
                  value={avatarClass}
                  onChange={(e) => setAvatarClass(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-cq-navy">Bio</span>
                <textarea
                  className="mt-1 min-h-24 w-full rounded-lg border border-cq-keaney/40 bg-cq-keaneyIce/50 px-3 py-2 text-sm text-cq-navy"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-lg bg-cq-navy py-2.5 text-sm font-bold text-white"
              >
                Save profile
              </button>
              {saved ? <p className="text-center text-xs text-ig-secondary">Saved locally.</p> : null}
            </form>
          ) : null}

          <section className="rounded-xl border border-cq-keaney/25 bg-cq-white p-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">🎁 Loot Codex</p>
            <div className="mt-3 grid grid-cols-3 gap-1">
              {state.inventory.length === 0 ? (
                <p className="col-span-3 text-sm text-ig-secondary">No loot yet — clear quests and bosses.</p>
              ) : (
                state.inventory.map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square border border-cq-keaney/35 bg-cq-keaneyIce/50 p-2"
                  >
                    <p className="line-clamp-2 text-[11px] font-semibold text-cq-navy">{item.name}</p>
                    <div className="mt-1">
                      <RarityBadge rarity={item.rarity} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-xl border border-cq-keaney/25 bg-cq-white p-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">🎁 Equipment loadout</p>
            <p className="mt-1 text-xs text-ig-secondary">Equip unlocked loot for real XP & streak-save bonuses.</p>
            {(["hat", "glasses", "backpack"] as EquipmentSlot[]).map((slot) => (
              <div key={slot} className="mt-3">
                <p className="text-xs font-semibold capitalize text-cq-navy">{slot}</p>
                <button
                  type="button"
                  onClick={() => setEquipPicker(equipPicker === slot ? null : slot)}
                  className="mt-1 w-full rounded-lg border border-cq-keaney/35 bg-cq-keaneyIce/40 px-3 py-2 text-left text-sm text-cq-navy"
                >
                  {loadout[slot] ?? "None"}
                </button>
                {equipPicker === slot ? (
                  <div className="mt-2 max-h-32 space-y-1 overflow-y-auto rounded-lg border border-cq-keaney/25 p-2">
                    <button
                      type="button"
                      className="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-cq-keaneyIce"
                      onClick={() => setSlotItem(slot, null)}
                    >
                      None
                    </button>
                    {state.inventory.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="w-full rounded px-2 py-1.5 text-left text-xs hover:bg-cq-keaneyIce"
                        onClick={() => setSlotItem(slot, item.name)}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </section>

          <section className="rounded-xl border border-cq-keaney/25 bg-cq-white p-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">⚔️ Character stats</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ig-secondary">📊 Level</span>
                <span className="font-bold text-cq-navy">{profile.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ig-secondary">✨ Total XP</span>
                <span className="font-bold tabular-nums text-cq-navy">{profile.xp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ig-secondary">🐉 Bosses defeated</span>
                <span className="font-bold tabular-nums text-cq-navy">{bossesDefeatedStd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ig-secondary">👑 Final bosses</span>
                <span className="font-bold tabular-nums text-cq-navy">{finalBossesDefeated}</span>
              </div>
              {STAT_ROWS.map((row) => (
                <div key={row.key} className="flex justify-between">
                  <span className="text-ig-secondary">
                    {row.emoji} {row.label}
                  </span>
                  <span className="font-bold tabular-nums text-cq-navy">{profile.stats[row.key]}</span>
                </div>
              ))}
            </div>
          </section>

          <button
            type="button"
            onClick={logOut}
            className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-800"
          >
            Log out
          </button>

          <section className="rounded-xl border border-cq-keaney/25 bg-cq-white p-3 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">📜 Posts to the Quad</p>
            {userPosts.length === 0 ? (
              <p className="mt-3 text-sm text-ig-secondary">No posts yet. Share something on The Quad!</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {userPosts.map(({ post, feed }) => (
                  <li key={`${feed}-${post.id}`} className="rounded-lg border border-cq-keaney/20 px-3 py-2">
                    <p className="text-sm font-semibold text-cq-navy">{post.title}</p>
                    <p className="text-xs text-ig-secondary">
                      {feed === "friends" ? "Friends feed" : "For you"} · {post.timestamp}
                    </p>
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
