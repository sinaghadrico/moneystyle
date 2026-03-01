"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExpensePrediction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export function PredictionCard({ prediction }: { prediction: ExpensePrediction }) {
  const { spent, predicted, daysElapsed, daysInMonth, dailyAverage } = prediction;
  const progress = Math.round((daysElapsed / daysInMonth) * 100);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <TrendingUp className="h-4 w-4" />
          Expense Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Spent so far</p>
            <p className="text-2xl font-bold">{formatCurrency(spent)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Predicted month-end</p>
            <p className="text-2xl font-bold text-orange-500">
              {formatCurrency(predicted)}
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Day {daysElapsed} of {daysInMonth}</span>
            <span>{progress}% of month</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Daily average: {formatCurrency(dailyAverage)}
        </p>
      </CardContent>
    </Card>
  );
}
