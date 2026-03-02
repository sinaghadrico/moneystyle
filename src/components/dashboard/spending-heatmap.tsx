"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailySpend } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function SpendingHeatmap({ data }: { data: DailySpend[] }) {
  if (data.length === 0) return null;

  // Build lookup map
  const spendMap = new Map(data.map((d) => [d.date, d.amount]));
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  // Build 13-week grid ending today
  const today = new Date();
  // Find the Monday of the week 12 weeks ago
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - mondayOffset);
  const startMonday = new Date(currentMonday);
  startMonday.setDate(currentMonday.getDate() - 12 * 7);

  const weeks: { date: string; amount: number; isFuture: boolean }[][] = [];

  for (let w = 0; w < 13; w++) {
    const week: { date: string; amount: number; isFuture: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(startMonday);
      cellDate.setDate(startMonday.getDate() + w * 7 + d);
      const dateStr = cellDate.toISOString().slice(0, 10);
      const isFuture = cellDate > today;
      week.push({
        date: dateStr,
        amount: spendMap.get(dateStr) ?? 0,
        isFuture,
      });
    }
    weeks.push(week);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Daily Spending (13 weeks)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pr-1 pt-5">
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="flex h-3 items-center text-[10px] text-muted-foreground"
              >
                {i % 2 === 0 ? label : ""}
              </div>
            ))}
          </div>
          {/* Grid */}
          <div className="flex flex-1 gap-1 overflow-x-auto">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {/* Month label for first day of week */}
                <div className="h-4 text-[10px] text-muted-foreground">
                  {week[0].date.slice(8, 10) <= "07"
                    ? new Date(week[0].date).toLocaleString("default", {
                        month: "short",
                      })
                    : ""}
                </div>
                {week.map((cell, di) => {
                  const ratio = cell.amount / maxAmount;
                  return (
                    <div
                      key={di}
                      className="h-3 w-3 rounded-sm"
                      title={
                        cell.isFuture
                          ? ""
                          : `${cell.date}: ${formatCurrency(cell.amount)}`
                      }
                      style={{
                        backgroundColor: cell.isFuture
                          ? "transparent"
                          : cell.amount === 0
                            ? "var(--color-muted)"
                            : `rgba(239, 68, 68, ${0.2 + ratio * 0.8})`,
                        border: cell.isFuture
                          ? "1px dashed var(--color-border)"
                          : "none",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          <span>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <div
              key={ratio}
              className="h-3 w-3 rounded-sm"
              style={{
                backgroundColor:
                  ratio === 0
                    ? "var(--color-muted)"
                    : `rgba(239, 68, 68, ${0.2 + ratio * 0.8})`,
              }}
            />
          ))}
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
