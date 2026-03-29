"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useGameState } from "@/components/providers/game-state-provider";
import { BossBattlePanel } from "@/components/dashboard/boss-battle-panel";
import { FRIENDS_GUILD_BY_ID } from "@/lib/friends-screen-guilds";
import type { BossWeakness } from "@/lib/types";

const GUILD_MEMBERSHIPS_KEY = "campusquest-guild-memberships-v1";
const MAX_RECRUITED_BOSSES = 4;
const MIN_BOSS_HP = 250;

const WEAKNESS_CHIPS: { value: BossWeakness; emoji: string; label: string }[] = [
  { value: "random", emoji: "🎲", label: "Random" },
  { value: "strength", emoji: "💪", label: "Strength" },
  { value: "stamina", emoji: "🏃", label: "Stamina" },
  { value: "knowledge", emoji: "📚", label: "Knowledge" },
  { value: "social", emoji: "👥", label: "Social" },
  { value: "focus", emoji: "🎯", label: "Focus" }
];

function readJoinedGuildIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUILD_MEMBERSHIPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function BattleHubScreen() {
  const { state, recruitBoss, deleteRecruitedBoss, setActiveRecruitedBoss } = useGameState();
  const [joinedGuildIds, setJoinedGuildIds] = useState<string[]>([]);
  const [recruitName, setRecruitName] = useState("");
  const [recruitHp, setRecruitHp] = useState("250");
  const [recruitWeakness, setRecruitWeakness] = useState<BossWeakness>("random");
  const [recruitExpanded, setRecruitExpanded] = useState(true);
  const [recruitError, setRecruitError] = useState("");

  useEffect(() => {
    function refresh() {
      setJoinedGuildIds(readJoinedGuildIds());
    }
    refresh();
    function onStorage(e: StorageEvent) {
      if (e.key === GUILD_MEMBERSHIPS_KEY) refresh();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const joinedGuildNames = useMemo(
    () =>
      joinedGuildIds
        .map((id) => FRIENDS_GUILD_BY_ID.get(id)?.name)
        .filter((n): n is string => Boolean(n)),
    [joinedGuildIds]
  );

  const campusRaidDamagePct = 0.1;
  const campusRaidHpLeft = 99.9;

  const recruited = state.recruitedBosses;
  const activeId = state.activeRecruitedBossId;
  const activeBoss = recruited.find((b) => b.id === activeId);
  const finalBosses = recruited.filter((b) => b.maxHp >= 500);

  function onRecruitSubmit(e: FormEvent) {
    e.preventDefault();
    setRecruitError("");
    const name = recruitName.trim();
    if (!name) {
      setRecruitError("Give your boss a name.");
      return;
    }
    if (recruited.length >= MAX_RECRUITED_BOSSES) {
      setRecruitError(`You can only have ${MAX_RECRUITED_BOSSES} bosses. Delete one to add another.`);
      return;
    }
    const hp = Number(recruitHp);
    if (!Number.isFinite(hp) || hp < MIN_BOSS_HP) {
      setRecruitError(`HP must be at least ${MIN_BOSS_HP}.`);
      return;
    }
    recruitBoss({
      name,
      maxHp: hp,
      weakness: recruitWeakness
    });
    setRecruitName("");
    setRecruitHp("250");
    setRecruitWeakness("random");
  }

  return (
    <div className="space-y-4 px-3 pb-4 pt-1">
      <div className="rounded-xl border border-cq-keaney/35 bg-gradient-to-br from-cq-keaneyIce to-cq-white px-3 py-3 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Battle hub</p>
        <p className="text-lg font-bold text-cq-navy">Boss battles & raids</p>
        <p className="mt-1 text-sm text-ig-secondary">
          Campus-wide raid, guild battle, and personal bosses reset weekly. Log activities from{" "}
          <strong className="text-cq-navy">Profile → Character</strong> to chip your active boss and push leaderboards.
        </p>
      </div>

      <section>
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-cq-keaney">Raids & bosses</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <BattleGridCard
            title="Campus raid"
            subtitle="Weekly shared boss — every log chips in. Resets Monday."
          >
            <p className="text-base font-bold text-cq-navy">Midterm Week: The Overload</p>
            <div className="mt-2 space-y-1 text-sm text-ig-secondary">
              <p>
                Raid damage{" "}
                <span className="font-semibold text-cq-navy">{campusRaidDamagePct}%</span>
              </p>
              <p>
                ~<span className="font-semibold text-cq-navy">{campusRaidHpLeft}%</span> HP left
              </p>
            </div>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-cq-keaney/80">Boss HP pool</p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-cq-keaneyIce ring-1 ring-cq-keaney/25">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cq-keaney to-cq-navy"
                style={{ width: `${Math.min(100, campusRaidHpLeft)}%` }}
              />
            </div>
            <div className="mt-4 border-t border-cq-keaney/20 pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-cq-keaney">Top contributors</p>
              <ol className="mt-2 space-y-2">
                <li className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-cq-navy">
                    <span className="text-ig-secondary">1.</span> erg
                  </span>
                  <span className="font-bold tabular-nums text-cq-keaney">552</span>
                </li>
              </ol>
            </div>
          </BattleGridCard>

          <BattleGridCard
            title="Guild battle"
            titleEmoji="🛡️"
            subtitle="Per-guild raid boss — your guild’s logs deal damage. Resets Monday."
          >
            {joinedGuildNames.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-cq-navy">No guild yet — join one to unlock guild battle.</p>
                <p className="mt-2 text-sm leading-relaxed text-ig-secondary">
                  Open <span className="font-semibold text-cq-navy">Friends</span> → Find Guilds. Your logs will chip
                  this boss down and fuel the weekly guild race.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-cq-navy">You’re in the guild raid this week.</p>
                <p className="mt-2 text-sm text-ig-secondary">
                  Raiding with:{" "}
                  <span className="font-medium text-cq-navy">{joinedGuildNames.join(", ")}</span>
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ig-secondary">
                  Every activity log from members deals damage to your guild’s boss. Resets Monday.
                </p>
              </>
            )}
          </BattleGridCard>

          <BattleGridCard
            title="Final bosses"
            titleEmoji="👑"
            subtitle="500+ HP · better loot odds"
          >
            {finalBosses.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-cq-navy">No final-tier boss yet.</p>
                <p className="mt-2 text-sm leading-relaxed text-ig-secondary">
                  Use <span className="font-semibold text-cq-navy">Recruit a boss</span> with{" "}
                  <span className="font-semibold text-cq-navy">500+ HP</span> to count here.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-cq-navy">
                  {finalBosses.length} final-tier {finalBosses.length === 1 ? "boss" : "bosses"}
                </p>
                <ul className="mt-2 space-y-2">
                  {finalBosses.map((b) => (
                    <li key={b.id} className="text-sm text-ig-secondary">
                      <span className="font-semibold text-cq-navy">{b.name}</span>
                      <span className="tabular-nums">
                        {" "}
                        · {b.hpRemaining}/{b.maxHp} HP
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </BattleGridCard>

          <BattleGridCard
            title="Your bosses"
            titleEmoji="🧟"
            subtitle="≤500 HP · Attack, then log activities"
          >
            {recruited.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-cq-navy">No bosses yet.</p>
                <p className="mt-2 text-sm leading-relaxed text-ig-secondary">
                  Use <span className="font-semibold text-cq-navy">Recruit a boss</span> below. You can have up to{" "}
                  {MAX_RECRUITED_BOSSES}. Only the <span className="font-semibold text-cq-navy">active</span> boss takes
                  damage when you log activities.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-cq-navy">
                  {recruited.length}/{MAX_RECRUITED_BOSSES} bosses recruited
                </p>
                {activeBoss ? (
                  <p className="mt-2 rounded-lg border border-cq-keaney/40 bg-cq-keaneyIce/60 px-2.5 py-2 text-xs leading-relaxed text-cq-navy">
                    <span className="font-bold uppercase tracking-wide text-cq-keaney">Active target</span>
                    <br />
                    <span className="text-sm font-bold">{activeBoss.name}</span>
                    <span className="text-ig-secondary"> — log damage applies here only.</span>
                  </p>
                ) : (
                  <p className="mt-2 text-xs font-semibold text-amber-800">
                    No active boss — tap Set active on one of your bosses below.
                  </p>
                )}
              </>
            )}
          </BattleGridCard>
        </div>
      </section>

      <section className="rounded-xl border border-cq-keaney/35 bg-cq-white px-3 py-3 shadow-sm">
        <button
          type="button"
          className="flex w-full items-start gap-2 text-left"
          onClick={() => setRecruitExpanded((v) => !v)}
          aria-expanded={recruitExpanded}
        >
          <span
            className={`mt-0.5 text-cq-keaney transition-transform duration-200 ${recruitExpanded ? "" : "-rotate-90"}`}
            aria-hidden
          >
            ▴
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-lg font-bold tracking-tight text-cq-navy">
              <span className="mr-1 text-uri-gold" aria-hidden>
                ✦
              </span>
              Recruit a boss
            </span>
            <span className="mt-1 block text-sm text-ig-secondary">
              {recruited.length} / {MAX_RECRUITED_BOSSES} slots · min {MIN_BOSS_HP} HP · 500+ HP for final tier
            </span>
          </span>
        </button>
        <p className="mt-2 border-t border-cq-keaney/15 pt-2 text-sm text-ig-secondary">
          Set one boss as <strong className="text-cq-navy">active</strong> so each log deals HP damage. Match the boss
          weakness for bonus damage.
        </p>
        {recruitExpanded ? (
          <form className="mt-3 space-y-3" onSubmit={onRecruitSubmit}>
            <label className="block">
              <span className="text-xs font-semibold text-cq-navy">Boss name</span>
              <input
                value={recruitName}
                onChange={(e) => setRecruitName(e.target.value)}
                placeholder="e.g. MTH 215 Midterm"
                maxLength={80}
                className="mt-1 w-full rounded-xl border border-cq-keaney/40 bg-cq-keaneyIce/40 px-3 py-2 text-sm text-cq-navy placeholder:text-ig-secondary/70 focus:border-cq-keaney focus:outline-none focus:ring-2 focus:ring-cq-keaney/30"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-cq-navy">HP</span>
              <input
                type="number"
                min={MIN_BOSS_HP}
                max={99999}
                value={recruitHp}
                onChange={(e) => setRecruitHp(e.target.value)}
                className="mt-1 w-full rounded-xl border border-cq-keaney/40 bg-cq-keaneyIce/40 px-3 py-2 text-sm tabular-nums text-cq-navy focus:border-cq-keaney focus:outline-none focus:ring-2 focus:ring-cq-keaney/30"
              />
            </label>
            <div>
              <p className="text-xs font-semibold text-cq-navy">
                Weakness — bonus damage when the activity matches
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {WEAKNESS_CHIPS.map((chip) => {
                  const on = recruitWeakness === chip.value;
                  return (
                    <button
                      key={chip.value}
                      type="button"
                      onClick={() => setRecruitWeakness(chip.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        on
                          ? "border-cq-keaney bg-cq-keaney text-white shadow-sm"
                          : "border-cq-keaney/35 bg-cq-keaneyIce/50 text-cq-navy hover:border-cq-keaney/60"
                      }`}
                    >
                      <span aria-hidden>{chip.emoji}</span> {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {recruitError ? <p className="text-sm font-medium text-red-600">{recruitError}</p> : null}
            <button
              type="submit"
              disabled={recruited.length >= MAX_RECRUITED_BOSSES}
              className="w-full rounded-xl bg-cq-navy py-2.5 text-sm font-bold text-white shadow-sm hover:bg-cq-navyLight disabled:cursor-not-allowed disabled:opacity-45"
            >
              {recruited.length >= MAX_RECRUITED_BOSSES
                ? `Roster full (${MAX_RECRUITED_BOSSES}/${MAX_RECRUITED_BOSSES})`
                : "Add boss"}
            </button>
          </form>
        ) : null}
      </section>

      <section>
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-cq-keaney">Your bosses</h2>
        {recruited.length === 0 ? (
          <p className="rounded-xl border border-dashed border-cq-keaney/50 bg-cq-keaneyIce/40 px-4 py-6 text-center text-sm text-ig-secondary">
            Recruit a boss above to track HP, weaknesses, and loot previews here.
          </p>
        ) : (
          <div className="space-y-4">
            {recruited.map((boss) => {
              const isActive = boss.id === activeId;
              return (
                <div key={boss.id} className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 px-1">
                    {isActive ? (
                      <span className="rounded-full bg-cq-keaney px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Active — takes damage from logs
                      </span>
                    ) : (
                      <span className="rounded-full bg-cq-keaneyIce px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ig-secondary ring-1 ring-cq-keaney/25">
                        Inactive
                      </span>
                    )}
                  </div>
                  <BossBattlePanel boss={boss} />
                  <div className="flex flex-wrap gap-2">
                    {!isActive ? (
                      <button
                        type="button"
                        className="rounded-lg bg-cq-navy px-3 py-2 text-xs font-bold text-white hover:bg-cq-navyLight"
                        onClick={() => setActiveRecruitedBoss(boss.id)}
                      >
                        Set active
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="rounded-lg border border-cq-keaney/45 bg-cq-white px-3 py-2 text-xs font-semibold text-cq-navy hover:bg-cq-keaneyIce"
                        onClick={() => setActiveRecruitedBoss(null)}
                      >
                        Clear active
                      </button>
                    )}
                    <button
                      type="button"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800 hover:bg-red-100"
                      onClick={() => deleteRecruitedBoss(boss.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function BattleGridCard({
  title,
  titleEmoji,
  subtitle,
  children
}: {
  title: string;
  titleEmoji?: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[11rem] flex-col rounded-xl border border-cq-keaney/35 bg-gradient-to-br from-cq-white to-cq-keaneyIce/40 p-3 shadow-sm">
      <div className="flex items-start gap-2">
        {titleEmoji ? (
          <span className="text-xl leading-none" aria-hidden>
            {titleEmoji}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">{title}</p>
          <p className="mt-1 text-[11px] leading-snug text-ig-secondary">{subtitle}</p>
        </div>
      </div>
      <div className="mt-3 flex-1">{children}</div>
    </div>
  );
}
