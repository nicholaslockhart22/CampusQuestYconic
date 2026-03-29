"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/quad", label: "Quad", Icon: QuadIcon },
  { href: "/friends", label: "Friends", Icon: FriendsIcon },
  { href: "/battle", label: "Battle", Icon: BattleIcon },
  { href: "/leaderboard", label: "Leaderboard", Icon: LeaderboardIcon },
  { href: "/profile", label: "Profile", Icon: ProfileIcon }
] as const;

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-cq-keaney/30 bg-cq-navy pb-[env(safe-area-inset-bottom,0)] shadow-[0_-12px_40px_rgba(0,0,0,0.25)]"
      aria-label="Main"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around pt-1">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href || (href === "/quad" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 text-[8px] font-semibold leading-tight transition sm:text-[10px] ${
                active ? "text-white drop-shadow-[0_0_10px_rgba(159,212,244,0.65)]" : "text-cq-keaney/70 hover:text-cq-keaneyBright"
              }`}
            >
              <Icon active={active} />
              <span className="max-w-full text-center leading-[1.1]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function QuadIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
    </svg>
  );
}

function FriendsIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zM8 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
      />
      <path
        d="M4 20v-1a4 4 0 0 1 4-4h2m10 5v-1a4 4 0 0 0-4-4h-2"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}

function BattleIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l2.4 7.3H22l-6 4.6 2.3 7.1L12 17.8 5.7 22l2.3-7.1-6-4.6h7.6L12 3z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LeaderboardIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 21V10.5L4 12V21H8Z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M16 21V5L12 6.5V21H16Z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
      <path
        d="M20 21V14L18 14.7V21H20Z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.12 : 0}
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="9"
        r="3.5"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
      <path
        d="M6 19v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}
