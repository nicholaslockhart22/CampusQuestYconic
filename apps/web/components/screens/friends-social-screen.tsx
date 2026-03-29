"use client";

import { useEffect, useState } from "react";
import { useGameState } from "@/components/providers/game-state-provider";
import { Card } from "@/components/ui/card";

const FRIENDS_KEY = "campusquest-friends-v1";

type FriendRow = { id: string; name: string; handle: string };

const SUGGESTIONS: FriendRow[] = [
  { id: "s1", name: "Sam Kingston", handle: "@sam.uri" },
  { id: "s2", name: "Riley Chen", handle: "@riley.uri" },
  { id: "s3", name: "Dev Moore", handle: "@devmoore.uri" },
  { id: "s4", name: "Casey Ruiz", handle: "@casey.uri" }
];

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
  const { state } = useGameState();
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [suggestions, setSuggestions] = useState(SUGGESTIONS);

  useEffect(() => {
    setFriends(loadFriends());
  }, []);

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

      <section>
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-cq-keaney">Your friends</h2>
        {friends.length === 0 ? (
          <p className="rounded-xl border border-dashed border-cq-keaney/50 bg-cq-keaneyIce/40 px-4 py-6 text-center text-sm text-ig-secondary">
            No friends added yet. Tap Add on someone below.
          </p>
        ) : (
          <ul className="space-y-2">
            {friends.map((f) => (
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
        <ul className="space-y-2">
          {suggestions.map((s) => (
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
      </section>

      <section>
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-cq-keaney">Guilds</h2>
        <div className="space-y-3">
          {state.guilds.map((guild) => (
            <Card key={guild.id} className="border-cq-keaney/40 bg-gradient-to-br from-cq-white to-cq-keaneyIce/30 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cq-keaney">Guild</p>
              <h3 className="mt-1 text-base font-bold text-cq-navy">{guild.name}</h3>
              <p className="mt-1 text-sm text-ig-secondary">{guild.focus}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-ig-secondary">
                <span>{guild.members} members</span>
                <span className="rounded-full bg-cq-keaneySoft px-2 py-0.5 font-bold text-cq-navy ring-1 ring-cq-keaney/40">
                  {guild.momentum}
                </span>
              </div>
              <button
                type="button"
                className="mt-3 w-full rounded-lg border border-cq-keaney/45 bg-cq-white py-2 text-sm font-semibold text-cq-navy hover:bg-cq-keaneyIce"
              >
                Join guild
              </button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
