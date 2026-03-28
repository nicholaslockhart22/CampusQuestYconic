"use client";

import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import type { NotificationItem } from "@/lib/types";

export function NotificationsPanel({
  notifications,
  onMarkRead
}: {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
}) {
  return (
    <Card>
      <SectionHeading
        eyebrow="Inbox"
        title="Quest and guild alerts"
        description="Streak reminders, boss warnings, and celebration pings land here."
      />
      <div className="space-y-3">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`rounded-3xl border border-uri-navy/10 p-4 ${notification.read ? "bg-white/60" : "bg-uri-sky/60"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-uri-ink">{notification.title}</h3>
                <p className="mt-2 text-sm leading-6 text-uri-navy/64">{notification.body}</p>
                <span className="mt-2 block text-xs uppercase tracking-[0.18em] text-uri-navy/44">{notification.createdAt}</span>
              </div>
              {!notification.read ? (
                <button
                  className="rounded-full border border-uri-navy/12 bg-white px-4 py-2 text-sm font-semibold text-uri-navy"
                  onClick={() => onMarkRead(notification.id)}
                >
                  Mark read
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
