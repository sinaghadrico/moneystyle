/**
 * Utilities for spreading a transaction's amount across multiple months.
 * Used when a lump-sum payment covers N months (e.g., 3-month water bill).
 */

export type SpreadEntry = { month: string; fraction: number };

/**
 * Returns an array of {month, fraction} for each month a spread transaction covers.
 * The first month is the transaction date's month; subsequent months follow sequentially.
 * Each fraction is `1 / spreadMonths`.
 */
export function getSpreadEntries(
  txDate: Date,
  spreadMonths: number | null | undefined,
): SpreadEntry[] {
  if (!spreadMonths || spreadMonths <= 1) {
    const month = toMonthKey(txDate);
    return [{ month, fraction: 1 }];
  }

  const fraction = 1 / spreadMonths;
  const entries: SpreadEntry[] = [];
  const d = new Date(txDate);

  for (let i = 0; i < spreadMonths; i++) {
    const year = d.getFullYear();
    const mon = d.getMonth() + i;
    const date = new Date(year, mon, 1);
    entries.push({ month: toMonthKey(date), fraction });
  }

  return entries;
}

/**
 * Returns the fraction (0–1) of a spread transaction that belongs to a specific target month.
 * Returns 0 if the target month is outside the spread range.
 */
export function getSpreadFraction(
  txDate: Date,
  spreadMonths: number | null | undefined,
  targetMonth: string,
): number {
  if (!spreadMonths || spreadMonths <= 1) {
    return toMonthKey(txDate) === targetMonth ? 1 : 0;
  }

  const entries = getSpreadEntries(txDate, spreadMonths);
  const entry = entries.find((e) => e.month === targetMonth);
  return entry?.fraction ?? 0;
}

/** Converts a Date to "YYYY-MM" string. */
function toMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
