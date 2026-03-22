"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminStats } from "@/actions/admin";
import { Users, ArrowLeftRight, UserPlus, CalendarDays, Calendar } from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    todayUsers: number;
    weekUsers: number;
    monthUsers: number;
    totalTransactions: number;
  } | null>(null);

  useEffect(() => {
    getAdminStats().then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-foreground" },
    { label: "Today", value: stats.todayUsers, icon: UserPlus, color: "text-emerald-500" },
    { label: "This Week", value: stats.weekUsers, icon: CalendarDays, color: "text-blue-500" },
    { label: "This Month", value: stats.monthUsers, icon: Calendar, color: "text-purple-500" },
    { label: "Transactions", value: stats.totalTransactions.toLocaleString(), icon: ArrowLeftRight, color: "text-amber-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <CardContent className="pt-4 pb-3 flex flex-col items-center text-center gap-1">
              <Icon className={`h-5 w-5 ${card.color}`} />
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
