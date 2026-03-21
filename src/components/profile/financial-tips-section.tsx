"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getFinancialTips, type FinancialTip } from "@/actions/financial-tips";
import {
  AlertTriangle,
  AlertCircle,
  Target,
  Trophy,
  Star,
  Shield,
  Sparkles,
  Receipt,
  Tag,
  TrendingUp,
  BarChart3,
  PieChart,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "alert-triangle": AlertTriangle,
  "alert-circle": AlertCircle,
  target: Target,
  trophy: Trophy,
  star: Star,
  shield: Shield,
  sparkles: Sparkles,
  receipt: Receipt,
  tag: Tag,
  "trending-up": TrendingUp,
  "bar-chart": BarChart3,
  "pie-chart": PieChart,
};

const TYPE_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-500",
  },
  suggestion: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-500",
  },
  achievement: {
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-500",
  },
};

export function FinancialTipsSection() {
  const [loading, setLoading] = useState(true);
  const [tips, setTips] = useState<FinancialTip[]>([]);

  const loadData = useCallback(async () => {
    const data = await getFinancialTips();
    setTips(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (tips.length === 0) {
    return (
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Financial Tips</h3>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            You&apos;re doing great! No tips right now. Keep tracking.
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Financial Tips</h3>
      <div className="space-y-2">
        {tips.map((tip) => {
          const style = TYPE_STYLES[tip.type] ?? TYPE_STYLES.suggestion;
          const Icon = ICON_MAP[tip.icon] ?? Sparkles;
          return (
            <div
              key={tip.id}
              className={`rounded-lg border p-4 ${style.bg} ${style.border}`}
            >
              <div className="flex gap-3">
                <div className={`shrink-0 mt-0.5 ${style.icon}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{tip.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
