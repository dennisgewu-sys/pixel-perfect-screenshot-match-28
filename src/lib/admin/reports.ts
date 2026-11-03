export type MoneyRow = { amount: number | string; date: string; group?: string | null };

export function sumAmounts(rows: { amount: number | string }[]): number {
  return Math.round(rows.reduce((s, r) => s + Number(r.amount || 0), 0) * 100) / 100;
}

/** Totals per calendar month (YYYY-MM), oldest first. */
export function byMonth(rows: MoneyRow[]): { month: string; total: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const m = r.date.slice(0, 7);
    map.set(m, (map.get(m) ?? 0) + Number(r.amount || 0));
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, total]) => ({ month, total: Math.round(total * 100) / 100 }));
}

/** Totals per group label, largest first. Empty groups count as "Uncategorised". */
export function byGroup(rows: MoneyRow[]): { group: string; total: number; count: number }[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const r of rows) {
    const g = r.group?.trim() || "Uncategorised";
    const cur = map.get(g) ?? { total: 0, count: 0 };
    cur.total += Number(r.amount || 0);
    cur.count += 1;
    map.set(g, cur);
  }
  return [...map.entries()]
    .map(([group, v]) => ({ group, total: Math.round(v.total * 100) / 100, count: v.count }))
    .sort((a, b) => b.total - a.total);
}

export function countBy<T>(rows: T[], key: (r: T) => string | null | undefined): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = key(r) || "Unspecified";
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}
