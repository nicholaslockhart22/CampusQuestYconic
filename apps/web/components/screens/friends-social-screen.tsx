"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  friendsGuildCategoryOrder,
  friendsGuildMatchesQuery,
  friendsGuildsByCategory,
  type FriendsGuildCategory,
  type FriendsScreenGuild,
  type FriendsScreenGuildMember
} from "@/lib/friends-screen-guilds";

const FRIENDS_KEY = "campusquest-friends-v1";

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

export function FriendsSocialScreen() {
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [suggestions, setSuggestions] = useState(SUGGESTIONS);
  const [friendSearch, setFriendSearch] = useState("");
  const [guildSearch, setGuildSearch] = useState("");
  const [expandedGuildId, setExpandedGuildId] = useState<string | null>(null);

  useEffect(() => {
    setFriends(loadFriends());
  }, []);

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

  function addFriend(row: FriendRow) {
    if (friends.some((f) => f.id === row.id)) {
      return;
    }
    const next = [...friends, row];
    setFriends(next);
    saveFriends(next);
    setSuggestions((s) => s.filter((x) => x.id !== row.id));
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
                <span className="text-xs font-semibold text-cq-keaney">Friends</span>
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
                      expanded={expandedGuildId === guild.id}
                      onToggleView={() =>
                        setExpandedGuildId((id) => (id === guild.id ? null : guild.id))
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function FriendsGuildCard({
  guild,
  expanded,
  onToggleView
}: {
  guild: FriendsScreenGuild;
  expanded: boolean;
  onToggleView: () => void;
}) {
  const memberLabel = `${guild.members.length}/${guild.memberCap} members`;

  return (
    <Card className="border-cq-keaney/40 bg-gradient-to-br from-cq-white to-cq-keaneyIce/30 shadow-sm">
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
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          className="rounded-lg border border-cq-keaney/50 bg-cq-white py-2 text-sm font-semibold text-cq-navy hover:bg-cq-keaneyIce"
          aria-expanded={expanded}
          onClick={onToggleView}
        >
          {expanded ? "Hide members" : "View Guild"}
        </button>
        <button
          type="button"
          className="rounded-lg bg-cq-navy py-2 text-sm font-bold text-white shadow-sm hover:bg-cq-navyLight"
        >
          Join
        </button>
        <button
          type="button"
          className="rounded-lg border border-cq-keaney/45 bg-cq-keaneyIce/50 py-2 text-sm font-semibold text-cq-navy hover:bg-cq-keaneyIce"
        >
          Request Invite
        </button>
      </div>

      {expanded ? (
        <div className="mt-3 rounded-xl border border-cq-keaney/25 bg-cq-white/80 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-cq-keaney">Members</p>
          <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
            {sortMembersForDisplay(guild.members).map((mem) => (
              <li
                key={mem.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-cq-keaneyIce/40 px-2 py-1.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cq-keaneyBright to-cq-navy text-xs font-bold text-white">
                    {mem.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-cq-navy">{mem.name}</p>
                    {mem.handle ? (
                      <p className="truncate text-[11px] text-ig-secondary">@{mem.handle}</p>
                    ) : null}
                  </div>
                </div>
                <RoleBadge role={mem.role} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}

function sortMembersForDisplay(members: FriendsScreenGuildMember[]): FriendsScreenGuildMember[] {
  const order = { founder: 0, cofounder: 1, member: 2 };
  return [...members].sort((a, b) => order[a.role] - order[b.role]);
}

function RoleBadge({ role }: { role: FriendsScreenGuildMember["role"] }) {
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
    <span className="shrink-0 rounded-md bg-cq-white px-1.5 py-0.5 text-[10px] font-semibold text-ig-secondary ring-1 ring-cq-keaney/20">
      Member
    </span>
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
