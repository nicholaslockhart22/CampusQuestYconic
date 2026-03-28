"use client";

import { useGameState } from "@/components/providers/game-state-provider";
import { AppShell } from "@/components/ui/app-shell";
import { Card } from "@/components/ui/card";

export function GuildsScreen() {
  const { state } = useGameState();

  return (
    <AppShell
      title="Guilds & accountability squads"
      subtitle="Join a guild that matches your build. Guilds amplify streaks, quest clears, and campus visibility."
    >
      <Card className="overflow-hidden bg-gradient-to-br from-uri-navy via-[#17386e] to-[#234a83] text-white">
        <p className="text-xs uppercase tracking-[0.24em] text-white/70">Your character</p>
        <h2 className="mt-2 text-2xl font-semibold">{state.profile.name}</h2>
        <p className="mt-1 text-uri-ember">{state.profile.avatarClass}</p>
        <p className="mt-4 text-sm text-white/78">
          Strongest stats right now: lean into guilds that double down on what you already lead with—then use a second guild slot (coming soon) to shore up weaknesses.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.guilds.map((guild) => (
          <Card key={guild.id}>
            <p className="text-xs uppercase tracking-[0.2em] text-uri-navy/52">Guild</p>
            <h3 className="mt-2 text-xl font-semibold text-uri-ink">{guild.name}</h3>
            <p className="mt-2 text-sm text-uri-navy/70">{guild.focus}</p>
            <div className="mt-4 flex items-center justify-between text-sm text-uri-navy/66">
              <span>{guild.members} members</span>
              <span className="rounded-full bg-uri-sky px-3 py-1 text-xs font-semibold text-uri-navy">{guild.momentum}</span>
            </div>
            <button
              type="button"
              className="mt-4 w-full rounded-full border border-uri-navy/16 bg-white px-4 py-2 text-sm font-semibold text-uri-navy transition hover:border-uri-navy/32"
            >
              Request invite (prototype)
            </button>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
