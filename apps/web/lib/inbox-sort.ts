/** Starred first; then newest-first by recencyRank (higher = more recent). Stable tie-break. */
export function sortInboxByStarredAndRecency<T extends { starred?: boolean; recencyRank?: number }>(
  items: T[]
): T[] {
  return [...items]
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const starA = !!a.item.starred;
      const starB = !!b.item.starred;
      if (starB !== starA) return Number(starB) - Number(starA);
      const rA = a.item.recencyRank ?? 0;
      const rB = b.item.recencyRank ?? 0;
      if (rB !== rA) return rB - rA;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}
