"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { sortInboxByStarredAndRecency } from "@/lib/inbox-sort";
import type { NotificationItem } from "@/lib/types";

export function NotificationsPanel({
  notifications,
  onMarkRead,
  onToggleStar
}: {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onToggleStar: (id: string) => void;
}) {
  const sorted = useMemo(
    () => sortInboxByStarredAndRecency(notifications),
    [notifications]
  );

  return (
    <Card>
      <SectionHeading
        eyebrow="Inbox"
        title="Quest and guild alerts"
        description="Star items to pin them to the top. Streak reminders, boss warnings, and celebration pings land here."
      />
      <div className="space-y-3">
        {sorted.map((notification) => (
          <article
            key={notification.id}
            className={`rounded-3xl border border-uri-navy/10 p-4 ${notification.read ? "bg-white/60" : "bg-uri-sky/60"}`}
          >
            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-uri-ink">{notification.title}</h3>
                  {notification.starred ? (
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                      Pinned
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-uri-navy/64">{notification.body}</p>
                <span className="mt-2 block text-xs uppercase tracking-[0.18em] text-uri-navy/44">
                  {notification.createdAt}
                </span>
                {!notification.read ? (
                  <button
                    type="button"
                    className="mt-3 rounded-full border border-uri-navy/12 bg-white px-4 py-2 text-sm font-semibold text-uri-navy"
                    onClick={() => onMarkRead(notification.id)}
                  >
                    Mark read
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                aria-label={notification.starred ? "Unstar notification" : "Star to pin notification"}
                aria-pressed={!!notification.starred}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg transition ${
                  notification.starred
                    ? "border-amber-400/80 bg-amber-50 text-amber-600"
                    : "border-uri-navy/12 bg-white text-uri-navy/40 hover:border-amber-300 hover:text-amber-600"
                }`}
                onClick={() => onToggleStar(notification.id)}
              >
                {notification.starred ? "★" : "☆"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
