/** Upper bound for the stat XP bar (next 25pt step, minimum cap 250). */
export function statBarSegmentMax(value: number): number {
  const v = Math.max(0, value);
  const step = 25;
  const next = Math.ceil(v / step) * step;
  return Math.max(250, next);
}

export function statBarFillPercent(value: number): number {
  const max = statBarSegmentMax(value);
  if (max <= 0) return 0;
  return Math.min(100, (Math.max(0, value) / max) * 100);
}
