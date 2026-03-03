import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowLeftRight,
} from "lucide-react";
import type { DashboardStats } from "@/lib/types";

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      title: "📈 Total Income",
      value: formatCurrency(stats.totalIncome),
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "📉 Total Expense",
      value: formatCurrency(stats.totalExpense),
      icon: TrendingDown,
      color: "text-red-500",
    },
    {
      title: "💰 Balance",
      value: formatCurrency(stats.balance),
      icon: Wallet,
      color: stats.balance >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      title: "🔄 Transactions",
      value: stats.transactionCount.toLocaleString(),
      icon: ArrowLeftRight,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
