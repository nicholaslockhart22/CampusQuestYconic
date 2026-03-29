/** Bonus XP when a valid campus check-in QR or link is used with an activity log. */
export const LOCATION_QR_BONUS_XP = 35;

/**
 * Accepts QR payloads or pasted URLs used for URI / CampusQuest check-ins.
 * Organizers can encode e.g. `campusquest://checkin/keaney-gym` or https URLs with /checkin/.
 */
export function isValidLocationProofPayload(data: string): boolean {
  const t = data.trim();
  if (t.length < 12 || t.length > 2048) return false;
  if (t.startsWith("campusquest://checkin/")) return true;
  if (t.startsWith("campusquest:checkin/")) return true;
  try {
    const u = new URL(t);
    if (u.protocol === "http:" || u.protocol === "https:") {
      if (/\/checkin\b/i.test(u.pathname)) return true;
      if (u.searchParams.has("checkin")) return true;
    }
  } catch {
    /* not a URL */
  }
  return /^https?:\/\/[^\s]+/i.test(t) && /checkin/i.test(t);
}
