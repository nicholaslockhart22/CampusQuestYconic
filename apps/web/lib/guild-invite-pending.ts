/** Guild IDs the user has requested an invite to (local preview). */

export const GUILD_INVITE_PENDING_KEY = "campusquest-guild-invite-pending-v1";

export function loadPendingInviteGuildIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUILD_INVITE_PENDING_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

export function savePendingInviteGuildIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUILD_INVITE_PENDING_KEY, JSON.stringify(ids));
}
