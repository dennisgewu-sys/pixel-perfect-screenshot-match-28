import { describe, expect, it } from "vitest";
import { byGroup, byMonth, sumAmounts } from "./reports";

describe("financial report totals", () => {
  it("adds cedi amounts without floating-point drift", () => {
    expect(sumAmounts([{ amount: "0.10" }, { amount: 0.2 }, { amount: "100" }])).toBe(100.3);
  });

  it("groups totals by calendar month, oldest first", () => {
    const rows = [
      { amount: 50, date: "2026-03-14" },
      { amount: 20, date: "2026-01-02" },
      { amount: 30, date: "2026-03-01" },
    ];
    expect(byMonth(rows)).toEqual([
      { month: "2026-01", total: 20 },
      { month: "2026-03", total: 80 },
    ]);
  });

  it("puts records without a category under Uncategorised", () => {
    const rows = [
      { amount: 10, date: "2026-01-01", group: "" },
      { amount: 5, date: "2026-01-01", group: "Transport" },
      { amount: 15, date: "2026-01-01", group: null },
    ];
    expect(byGroup(rows)[0]).toEqual({ group: "Uncategorised", total: 25, count: 2 });
  });
});
