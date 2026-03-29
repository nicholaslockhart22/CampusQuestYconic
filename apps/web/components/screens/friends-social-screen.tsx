"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { GuildInsightModal } from "@/components/screens/guild-insight-modal";
import {
  FRIENDS_GUILD_BY_ID,
  friendsGuildCategoryOrder,
  friendsGuildMatchesQuery,
  friendsGuildsByCategory,
  type FriendsGuildCategory,
  type FriendsScreenGuild
} from "@/lib/friends-screen-guilds";

const FRIENDS_KEY = "campusquest-friends-v1";
const GUILD_MEMBERSHIPS_KEY = "campusquest-guild-memberships-v1";
const MAX_GUILD_MEMBERSHIPS = 3;

type FriendRow = { id: string; name: string; handle: string };

const SUGGESTIONS: FriendRow[] = [
  { id: "s1", name: "Sam Kingston", handle: "@sam.uri" },
  { id: "s2", name: "Riley Chen", handle: "@riley.uri" },
  { id: "s3", name: "Dev Moore", handle: "@devmoore.uri" },
  { id: "s4", name: "Casey Ruiz", handle: "@casey.uri" },
  { id: "s5", name: "Jordan Kim", handle: "@jordan_kim" },
  { id: "s6", name: "Alex Rivera", handle: "@alex_rivera" },
  { id: "s7", name: "Mia Rhody", handle: "@mia_rhody" },
  { id: "s8", name: "Emma Hall", handle: "@emma_hall" },
  { id: "s9", name: "Noah Kingston", handle: "@noah_k" }
];

function friendMatchesQuery(row: FriendRow, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const handle = row.handle.toLowerCase().replace(/^@/, "");
  return row.name.toLowerCase().includes(q) || handle.includes(q) || row.handle.toLowerCase().includes(q);
}

function loadFriends(): FriendRow[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(FRIENDS_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw) as FriendRow[];
  } catch {
    return [];
  }
}

function saveFriends(list: FriendRow[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(FRIENDS_KEY, JSON.stringify(list));
}

function loadGuildMemberships(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(GUILD_MEMBERSHIPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const ids = parsed.filter((id): id is string => typeof id === "string");
    const valid = ids.filter((id) => FRIENDS_GUILD_BY_ID.has(id));
    return valid.slice(0, MAX_GUILD_MEMBERSHIPS);
  } catch {
    return [];
  }
}

function saveGuildMemberships(ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(GUILD_MEMBERSHIPS_KEY, JSON.stringify(ids));
}

export function FriendsSocialScreen() {
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [suggestions, setSuggestions] = useState(SUGGESTIONS);
  const [friendSearch, setFriendSearch] = useState("");
  const [guildSearch, setGuildSearch] = useState("");
  const [guildDetailId, setGuildDetailId] = useState<string | null>(null);
  const [joinedGuildIds, setJoinedGuildIds] = useState<string[]>([]);
  const [guildToast, setGuildToast] = useState<string | null>(null);

  useEffect(() => {
    setFriends(loadFriends());
    const guildIds = loadGuildMemberships();
    setJoinedGuildIds(guildIds);
    saveGuildMemberships(guildIds);
  }, []);

  useEffect(() => {
    if (!guildToast) return;
    const t = window.setTimeout(() => setGuildToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [guildToast]);

  function showGuildToast(message: string) {
    setGuildToast(message);
  }

  function joinGuild(guildId: string) {
    if (joinedGuildIds.includes(guildId)) return;
    if (joinedGuildIds.length >= MAX_GUILD_MEMBERSHIPS) {
      showGuildToast("You're in 3 guilds. Leave one to join another.");
      return;
    }
    const next = [...joinedGuildIds, guildId];
    setJoinedGuildIds(next);
    saveGuildMemberships(next);
    showGuildToast("You're in this guild now.");
  }

  function leaveGuild(guildId: string) {
    if (!joinedGuildIds.includes(guildId)) return;
    const next = joinedGuildIds.filter((id) => id !== guildId);
    setJoinedGuildIds(next);
    saveGuildMemberships(next);
    showGuildToast("You left the guild.");
  }

  const filteredFriends = useMemo(
    () => friends.filter((f) => friendMatchesQuery(f, friendSearch)),
    [friends, friendSearch]
  );
  const filteredSuggestions = useMemo(
    () => suggestions.filter((s) => friendMatchesQuery(s, friendSearch)),
    [suggestions, friendSearch]
  );
  const guildsByCategory = useMemo(() => friendsGuildsByCategory(), []);
  const categoryOrder = useMemo(() => friendsGuildCategoryOrder(), []);

  const filteredGuildsByCategory = useMemo(() => {
    const q = guildSearch.trim();
    const next: Record<FriendsGuildCategory, FriendsScreenGuild[]> = {
      Study: [],
      Fitness: [],
      Networking: [],
      Clubs: []
    };
    for (const cat of categoryOrder) {
      next[cat] = guildsByCategory[cat].filter((g) => friendsGuildMatchesQuery(g, q));
    }
    return next;
  }, [guildsByCategory, categoryOrder, guildSearch]);

  const anyGuildsVisible = useMemo(
    () => categoryOrder.some((c) => filteredGuildsByCategory[c].length > 0),
    [categoryOrder, filteredGuildsByCategory]
  );

  const guildDetail = useMemo(
    () => (guildDetailId ? FRIENDS_GUILD_BY_ID.get(guildDetailId) ?? null : null),
    [guildDetailId]
  );

  function addFriend(row: FriendRow) {
    if (friends.some((f) => f.id === row.id)) {
      return;
    }
    const next = [...friends, row];
    setFriends(next);
    saveFriends(next);
    setSuggestions((s) => s.filter((x) => x.id !== row.id));
  }

  function removeFriend(row: FriendRow) {
    const next = friends.filter((f) => f.id !== row.id);
    setFriends(next);
    saveFriends(next);
    const preset = SUGGESTIONS.find((s) => s.id === row.id);
    if (preset) {
      setSuggestions((s) => {
        if (s.some((x) => x.id === preset.id)) return s;
        return [...s, preset].sort((a, b) => a.name.localeCompare(b.name));
      });
    }
  }

  return (
    <div className="space-y-4 px-3 pb-4 pt-1">
      <div className="rounded-xl border border-cq-keaney/35 bg-gradient-to-br from-cq-keaneyIce to-cq-white px-3 py-3 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Friends</p>
        <p className="text-lg font-bold text-cq-navy">Squad up</p>
        <p className="mt-1 text-sm text-ig-secondary">Add classmates, then join a guild for accountability quests.</p>
      </div>

      <section className="rounded-xl border border-cq-keaney/30 bg-cq-white px-3 py-3 shadow-sm">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Find friends</span>
          <div className="relative mt-2">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ig-secondary" />
            <input
              type="search"
              value={friendSearch}
              onChange={(e) => setFriendSearch(e.target.value)}
              placeholder="Search by name or @handle"
              className="w-full rounded-xl border border-cq-keaney/40 bg-cq-keaneyIce/40 py-2.5 pl-10 pr-3 text-sm text-cq-navy placeholder:text-ig-secondary/70 focus:border-cq-keaney focus:outline-none focus:ring-2 focus:ring-cq-keaney/30"
              autoComplete="off"
              enterKeyHint="search"
            />
          </div>
        </label>
      </section>

      <section>
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-cq-keaney">Your friends</h2>
        {friends.length === 0 ? (
          <p className="rounded-xl border border-dashed border-cq-keaney/50 bg-cq-keaneyIce/40 px-4 py-6 text-center text-sm text-ig-secondary">
            No friends added yet. Tap Add on someone below.
          </p>
        ) : filteredFriends.length === 0 ? (
          <p className="rounded-xl border border-dashed border-cq-keaney/50 bg-cq-keaneyIce/40 px-4 py-6 text-center text-sm text-ig-secondary">
            No friends match &ldquo;{friendSearch.trim()}&rdquo;.
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredFriends.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between rounded-xl border border-cq-keaney/35 bg-cq-white px-3 py-2.5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cq-keaneyBright to-cq-navy text-sm font-bold text-white shadow-sm">
                    {f.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-cq-navy">{f.name}</p>
                    <p className="text-xs text-ig-secondary">{f.handle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-lg border border-cq-keaney/40 bg-cq-white px-3 py-1.5 text-xs font-bold text-cq-navy hover:bg-red-50 hover:border-red-200 hover:text-red-800"
                  aria-label={`Remove ${f.name} from friends`}
                  onClick={() => removeFriend(f)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-cq-keaney">Suggested for you</h2>
        {filteredSuggestions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-cq-keaney/50 bg-cq-keaneyIce/40 px-4 py-6 text-center text-sm text-ig-secondary">
            {suggestions.length === 0
              ? "You've added everyone we suggested."
              : `No suggestions match "${friendSearch.trim()}".`}
          </p>
        ) : (
        <ul className="space-y-2">
          {filteredSuggestions.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-cq-keaney/35 bg-cq-white px-3 py-2.5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cq-keaneySoft text-sm font-bold text-cq-navy">
                  {s.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-cq-navy">{s.name}</p>
                  <p className="text-xs text-ig-secondary">{s.handle}</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg bg-cq-navy px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-cq-navyLight"
                onClick={() => addFriend(s)}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-cq-keaney">Guilds</h2>
        <p className="mb-2 px-1 text-xs text-ig-secondary">
          Join up to {MAX_GUILD_MEMBERSHIPS} guilds. You can leave anytime to free a slot.
        </p>
        <div className="mb-3 rounded-xl border border-cq-keaney/35 bg-cq-keaneyIce/50 px-3 py-2 shadow-sm">
          <p className="text-xs font-bold text-cq-navy">
            Your guilds: {joinedGuildIds.length}/{MAX_GUILD_MEMBERSHIPS}
          </p>
          {joinedGuildIds.length > 0 ? (
            <ul className="mt-1.5 space-y-0.5 text-[11px] text-ig-secondary">
              {joinedGuildIds.map((id) => {
                const g = FRIENDS_GUILD_BY_ID.get(id);
                return <li key={id}>{g ? g.name : id}</li>;
              })}
            </ul>
          ) : (
            <p className="mt-1 text-[11px] text-ig-secondary">None yet — tap Join on a guild below.</p>
          )}
        </div>
        {guildToast ? (
          <p
            className="mb-2 rounded-lg border border-cq-keaney/40 bg-cq-white px-3 py-2 text-xs font-semibold text-cq-navy shadow-sm"
            role="status"
            aria-live="polite"
          >
            {guildToast}
          </p>
        ) : null}
        <label className="mb-3 block rounded-xl border border-cq-keaney/30 bg-cq-white px-3 py-3 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Find guilds</span>
          <div className="relative mt-2">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ig-secondary" />
            <input
              type="search"
              value={guildSearch}
              onChange={(e) => setGuildSearch(e.target.value)}
              placeholder="Search guilds, quests, or members"
              className="w-full rounded-xl border border-cq-keaney/40 bg-cq-keaneyIce/40 py-2.5 pl-10 pr-3 text-sm text-cq-navy placeholder:text-ig-secondary/70 focus:border-cq-keaney focus:outline-none focus:ring-2 focus:ring-cq-keaney/30"
              autoComplete="off"
              enterKeyHint="search"
            />
          </div>
        </label>
        <div className="space-y-6">
          {!anyGuildsVisible ? (
            <p className="rounded-xl border border-dashed border-cq-keaney/50 bg-cq-keaneyIce/40 px-4 py-6 text-center text-sm text-ig-secondary">
              No guilds match &ldquo;{guildSearch.trim()}&rdquo;.
            </p>
          ) : null}
          {categoryOrder.map((category) => {
            const list = filteredGuildsByCategory[category];
            if (list.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-cq-keaney/90">
                  {category}
                </h3>
                <div className="space-y-3">
                  {list.map((guild) => (
                    <FriendsGuildCard
                      key={guild.id}
                      guild={guild}
                      isJoined={joinedGuildIds.includes(guild.id)}
                      joinDisabled={
                        !joinedGuildIds.includes(guild.id) &&
                        joinedGuildIds.length >= MAX_GUILD_MEMBERSHIPS
                      }
                      onViewGuild={() => setGuildDetailId(guild.id)}
                      onJoin={() => joinGuild(guild.id)}
                      onLeave={() => leaveGuild(guild.id)}
                      onRequestInvite={() =>
                        joinedGuildIds.length >= MAX_GUILD_MEMBERSHIPS
                          ? showGuildToast("You're in 3 guilds. Leave one to request invites elsewhere.")
                          : showGuildToast("Invite request sent to guild leaders (preview).")
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <GuildInsightModal guild={guildDetail} onClose={() => setGuildDetailId(null)} />
    </div>
  );
}

function FriendsGuildCard({
  guild,
  isJoined,
  joinDisabled,
  onViewGuild,
  onJoin,
  onLeave,
  onRequestInvite
}: {
  guild: FriendsScreenGuild;
  isJoined: boolean;
  joinDisabled: boolean;
  onViewGuild: () => void;
  onJoin: () => void;
  onLeave: () => void;
  onRequestInvite: () => void;
}) {
  const memberLabel = `${guild.members.length}/${guild.memberCap} members`;

  return (
    <Card
      className={`border-cq-keaney/40 bg-gradient-to-br from-cq-white to-cq-keaneyIce/30 shadow-sm ${
        isJoined ? "ring-2 ring-cq-keaney/60" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        {guild.emoji ? (
          <span className="text-2xl leading-none" aria-hidden>
            {guild.emoji}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cq-keaney">Guild</p>
          <h3 className="mt-0.5 text-base font-bold text-cq-navy">{guild.name}</h3>
          <p className="mt-1 text-xs font-semibold text-cq-keaney">{guild.category}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ig-secondary">
            <span className="rounded-full bg-cq-navy/10 px-2 py-0.5 font-bold text-cq-navy">
              Lv.{guild.level}
            </span>
            <span className="font-medium text-cq-navy/80">{memberLabel}</span>
          </div>
          <p className="mt-2 text-sm leading-snug text-ig-secondary">{guild.questDescription}</p>
          {isJoined ? (
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-cq-keaney">You&apos;re in this guild</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          className="rounded-lg border border-cq-keaney/50 bg-cq-white py-2 text-sm font-semibold text-cq-navy hover:bg-cq-keaneyIce"
          onClick={onViewGuild}
        >
          View Guild
        </button>
        {isJoined ? (
          <button
            type="button"
            className="rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-bold text-red-800 shadow-sm hover:bg-red-100"
            onClick={onLeave}
          >
            Leave
          </button>
        ) : (
          <button
            type="button"
            disabled={joinDisabled}
            title={
              joinDisabled
                ? `You can only join ${MAX_GUILD_MEMBERSHIPS} guilds at a time`
                : undefined
            }
            className="rounded-lg bg-cq-navy py-2 text-sm font-bold text-white shadow-sm hover:bg-cq-navyLight disabled:cursor-not-allowed disabled:opacity-45"
            onClick={onJoin}
          >
            Join
          </button>
        )}
        <button
          type="button"
          disabled={isJoined}
          className="rounded-lg border border-cq-keaney/45 bg-cq-keaneyIce/50 py-2 text-sm font-semibold text-cq-navy hover:bg-cq-keaneyIce disabled:cursor-not-allowed disabled:opacity-40"
          onClick={onRequestInvite}
        >
          Request Invite
        </button>
      </div>
    </Card>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
