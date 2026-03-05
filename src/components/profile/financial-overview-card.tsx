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
        {([
          {
            icon: TrendingUp,
            iconColor: "text-green-500",
            label: "Income",
            value: formatCurrency(overview.totalMonthlyIncome),
            valueColor: "",
          },
          {
            icon: TrendingDown,
            iconColor: "text-red-500",
            label: "Bills",
            value: formatCurrency(overview.totalMonthlyInstallments + overview.totalMonthlyBills),
            valueColor: "",
          },
          {
            icon: Wallet,
            iconColor: "",
            label: "Cashflow",
            value: formatCurrency(overview.netMonthlyCashflow),
            valueColor: isPositiveCashflow ? "text-green-600" : "text-red-600",
          },
          {
            icon: PiggyBank,
            iconColor: "text-amber-500",
            label: "Reserves",
            value: formatCurrency(overview.totalReserves),
            valueColor: "",
          },
        ] as const).map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Icon className={`h-3.5 w-3.5 shrink-0 ${item.iconColor}`} />
                  {item.label}
                </div>
                <p className={`mt-1 text-lg font-bold truncate ${item.valueColor}`}>
                  {item.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(overview.upcomingPayments.length > 0 ||
        overview.reservesByType.length > 0) && (
        <Card>
          <CardContent className="pt-4 pb-4 space-y-2">
            {overview.upcomingPayments.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 text-sm"
              >
                <Clock className="h-4 w-4 text-orange-500 shrink-0" />
                <span>
                  {item.daysUntilDue === 0 ? (
                    <span className="font-semibold text-red-600">
                      TODAY: {item.name} — {formatCurrency(item.amount, item.currency)}
                    </span>
                  ) : (
                    <span>
                      {item.name} due in{" "}
                      <span className="font-semibold">
                        {item.daysUntilDue} day
                        {item.daysUntilDue !== 1 ? "s" : ""}
                      </span>{" "}
                      ({formatCurrency(item.amount, item.currency)})
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
                      `${TYPE_LABELS[r.type] || r.type}: ${formatCurrency(r.total, r.currency)}`
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
