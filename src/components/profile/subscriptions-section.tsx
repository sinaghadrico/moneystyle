"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { detectSubscriptions } from "@/actions/profile";
import { formatCurrency } from "@/lib/utils";
import type { DetectedSubscription } from "@/lib/types";
import { RefreshCw, TrendingDown, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FREQ_LABELS: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const FREQ_STYLES: Record<string, string> = {
  weekly: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  monthly: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  yearly: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
};

function getMonthlyEquivalent(sub: DetectedSubscription): number {
  if (sub.frequency === "weekly") return sub.amount * 4.33;
  if (sub.frequency === "yearly") return sub.amount / 12;
  return sub.amount;
}

export function SubscriptionsSection() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscriptions, setSubscriptions] = useState<DetectedSubscription[]>([]);

  const loadData = useCallback(async () => {
    const data = await detectSubscriptions();
    setSubscriptions(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const totalMonthly = subscriptions.reduce(
    (sum, sub) => sum + getMonthlyEquivalent(sub),
    0
  );

  const totalYearly = totalMonthly * 12;
  const mainCurrency = subscriptions[0]?.currency ?? "USD";

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Detected Subscriptions</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-1 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No recurring subscriptions detected yet. Keep tracking your expenses and check back later.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                  Monthly Total
                </div>
                <p className="mt-1 text-lg font-bold">
                  {formatCurrency(totalMonthly, mainCurrency)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" />
                  Yearly Total
                </div>
                <p className="mt-1 text-lg font-bold">
                  {formatCurrency(totalYearly, mainCurrency)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Subscription cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subscriptions.map((sub) => (
              <Card key={sub.merchant}>
                <CardContent className="pt-4 pb-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{sub.merchant}</h4>
                    <Badge
                      variant="secondary"
                      className={FREQ_STYLES[sub.frequency] ?? FREQ_STYLES.monthly}
                    >
                      {FREQ_LABELS[sub.frequency] ?? sub.frequency}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold">
                    {formatCurrency(sub.amount, sub.currency)}
                    <span className="text-xs font-normal text-muted-foreground ml-1">
                      /{sub.frequency === "weekly" ? "wk" : sub.frequency === "yearly" ? "yr" : "mo"}
                    </span>
                  </p>
                  {sub.categoryName && (
                    <p className="text-xs text-muted-foreground">
                      {sub.categoryName}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-muted-foreground">
                      {sub.occurrences} payments
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        Last:{" "}
                        {new Date(sub.lastDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          sub.confidence >= 80
                            ? "border-green-500 text-green-600"
                            : sub.confidence >= 60
                              ? "border-amber-500 text-amber-600"
                              : "border-gray-400 text-gray-500"
                        }`}
                      >
                        {sub.confidence}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
