"use client";

import { useEffect } from "react";
import type {
  FriendsScreenGuild,
  FriendsScreenGuildMember
} from "@/lib/friends-screen-guilds";

export function GuildInsightModal({
  guild,
  onClose
}: {
  guild: FriendsScreenGuild | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!guild) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [guild, onClose]);

  useEffect(() => {
    if (!guild) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [guild]);

  if (!guild) return null;

  const { insight } = guild;
  const denom = insight.guildXpToNext > 0 ? insight.guildXpToNext : 1;
  const pct = Math.min(100, Math.round((insight.guildXpIntoLevel / denom) * 100));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guild-insight-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-cq-navy/45 backdrop-blur-[2px]"
        aria-label="Close guild details"
        onClick={onClose}
      />
      <div
        className="relative flex max-h-[min(92vh,780px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-cq-keaney/35 bg-gradient-to-b from-cq-white to-cq-keaneyIce/40 shadow-2xl sm:max-h-[min(85vh,720px)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-cq-keaney/20 bg-cq-white/90 px-4 py-3 backdrop-blur-sm">
          <div className="flex min-w-0 items-start gap-2">
            {guild.emoji ? (
              <span className="text-2xl leading-none" aria-hidden>
                {guild.emoji}
              </span>
            ) : null}
            <div className="min-w-0">
              <h2 id="guild-insight-title" className="text-lg font-bold text-cq-navy">
                {guild.name}
              </h2>
              <p className="mt-0.5 text-sm font-semibold text-cq-keaney">
                {guild.category} · Lv.{guild.level}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg border border-cq-keaney/30 bg-cq-white px-2.5 py-1.5 text-xs font-bold text-cq-navy hover:bg-cq-keaneyIce"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <section className="rounded-xl border border-cq-keaney/25 bg-cq-white/80 p-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-cq-keaney">Guild XP</p>
            <p className="mt-2 text-sm font-bold text-cq-navy">
              {insight.guildXpIntoLevel} / {insight.guildXpToNext} to Lv.{insight.guildNextLevel}
            </p>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-cq-keaneyIce ring-1 ring-cq-keaney/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cq-keaney to-cq-navy transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-ig-secondary">
              <span className="font-semibold text-cq-navy">{insight.guildTotalXp} total XP</span>
              {" · "}
              {insight.xpPerLevel} XP per level. Members add guild XP when they earn activity XP and when they
              defeat bosses.
            </p>
          </section>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <StatBlock
              label="Bosses defeated"
              value={insight.bossesDefeated}
              hint="Across known members"
            />
            <StatBlock
              label="Final bosses"
              value={insight.finalBossesDefeated}
              hint="Across known members"
            />
          </div>

          <section className="mt-3 rounded-xl border border-cq-keaney/25 bg-cq-keaneyIce/50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-cq-keaney">Weekly goal</p>
            <p className="mt-1.5 text-sm font-semibold leading-snug text-cq-navy">{guild.questDescription}</p>
          </section>

          <section className="mt-3 rounded-xl border border-cq-keaney/25 bg-cq-white/90 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-cq-keaney">Founder</p>
            <p className="mt-1.5 text-sm font-semibold text-cq-navy">
              {insight.featuredFounderName}{" "}
              <span className="font-medium text-cq-keaney">@{insight.featuredFounderHandle}</span>
            </p>
          </section>

          <section className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-cq-keaney">Members</p>
            <ul className="mt-2 space-y-2">
              {sortMembersForDisplay(guild.members).map((mem) => (
                <li
                  key={mem.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-cq-keaney/15 bg-cq-white/80 px-2.5 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cq-keaneyBright to-cq-navy text-xs font-bold text-white">
                      {mem.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-cq-navy">{mem.name}</p>
                      {mem.handle ? (
                        <p className="truncate text-[11px] text-ig-secondary">@{mem.handle}</p>
                      ) : null}
                    </div>
                  </div>
                  <InsightRoleBadge role={mem.role} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-xl border border-cq-keaney/25 bg-cq-white/80 p-3 text-center shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-cq-keaney">{label}</p>
      <p className="mt-1 text-2xl font-bold text-cq-navy">{value}</p>
      <p className="mt-0.5 text-[10px] text-ig-secondary">{hint}</p>
    </div>
  );
}

function sortMembersForDisplay(members: FriendsScreenGuildMember[]): FriendsScreenGuildMember[] {
  const order = { founder: 0, cofounder: 1, member: 2 };
  return [...members].sort((a, b) => order[a.role] - order[b.role]);
}

function InsightRoleBadge({ role }: { role: FriendsScreenGuildMember["role"] }) {
  if (role === "founder") {
    return (
      <span className="shrink-0 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
        Founder
      </span>
    );
  }
  if (role === "cofounder") {
    return (
      <span className="shrink-0 rounded-md bg-cq-keaneySoft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cq-navy">
        Co-founder
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-md bg-cq-keaneyIce px-1.5 py-0.5 text-[10px] font-semibold text-ig-secondary ring-1 ring-cq-keaney/20">
      Member
    </span>
  );
}
