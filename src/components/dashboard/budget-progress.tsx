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

export function BudgetProgressCard({ data }: { data: BudgetProgress[] }) {
  if (data.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">📊 Budget Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((b) => (
          <div key={b.categoryId} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: b.categoryColor }}
                />
                <span className="font-medium">{b.categoryName}</span>
              </div>
              <span className="text-muted-foreground">
                {formatCurrency(b.spent)} / {formatCurrency(b.monthlyLimit)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${getBarColor(b.percentage, b.alertThreshold)}`}
                style={{ width: `${Math.min(b.percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">{b.percentage}%</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
