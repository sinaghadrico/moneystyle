"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DebtSummary } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export function DebtsCard({ data }: { data: DebtSummary[] }) {
  if (data.length === 0) return null;

  const totalOwed = data.reduce((s, d) => s + Math.max(d.balance, 0), 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">🤝 Shared Expenses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((d) => (
          <div key={d.personId} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: d.personColor }}
              />
              <Link
                href={`/persons/${d.personId}/summary`}
                className="text-sm font-medium hover:underline"
              >
                {d.personName}
              </Link>
            </div>
            <div className="text-right">
              <span
                className={`text-sm font-medium ${d.balance > 0 ? "text-red-500" : "text-green-500"}`}
              >
                {d.balance > 0 ? "owes " : "you owe "}
                {formatCurrency(Math.abs(d.balance))}
              </span>
              <div className="text-xs text-muted-foreground">
                splits: {formatCurrency(d.totalSplits)} | settled: {formatCurrency(d.totalSettled)}
              </div>
            </div>
          </div>
        ))}
        {totalOwed > 0 && (
          <div className="border-t pt-2 text-right">
            <span className="text-sm text-muted-foreground">
              Total owed to you: <span className="font-medium text-foreground">{formatCurrency(totalOwed)}</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
