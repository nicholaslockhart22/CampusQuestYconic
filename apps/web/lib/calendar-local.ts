/** Local calendar day id for daily resets (not UTC). */
export function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Local Monday date id (YYYY-MM-DD) for weekly raid reset. */
export function localMondayDateKey(d = new Date()): string {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = date.getDay();
  const back = dow === 0 ? 6 : dow - 1;
  date.setDate(date.getDate() - back);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
