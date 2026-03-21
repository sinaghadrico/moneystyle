"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NetWorthData } from "@/actions/net-worth";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard } from "lucide-react";

export function NetWorthCard({ data }: { data: NetWorthData }) {
  const isPositive = data.netWorth >= 0;

  const breakdownItems = [
    {
      label: "Accounts",
      value: data.breakdown.accounts,
      icon: Wallet,
      color: "text-blue-500",
    },
    {
      label: "Reserves",
      value: data.breakdown.reserves,
      icon: PiggyBank,
      color: "text-emerald-500",
    },
    {
      label: "Liabilities",
      value: -data.breakdown.installmentsOwed,
      icon: CreditCard,
      color: "text-red-500",
      isNegative: true,
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            Net Worth
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`text-2xl sm:text-3xl font-bold ${
            isPositive ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {formatCurrency(data.netWorth)}
        </div>

        <div className="space-y-2.5">
          {breakdownItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                  <span>{item.label}</span>
                </div>
                <span
                  className={`font-medium ${
                    item.isNegative ? "text-red-500" : ""
                  }`}
                >
                  {item.isNegative && data.breakdown.installmentsOwed > 0
                    ? `- ${formatCurrency(data.breakdown.installmentsOwed)}`
                    : formatCurrency(item.value)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
