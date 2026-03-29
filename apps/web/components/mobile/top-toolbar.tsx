"use client";

import { useEffect, useRef, useState } from "react";
import { useGameState } from "@/components/providers/game-state-provider";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { NotificationItem, Quest } from "@/lib/types";

type MenuKey = "daily" | "special" | "inbox" | null;

export function TopToolbar() {
  const { state, claimQuestReward, markNotificationRead } = useGameState();
  const [open, setOpen] = useState<MenuKey>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(null);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const dailyQuests = state.quests.filter((q) => q.frequency === "daily");
  const specialQuests = state.quests.filter(
    (q) => q.frequency === "weekly" || q.frequency === "special"
  );
  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-cq-keaney/25 bg-cq-navy/95 pt-[env(safe-area-inset-top,0)] shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-md">
      <div ref={ref} className="relative mx-auto max-w-lg">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-white">CampusQuest</h1>
            <p className="truncate text-[11px] font-medium text-cq-keaneyBright">University of Rhode Island</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <MenuButton
              label="Daily"
              isOpen={open === "daily"}
              onClick={() => setOpen((k) => (k === "daily" ? null : "daily"))}
            />
            <MenuButton
              label="Events"
              isOpen={open === "special"}
              onClick={() => setOpen((k) => (k === "special" ? null : "special"))}
            />
            <MenuButton
              label="Inbox"
              badge={unreadCount}
              isOpen={open === "inbox"}
              onClick={() => setOpen((k) => (k === "inbox" ? null : "inbox"))}
            />
          </div>
        </div>

        {open === "daily" ? (
          <DropdownPanel title="Daily quests" onClose={() => setOpen(null)}>
            <QuestList quests={dailyQuests} onClaim={claimQuestReward} />
          </DropdownPanel>
        ) : null}
        {open === "special" ? (
          <DropdownPanel title="Special & campus events" onClose={() => setOpen(null)}>
            <p className="mb-3 text-xs leading-relaxed text-ig-secondary">
              Weekly arcs, URI-only quests, and limited campus event lines.
            </p>
            <QuestList quests={specialQuests} onClaim={claimQuestReward} />
          </DropdownPanel>
        ) : null}
        {open === "inbox" ? (
          <DropdownPanel title="Inbox" onClose={() => setOpen(null)}>
            <InboxList items={state.notifications} onRead={markNotificationRead} />
          </DropdownPanel>
        ) : null}
      </div>
    </header>
  );
}

function MenuButton({
  label,
  isOpen,
  badge,
  onClick
}: {
  label: string;
  isOpen: boolean;
  badge?: number;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      className={`relative rounded-full px-2.5 py-1.5 text-xs font-semibold transition ${
        isOpen
          ? "bg-cq-keaney text-cq-navy shadow-cq-glow"
          : "bg-cq-navyLight/80 text-cq-keaneyBright hover:bg-cq-navyLight"
      }`}
    >
      {label}
      {badge && badge > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}

function DropdownPanel({
  title,
  children,
  onClose
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="absolute left-0 right-0 top-full max-h-[min(70vh,520px)] overflow-y-auto border-b border-cq-keaney/35 bg-cq-white shadow-[0_24px_48px_rgba(11,31,65,0.18)]">
      <div className="mx-auto max-w-lg px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-cq-navy">{title}</h2>
          <button type="button" className="text-xs font-semibold text-cq-keaney hover:text-cq-navy" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function QuestList({ quests, onClaim }: { quests: Quest[]; onClaim: (id: string) => void }) {
  if (quests.length === 0) {
    return <p className="text-sm text-ig-secondary">No quests in this list yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {quests.map((quest) => {
        const ready = quest.progress >= quest.goal && !quest.rewardClaimed;
        return (
          <li key={quest.id} className="rounded-xl border border-cq-keaney/40 bg-cq-keaneyIce p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-ig-secondary">{quest.frequency}</p>
                <p className="font-semibold text-cq-navy">{quest.title}</p>
                <p className="mt-1 text-xs text-ig-secondary">{quest.description}</p>
              </div>
              <span className="shrink-0 rounded-full bg-cq-keaneySoft px-2 py-0.5 text-[10px] font-bold text-cq-navy ring-1 ring-cq-keaney/50">
                {quest.tag}
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar value={quest.progress} max={quest.goal} tone="blue" />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-ig-secondary">
                {quest.progress}/{quest.goal} · +{quest.xpReward} XP
                {quest.rewardClaimed ? " · claimed" : ""}
              </span>
              {ready ? (
                <button
                  type="button"
                  className="rounded-full bg-cq-navy px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-cq-navyLight"
                  onClick={() => onClaim(quest.id)}
                >
                  Claim
                </button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function InboxList({
  items,
  onRead
}: {
  items: NotificationItem[];
  onRead: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-ig-secondary">You&apos;re all caught up.</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
              item.read ? "border-ig-border bg-cq-white" : "border-cq-keaney bg-cq-keaneyIce"
            }`}
            onClick={() => onRead(item.id)}
          >
            <p className="text-sm font-semibold text-cq-navy">{item.title}</p>
            <p className="mt-0.5 text-xs text-ig-secondary">{item.body}</p>
            <p className="mt-1 text-[10px] text-ig-secondary">{item.createdAt}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
