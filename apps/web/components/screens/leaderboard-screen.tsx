"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FRIENDS_SCREEN_GUILDS,
  sortFriendsGuildMembersForDisplay,
  sortGuildsByLevelDesc,
  type FriendsScreenGuild,
  type FriendsScreenGuildMember
} from "@/lib/friends-screen-guilds";
import {
  CAMPUS_LEADERBOARD_PLACEHOLDERS,
  filterLabel,
  LEADERBOARD_FILTERS,
  metricValue,
  sortByMetric,
  statsForFriend,
  type LeaderboardRankMetric,
  type LeaderboardStatsRow
} from "@/lib/leaderboard-display";

const FRIENDS_KEY = "campusquest-friends-v1";

/** Gold / silver / bronze glow for ranks 1–3 within each leaderboard list. */
function podiumGlowClasses(rank: number): string {
  if (rank === 1) {
    return "border-amber-400/80 bg-gradient-to-br from-amber-50/95 via-white to-amber-100/70 shadow-[0_0_28px_6px_rgba(234,179,8,0.42),0_0_12px_rgba(251,191,36,0.3)] ring-2 ring-amber-400/90 ring-offset-2 ring-offset-cq-keaneyIce";
  }
  if (rank === 2) {
    return "border-slate-300 bg-gradient-to-br from-slate-50/95 via-white to-slate-100/80 shadow-[0_0_24px_5px_rgba(148,163,184,0.5),0_0_10px_rgba(203,213,225,0.45)] ring-2 ring-slate-300 ring-offset-2 ring-offset-cq-keaneyIce";
  }
  if (rank === 3) {
    return "border-amber-800/45 bg-gradient-to-br from-orange-50/90 via-white to-amber-100/55 shadow-[0_0_22px_5px_rgba(180,83,9,0.38),0_0_8px_rgba(217,119,6,0.32)] ring-2 ring-amber-700/70 ring-offset-2 ring-offset-cq-keaneyIce";
  }
  return "border-cq-keaney/25 bg-cq-white/90 shadow-sm";
}

function podiumRankNumberClass(rank: number): string {
  if (rank === 1) return "text-amber-700";
  if (rank === 2) return "text-slate-600";
  if (rank === 3) return "text-amber-900";
  return "text-cq-keaney";
}

type FriendRow = { id: string; name: string; handle: string };

function loadFriends(): FriendRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FRIENDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FriendRow[];
  } catch {
    return [];
  }
}

function saveFriends(list: FriendRow[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FRIENDS_KEY, JSON.stringify(list));
}

function normalizeHandle(h: string): string {
  return h.trim().toLowerCase().replace(/^@/, "");
}

function friendToLeaderboardRow(f: FriendRow): LeaderboardStatsRow {
  const base = statsForFriend(f.id, f.name);
  return {
    id: f.id,
    name: f.name,
    handle: normalizeHandle(f.handle),
    ...base
  };
}

export function LeaderboardScreen() {
  const [rankMetric, setRankMetric] = useState<LeaderboardRankMetric>("level");
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [campusAdded, setCampusAdded] = useState<Set<string>>(new Set());
  const [openGuildMemberIds, setOpenGuildMemberIds] = useState<Set<string>>(new Set());

  const isGuildCampusMode = rankMetric === "guildLevel";

  const sortedGuilds = useMemo(() => sortGuildsByLevelDesc(FRIENDS_SCREEN_GUILDS), []);

  const refreshFriends = useCallback(() => {
    const list = loadFriends();
    setFriends(list);
    const campusIds = new Set(
      CAMPUS_LEADERBOARD_PLACEHOLDERS.filter((c) =>
        list.some(
          (f) =>
            f.id === c.id ||
            normalizeHandle(f.handle) === normalizeHandle(c.handle) ||
            f.name.toLowerCase() === c.name.toLowerCase()
        )
      ).map((c) => c.id)
    );
    setCampusAdded(campusIds);
  }, []);

  useEffect(() => {
    refreshFriends();
    window.addEventListener("focus", refreshFriends);
    return () => window.removeEventListener("focus", refreshFriends);
  }, [refreshFriends]);

  useEffect(() => {
    if (!isGuildCampusMode) setOpenGuildMemberIds(new Set());
  }, [isGuildCampusMode]);

  function toggleGuildMembers(guildId: string) {
    setOpenGuildMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(guildId)) next.delete(guildId);
      else next.add(guildId);
      return next;
    });
  }

  const friendRows = useMemo(() => {
    return sortByMetric(
      friends.map(friendToLeaderboardRow),
      rankMetric
    );
  }, [friends, rankMetric]);

  const campusRows = useMemo(
    () => sortByMetric(CAMPUS_LEADERBOARD_PLACEHOLDERS, rankMetric),
    [rankMetric]
  );

  function addCampusFriend(row: LeaderboardStatsRow) {
    const list = loadFriends();
    if (list.some((f) => normalizeHandle(f.handle) === normalizeHandle(row.handle))) return;
    const handle = row.handle.startsWith("@") ? row.handle : `@${row.handle}`;
    saveFriends([...list, { id: row.id, name: row.name, handle }]);
    setCampusAdded((prev) => new Set(prev).add(row.id));
    setFriends(loadFriends());
  }

  const metricLine = filterLabel(rankMetric);

  return (
    <div className="space-y-4 px-3 pb-4 pt-1">
      <div className="rounded-xl border border-cq-keaney/35 bg-gradient-to-br from-cq-keaneyIce to-cq-white px-3 py-3 shadow-sm">
        <div className="flex items-start gap-2">
          <span className="text-2xl" aria-hidden>
            🏆
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Leaderboard</p>
            <p className="text-lg font-bold text-cq-navy">Rank by</p>
            <p className="mt-1 text-sm text-ig-secondary">
              Filter leaderboards by stat or level.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-cq-keaney/30 bg-cq-white px-3 py-3 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wide text-cq-keaney">Sort</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {LEADERBOARD_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setRankMetric(f.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-left text-xs font-semibold transition ${
                rankMetric === f.id
                  ? "border-cq-keaney bg-cq-keaney text-white shadow-sm ring-2 ring-cq-keaney/30"
                  : "border-cq-keaney/35 bg-cq-keaneyIce/40 text-cq-navy hover:border-cq-keaney/55"
              }`}
            >
              <span aria-hidden>{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-xl border border-cq-keaney/35 bg-gradient-to-br from-cq-white to-cq-keaneyIce/30 p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            🦌
          </span>
          <div>
            <h2 className="text-sm font-bold text-cq-navy">Friends leaderboard</h2>
            <p className="text-xs text-ig-secondary">
              {isGuildCampusMode ? (
                <>
                  Guild standings are campus-wide. Pick <strong className="text-cq-navy">Level</strong> or another stat
                  to rank friends.
                </>
              ) : (
                <>
                  Ranked by {metricLine}. Only your accepted friends.
                </>
              )}
            </p>
          </div>
        </div>
        {isGuildCampusMode ? (
          <p className="mt-3 rounded-lg border border-cq-keaney/25 bg-cq-keaneyIce/50 px-3 py-3 text-sm leading-relaxed text-ig-secondary">
            Switch off <strong className="text-cq-navy">Guild level</strong> to see your friends sorted by stats. Open{" "}
            <strong className="text-cq-navy">Campus</strong> below for top guilds.
          </p>
        ) : friendRows.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-cq-keaney/40 bg-cq-keaneyIce/40 px-3 py-4 text-center text-sm text-ig-secondary">
            No friends yet. Add friends in Find Friends to see them here.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {friendRows.map((row, i) => (
              <LeaderboardRow
                key={row.id}
                rank={i + 1}
                row={row}
                rankMetric={rankMetric}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-cq-keaney/35 bg-gradient-to-br from-cq-white to-cq-keaneyIce/30 p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            🏛️
          </span>
          <div>
            <h2 className="text-sm font-bold text-cq-navy">
              {isGuildCampusMode ? "Campus guild leaderboard" : "Campus leaderboard"}
            </h2>
            <p className="text-xs text-ig-secondary">
              {isGuildCampusMode ? (
                <>Top guilds by guild level. Tap View members for full rosters.</>
              ) : (
                <>Top students by {metricLine}. (Placeholder data.)</>
              )}
            </p>
          </div>
        </div>
        {isGuildCampusMode ? (
          <ul className="mt-3 space-y-2">
            {sortedGuilds.map((guild, i) => (
              <GuildCampusRow
                key={guild.id}
                rank={i + 1}
                guild={guild}
                membersOpen={openGuildMemberIds.has(guild.id)}
                onToggleMembers={() => toggleGuildMembers(guild.id)}
              />
            ))}
          </ul>
        ) : (
          <ul className="mt-3 space-y-2">
            {campusRows.map((row, i) => (
              <li
                key={row.id}
                className={`rounded-xl border px-3 py-3 ${podiumGlowClasses(i + 1)}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-8 shrink-0 text-sm font-bold ${podiumRankNumberClass(i + 1)}`}
                  >
                    #{i + 1}
                  </span>
                  <div className="flex min-w-0 flex-1 items-start gap-2">
                    <span className="text-2xl leading-none" aria-hidden>
                      {row.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-cq-navy">{row.name}</p>
                      <p className="text-xs text-cq-keaney">@{row.handle}</p>
                      <MetricBlock row={row} rankMetric={rankMetric} />
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={campusAdded.has(row.id)}
                    onClick={() => addCampusFriend(row)}
                    className="shrink-0 rounded-lg bg-cq-navy px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-cq-navyLight disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {campusAdded.has(row.id) ? "Added" : "Add friend"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function GuildCampusRow({
  rank,
  guild,
  membersOpen,
  onToggleMembers
}: {
  rank: number;
  guild: FriendsScreenGuild;
  membersOpen: boolean;
  onToggleMembers: () => void;
}) {
  const sorted = sortFriendsGuildMembersForDisplay(guild.members);

  return (
    <li className={`rounded-xl border px-3 py-3 ${podiumGlowClasses(rank)}`}>
      <div className="flex items-start gap-3">
        <span className={`w-8 shrink-0 text-sm font-bold ${podiumRankNumberClass(rank)}`}>#{rank}</span>
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {guild.emoji ? (
            <span className="text-2xl leading-none" aria-hidden>
              {guild.emoji}
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-cq-navy">{guild.name}</p>
            <p className="text-xs font-semibold text-cq-keaney">{guild.category}</p>
            <div className="mt-1.5 text-sm">
              <p className="font-bold text-cq-navy">Guild Lv.{guild.level}</p>
              <p className="text-ig-secondary">
                {guild.members.length}/{guild.memberCap} members ·{" "}
                {guild.insight.guildTotalXp.toLocaleString()} guild XP
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-expanded={membersOpen}
          onClick={onToggleMembers}
          className="shrink-0 rounded-lg border border-cq-keaney/45 bg-cq-keaneyIce/50 px-2.5 py-1.5 text-[11px] font-bold text-cq-navy hover:bg-cq-keaneyIce"
        >
          {membersOpen ? "Hide members" : "View members"}
        </button>
      </div>
      {membersOpen ? (
        <div className="mt-3 border-t border-cq-keaney/20 pt-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-cq-keaney">All members</p>
          <ul className="mt-2 max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {sorted.map((mem) => (
              <li
                key={mem.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-cq-keaneyIce/40 px-2 py-1.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cq-keaneyBright to-cq-navy text-[10px] font-bold text-white">
                    {mem.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-cq-navy">{mem.name}</p>
                    {mem.handle ? (
                      <p className="truncate text-[10px] text-ig-secondary">@{mem.handle}</p>
                    ) : null}
                  </div>
                </div>
                <GuildMemberRoleBadge role={mem.role} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

function GuildMemberRoleBadge({ role }: { role: FriendsScreenGuildMember["role"] }) {
  if (role === "founder") {
    return (
      <span className="shrink-0 rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold uppercase text-amber-900">
        Founder
      </span>
    );
  }
  if (role === "cofounder") {
    return (
      <span className="shrink-0 rounded bg-cq-keaneySoft px-1 py-0.5 text-[9px] font-bold uppercase text-cq-navy">
        Co-founder
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded bg-cq-white px-1 py-0.5 text-[9px] font-semibold text-ig-secondary ring-1 ring-cq-keaney/20">
      Member
    </span>
  );
}

function LeaderboardRow({
  rank,
  row,
  rankMetric
}: {
  rank: number;
  row: LeaderboardStatsRow;
  rankMetric: LeaderboardRankMetric;
}) {
  return (
    <li className={`rounded-xl border px-3 py-3 ${podiumGlowClasses(rank)}`}>
      <div className="flex items-start gap-3">
        <span className={`w-8 shrink-0 text-sm font-bold ${podiumRankNumberClass(rank)}`}>#{rank}</span>
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <span className="text-2xl leading-none" aria-hidden>
            {row.emoji}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-cq-navy">{row.name}</p>
            <p className="text-xs text-cq-keaney">@{row.handle}</p>
            <MetricBlock row={row} rankMetric={rankMetric} />
          </div>
        </div>
      </div>
    </li>
  );
}

function MetricBlock({
  row,
  rankMetric
}: {
  row: LeaderboardStatsRow;
  rankMetric: LeaderboardRankMetric;
}) {
  const v = metricValue(row, rankMetric);
  const label = filterLabel(rankMetric);

  if (rankMetric === "level") {
    return (
      <div className="mt-1.5 text-sm">
        <p className="font-bold text-cq-navy">Lv.{row.level}</p>
        <p className="text-ig-secondary">{row.xp.toLocaleString()} XP</p>
      </div>
    );
  }

  return (
    <div className="mt-1.5 text-sm">
      <p className="font-bold text-cq-navy">
        {label} {v.toLocaleString()}
      </p>
      <p className="text-ig-secondary">
        Lv.{row.level} · {row.xp.toLocaleString()} XP
      </p>
    </div>
  );
}
