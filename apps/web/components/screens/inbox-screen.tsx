"use client";

import { useMemo, useState } from "react";
import { useGameState } from "@/components/providers/game-state-provider";
import { sortInboxByStarredAndRecency } from "@/lib/inbox-sort";
import type { DirectMessageThread, NotificationItem } from "@/lib/types";

type InboxTab = "notifications" | "messages";

export function InboxScreen() {
  const {
    state,
    markNotificationRead,
    markDirectMessageRead,
    toggleNotificationStar,
    toggleDirectMessageStar
  } = useGameState();
  const [tab, setTab] = useState<InboxTab>("notifications");

  const sortedNotifications = useMemo(
    () => sortInboxByStarredAndRecency(state.notifications),
    [state.notifications]
  );
  const sortedThreads = useMemo(
    () => sortInboxByStarredAndRecency(state.directMessageThreads),
    [state.directMessageThreads]
  );

  return (
    <div className="min-h-[50vh] pb-4">
      <div
        className="border-b border-cq-keaney/25 bg-cq-keaneyIce/40 px-2 py-2"
        role="tablist"
        aria-label="Inbox"
      >
        <div className="flex gap-1 rounded-xl border border-cq-keaney/25 bg-cq-white/80 p-1">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "notifications"}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition sm:text-sm ${
              tab === "notifications"
                ? "bg-cq-navy text-white shadow-sm"
                : "text-ig-secondary hover:text-cq-navy"
            }`}
            onClick={() => setTab("notifications")}
          >
            Notifications
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "messages"}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition sm:text-sm ${
              tab === "messages"
                ? "bg-cq-navy text-white shadow-sm"
                : "text-ig-secondary hover:text-cq-navy"
            }`}
            onClick={() => setTab("messages")}
          >
            Messages
          </button>
        </div>
      </div>

      <p className="px-3 pt-2 text-[10px] font-medium uppercase tracking-wide text-ig-secondary">
        Star items to pin them to the top
      </p>

      <div className="px-3 pt-2">
        {tab === "notifications" ? (
          <NotificationsPanel
            items={sortedNotifications}
            onRead={markNotificationRead}
            onToggleStar={toggleNotificationStar}
          />
        ) : (
          <MessagesPanel
            threads={sortedThreads}
            onOpen={markDirectMessageRead}
            onToggleStar={toggleDirectMessageStar}
          />
        )}
      </div>
    </div>
  );
}

function StarToggle({
  starred,
  onToggle,
  label
}: {
  starred: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={starred ? `${label} — unstar` : `${label} — star to pin`}
      aria-pressed={starred}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg transition ${
        starred
          ? "border-amber-400/80 bg-amber-50 text-amber-600 shadow-sm"
          : "border-cq-keaney/25 bg-cq-white/80 text-cq-keaney/50 hover:border-amber-300 hover:text-amber-600"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      {starred ? "★" : "☆"}
    </button>
  );
}

function NotificationsPanel({
  items,
  onRead,
  onToggleStar
}: {
  items: NotificationItem[];
  onRead: (id: string) => void;
  onToggleStar: (id: string) => void;
}) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-ig-secondary">You&apos;re all caught up.</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="flex gap-2">
          <button
            type="button"
            className={`min-w-0 flex-1 rounded-xl border px-3 py-3 text-left transition ${
              item.read ? "border-cq-keaney/20 bg-cq-white" : "border-cq-keaney bg-cq-keaneyIce"
            }`}
            onClick={() => onRead(item.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-cq-navy">{item.title}</p>
              {item.starred ? (
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  Pinned
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-ig-secondary">{item.body}</p>
            <p className="mt-1 text-[10px] text-ig-secondary">{item.createdAt}</p>
          </button>
          <StarToggle
            starred={!!item.starred}
            onToggle={() => onToggleStar(item.id)}
            label={item.title}
          />
        </li>
      ))}
    </ul>
  );
}

function groupInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function MessagesPanel({
  threads,
  onOpen,
  onToggleStar
}: {
  threads: DirectMessageThread[];
  onOpen: (id: string) => void;
  onToggleStar: (id: string) => void;
}) {
  if (threads.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ig-secondary">No direct messages yet.</p>
    );
  }
  return (
    <ul className="space-y-2">
      {threads.map((t) => (
        <li key={t.id} className="flex gap-2">
          <button
            type="button"
            className={`flex min-w-0 flex-1 gap-3 rounded-xl border px-3 py-3 text-left transition ${
              t.unread ? "border-cq-keaney bg-cq-keaneyIce" : "border-cq-keaney/20 bg-cq-white"
            }`}
            onClick={() => onOpen(t.id)}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${
                t.isGroup
                  ? "bg-gradient-to-br from-cq-navy to-cq-keaney ring-2 ring-amber-400/40"
                  : "bg-gradient-to-br from-cq-keaneyBright to-cq-navy"
              }`}
            >
              {t.isGroup ? groupInitials(t.peerName) : initialsFromName(t.peerName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-semibold text-cq-navy">
                  {t.isGroup ? (
                    <span>
                      <span className="mr-1 text-[10px] font-bold uppercase text-cq-keaney">Guild</span>
                      {t.peerName}
                    </span>
                  ) : (
                    t.peerName
                  )}
                </p>
                <span className="shrink-0 text-[10px] text-ig-secondary">{t.lastAt}</span>
              </div>
              {t.peerHandle && !t.isGroup ? (
                <p className="text-[11px] text-cq-keaney">@{t.peerHandle}</p>
              ) : null}
              <p className="mt-1 line-clamp-2 text-xs text-ig-secondary">{t.lastMessage}</p>
              {t.starred ? (
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">Pinned</p>
              ) : null}
            </div>
            {t.unread ? (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cq-keaney" aria-label="Unread" />
            ) : null}
          </button>
          <StarToggle
            starred={!!t.starred}
            onToggle={() => onToggleStar(t.id)}
            label={t.peerName}
          />
        </li>
      ))}
    </ul>
  );
}

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
