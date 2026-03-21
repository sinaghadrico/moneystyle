"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { PriceAlert } from "@/actions/price-watch";
import { cn } from "@/lib/utils";

export function PriceWatchCard({ data }: { data: PriceAlert[] }) {
  if (data.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Bell className="h-4 w-4" />
              Price Alerts
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No significant price changes detected.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Bell className="h-4 w-4" />
            Price Alerts
            {data.length > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold px-2 py-0.5">
                {data.length}
              </span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-muted-foreground"
            asChild
          >
            <Link href="/price-analysis">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.slice(0, 5).map((alert) => {
          const isIncrease = alert.changePercent > 0;
          return (
            <div
              key={alert.itemName + alert.merchant}
              className="flex items-center justify-between text-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium truncate">{alert.itemName}</span>
                  {isIncrease ? (
                    <span className="inline-flex items-center gap-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-semibold px-1.5 py-0.5 shrink-0">
                      <TrendingUp className="h-3 w-3" />
                      +{alert.changePercent}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold px-1.5 py-0.5 shrink-0">
                      <TrendingDown className="h-3 w-3" />
                      {alert.changePercent}%
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  at {alert.merchant}
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground line-through">
                    {formatCurrency(alert.previousPrice)}
                  </span>
                  <span className="text-muted-foreground">&rarr;</span>
                  <span
                    className={cn(
                      "font-semibold",
                      isIncrease
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {formatCurrency(alert.currentPrice)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
