"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BudgetProgress } from "@/actions/budgets";
import { formatCurrency } from "@/lib/utils";

function getBarColor(percentage: number, threshold: number): string {
  if (percentage >= 100) return "bg-red-500";
  if (percentage >= threshold) return "bg-orange-500";
  if (percentage >= threshold * 0.8) return "bg-yellow-500";
  return "bg-green-500";
}

function getTextColor(percentage: number, threshold: number): string {
  if (percentage >= 100) return "text-red-500";
  if (percentage >= threshold) return "text-orange-500";
  if (percentage >= threshold * 0.8) return "text-yellow-600";
  return "text-green-500";
}

export function BudgetProgressCard({ data }: { data: BudgetProgress[] }) {
  if (data.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">📊 Budget Progress</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {data.map((b) => {
          const remaining = b.monthlyLimit - b.spent;
          return (
            <div
              key={b.categoryId}
              className="rounded-xl bg-muted/50 px-3 py-2.5"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: b.categoryColor }}
                />
                <span className="text-xs font-medium truncate">{b.categoryName}</span>
              </div>
              <p className={`text-lg font-bold ${getTextColor(b.percentage, b.alertThreshold)}`}>
                {b.percentage}%
              </p>
              <p className="text-[10px] text-muted-foreground mb-1.5">
                {remaining >= 0 ? `${formatCurrency(remaining)} left` : "Over budget!"}
              </p>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${getBarColor(b.percentage, b.alertThreshold)}`}
                  style={{ width: `${Math.min(b.percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
