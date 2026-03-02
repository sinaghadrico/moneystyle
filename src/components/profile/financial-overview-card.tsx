"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { FinancialOverview } from "@/lib/types";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Clock,
} from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  cash: "Cash",
  gold: "Gold",
  crypto: "Crypto",
  family: "Family",
  other: "Other",
};

export function FinancialOverviewCard({
  overview,
}: {
  overview: FinancialOverview;
}) {
  const isPositiveCashflow = overview.netMonthlyCashflow >= 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Monthly Income
            </div>
            <p className="mt-1 text-xl font-bold">
              {formatCurrency(overview.totalMonthlyIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Monthly Bills
            </div>
            <p className="mt-1 text-xl font-bold">
              {formatCurrency(overview.totalMonthlyInstallments)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Wallet className="h-4 w-4" />
              Net Cashflow
            </div>
            <p
              className={`mt-1 text-xl font-bold ${
                isPositiveCashflow ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(overview.netMonthlyCashflow)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <PiggyBank className="h-4 w-4 text-amber-500" />
              Total Reserves
            </div>
            <p className="mt-1 text-xl font-bold">
              {formatCurrency(overview.totalReserves)}
            </p>
          </CardContent>
        </Card>
      </div>

      {(overview.upcomingInstallments.length > 0 ||
        overview.reservesByType.length > 0) && (
        <Card>
          <CardContent className="pt-4 pb-4 space-y-2">
            {overview.upcomingInstallments.map((inst) => (
              <div
                key={inst.id}
                className="flex items-center gap-2 text-sm"
              >
                <Clock className="h-4 w-4 text-orange-500 shrink-0" />
                <span>
                  {inst.daysUntilDue === 0 ? (
                    <span className="font-semibold text-red-600">
                      TODAY: {inst.name} — {formatCurrency(inst.amount)}
                    </span>
                  ) : (
                    <span>
                      {inst.name} due in{" "}
                      <span className="font-semibold">
                        {inst.daysUntilDue} day
                        {inst.daysUntilDue !== 1 ? "s" : ""}
                      </span>{" "}
                      ({formatCurrency(inst.amount)})
                    </span>
                  )}
                </span>
              </div>
            ))}
            {overview.reservesByType.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {overview.reservesByType
                  .map(
                    (r) =>
                      `${TYPE_LABELS[r.type] || r.type}: ${formatCurrency(r.total)}`
                  )
                  .join(" · ")}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
