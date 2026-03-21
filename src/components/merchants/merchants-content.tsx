"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import {
  getMerchantProfiles,
  getMerchantTransactions,
  getTopMerchantInsights,
} from "@/actions/merchants";
import type { MerchantProfile } from "@/actions/merchants";
import { formatCurrency } from "@/lib/utils";
import {
  Store,
  Search,
  TrendingUp,
  Calendar,
  Hash,
  Lightbulb,
  ChevronRight,
  ArrowUpDown,
} from "lucide-react";

type MerchantTransaction = {
  id: string;
  date: string;
  amount: number;
  currency: string;
  type: string;
  description: string | null;
  categoryName: string | null;
  categoryColor: string | null;
};

function MiniSparkline({ data }: { data: { month: string; amount: number }[] }) {
  const amounts = data.map((d) => d.amount);
  const max = Math.max(...amounts, 1);
  const min = Math.min(...amounts, 0);
  const range = max - min || 1;

  const width = 120;
  const height = 32;
  const padding = 2;

  const points = amounts.map((val, i) => {
    const x = padding + (i / Math.max(amounts.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(" ");

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        points={polyline}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-emerald-500"
      />
      {points.map((point, i) => {
        const [x, y] = point.split(",");
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            className="fill-emerald-500"
          />
        );
      })}
    </svg>
  );
}

function FrequencyBadge({ frequency }: { frequency: string }) {
  const colorMap: Record<string, string> = {
    Weekly: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    Monthly: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    Occasional: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  };

  return (
    <Badge variant="outline" className={`text-xs ${colorMap[frequency] ?? ""}`}>
      {frequency}
    </Badge>
  );
}

function MerchantDetailDialog({
  merchant,
  open,
  onOpenChange,
}: {
  merchant: MerchantProfile | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [transactions, setTransactions] = useState<MerchantTransaction[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(false);

  useEffect(() => {
    if (open && merchant) {
      setLoadingTxs(true);
      getMerchantTransactions(merchant.merchant, 10).then((txs) => {
        setTransactions(txs);
        setLoadingTxs(false);
      });
    }
  }, [open, merchant]);

  if (!merchant) return null;

  const maxAmount = Math.max(...merchant.monthlyTrend.map((m) => m.amount), 1);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-emerald-500" />
            {merchant.merchant}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="space-y-5 py-2 max-h-[70vh] overflow-y-auto">
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-lg font-bold">{formatCurrency(merchant.totalSpent)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Avg Transaction</p>
              <p className="text-lg font-bold">{formatCurrency(merchant.avgTransaction)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Visits</p>
              <p className="text-lg font-bold">{merchant.transactionCount}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm font-medium truncate">{merchant.topCategory}</p>
            </div>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              First visit:{" "}
              {new Date(merchant.firstVisit).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="mx-1">&rarr;</span>
            <span>
              Last:{" "}
              {new Date(merchant.lastVisit).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Monthly bar chart */}
          <div>
            <p className="text-sm font-medium mb-2">Monthly Spending</p>
            <div className="space-y-1.5">
              {merchant.monthlyTrend.map((m) => (
                <div key={m.month} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">
                    {new Date(m.month + "-01").toLocaleDateString("en-US", {
                      month: "short",
                      year: "2-digit",
                    })}
                  </span>
                  <div className="flex-1 h-5 bg-muted/50 rounded-sm overflow-hidden">
                    <div
                      className="h-full bg-emerald-500/70 rounded-sm transition-all"
                      style={{
                        width: `${Math.max((m.amount / maxAmount) * 100, 0)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium w-20 text-right shrink-0">
                    {m.amount > 0 ? formatCurrency(m.amount) : "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent transactions */}
          <div>
            <p className="text-sm font-medium mb-2">Recent Transactions</p>
            {loadingTxs ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions found</p>
            ) : (
              <div className="space-y-1">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-1.5 border-b last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm truncate">
                        {tx.description || merchant.merchant}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {tx.categoryName && ` · ${tx.categoryName}`}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-medium shrink-0 ml-2 ${
                        tx.type === "income" ? "text-green-600" : ""
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(Math.abs(tx.amount), tx.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

type SortKey = "totalSpent" | "transactionCount" | "avgTransaction" | "merchant";

export function MerchantsContent() {
  const [loading, setLoading] = useState(true);
  const [merchants, setMerchants] = useState<MerchantProfile[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("totalSpent");
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantProfile | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(async () => {
    const [profiles, tips] = await Promise.all([
      getMerchantProfiles(),
      getTopMerchantInsights(),
    ]);
    setMerchants(profiles);
    setInsights(tips);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = merchants
    .filter((m) =>
      m.merchant.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "totalSpent":
          return b.totalSpent - a.totalSpent;
        case "transactionCount":
          return b.transactionCount - a.transactionCount;
        case "avgTransaction":
          return b.avgTransaction - a.avgTransaction;
        case "merchant":
          return a.merchant.localeCompare(b.merchant);
        default:
          return 0;
      }
    });

  const totalUnique = merchants.length;
  const mostVisited = merchants.reduce(
    (best, m) => (m.transactionCount > (best?.transactionCount ?? 0) ? m : best),
    null as MerchantProfile | null,
  );
  const highestSpending = merchants[0] ?? null;

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (merchants.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4">Merchants</h2>
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Store className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              No merchant data yet. Add transactions with merchant names to see your spending spots.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <h2 className="text-xl font-bold">Merchants</h2>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Unique Merchants</p>
            <p className="text-2xl font-bold">{totalUnique}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Most Visited</p>
            <p className="text-lg font-bold truncate">{mostVisited?.merchant ?? "-"}</p>
            <p className="text-xs text-muted-foreground">
              {mostVisited ? `${mostVisited.transactionCount} visits` : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Highest Spending</p>
            <p className="text-lg font-bold truncate">{highestSpending?.merchant ?? "-"}</p>
            <p className="text-xs text-muted-foreground">
              {highestSpending ? formatCurrency(highestSpending.totalSpent) : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-semibold">Insights</p>
            </div>
            <ul className="space-y-1">
              {insights.map((insight, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">&#8226;</span>
                  {insight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search merchants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {(
            [
              { key: "totalSpent", label: "Spent" },
              { key: "transactionCount", label: "Visits" },
              { key: "avgTransaction", label: "Avg" },
              { key: "merchant", label: "A-Z" },
            ] as { key: SortKey; label: string }[]
          ).map((opt) => (
            <Button
              key={opt.key}
              size="sm"
              variant={sortBy === opt.key ? "default" : "outline"}
              onClick={() => setSortBy(opt.key)}
              className="text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Merchant Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((merchant) => (
          <Card
            key={merchant.merchant}
            className="cursor-pointer hover:border-emerald-500/40 transition-colors"
            onClick={() => {
              setSelectedMerchant(merchant);
              setDetailOpen(true);
            }}
          >
            <CardContent className="pt-4 pb-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-bold truncate">{merchant.merchant}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {merchant.topCategory}
                  </p>
                </div>
                <FrequencyBadge frequency={merchant.visitFrequency} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">
                    {formatCurrency(merchant.totalSpent)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {merchant.transactionCount} transactions &middot; avg{" "}
                    {formatCurrency(merchant.avgTransaction)}
                  </p>
                </div>
                <MiniSparkline data={merchant.monthlyTrend} />
              </div>

              <div className="flex items-center justify-end">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No merchants match your search.
        </p>
      )}

      {/* Detail Dialog */}
      <MerchantDetailDialog
        merchant={selectedMerchant}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
