"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { ReserveDialog } from "./reserve-dialog";
import { RecordReserveDialog } from "./record-reserve-dialog";
import { ReserveHistoryDialog } from "./reserve-history-dialog";
import { deleteReserve, refreshInvestmentPrices } from "@/actions/reserves";
import { formatCurrency } from "@/lib/utils";
import type { ReserveData } from "@/lib/types";
import { Plus, Pencil, Trash2, MapPin, RefreshCw, History, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TYPE_STYLES: Record<string, string> = {
  cash: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  gold: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  crypto:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  stock: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  etf: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  bond: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  family: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const TYPE_LABELS: Record<string, string> = {
  cash: "Cash",
  gold: "Gold",
  crypto: "Crypto",
  stock: "Stock",
  etf: "ETF",
  bond: "Bond",
  family: "Family",
  other: "Other",
};

const INVESTMENT_TYPES = ["stock", "etf", "bond"];

function InvestmentGainLoss({ reserve }: { reserve: ReserveData }) {
  if (!reserve.purchasePrice || !reserve.quantity) return null;
  const costBasis = reserve.purchasePrice * reserve.quantity;
  const currentValue = reserve.amount;
  const gainLoss = currentValue - costBasis;
  const gainLossPct = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
  const isPositive = gainLoss >= 0;

  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      <span>
        {isPositive ? "+" : ""}{formatCurrency(gainLoss, reserve.currency)} ({isPositive ? "+" : ""}{gainLossPct.toFixed(1)}%)
      </span>
    </div>
  );
}

export function ReservesSection({
  reserves,
  onRefresh,
}: {
  reserves: ReserveData[];
  onRefresh: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<ReserveData | null>(null);
  const [recordItem, setRecordItem] = useState<ReserveData | null>(null);
  const [historyItem, setHistoryItem] = useState<ReserveData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ReserveData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const hasInvestments = reserves.some((r) => INVESTMENT_TYPES.includes(r.type));

  const handleDelete = async (id: string) => {
    setDeleteConfirm(null);
    await deleteReserve(id);
    toast.success("Reserve deleted");
    onRefresh();
  };

  const handleRefreshPrices = async () => {
    setRefreshing(true);
    const result = await refreshInvestmentPrices();
    setRefreshing(false);
    if ("error" in result) {
      toast.error(result.error);
    } else if (result.updated > 0) {
      toast.success(`Updated ${result.updated} investment${result.updated > 1 ? "s" : ""}`);
      onRefresh();
    } else {
      toast.info("All prices are up to date");
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reserves & Investments</h3>
        <div className="flex gap-2">
          {hasInvestments && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefreshPrices}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-4 w-4" />
              )}
              Refresh Prices
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {reserves.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No reserves yet. Track cash, gold, crypto, stocks, ETFs, or family savings.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reserves.map((reserve) => {
            const isInvestment = INVESTMENT_TYPES.includes(reserve.type);
            return (
              <Card key={reserve.id} className="group relative">
                <CardContent className="pt-4 pb-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{reserve.name}</h4>
                    <Badge
                      variant="secondary"
                      className={TYPE_STYLES[reserve.type] || TYPE_STYLES.other}
                    >
                      {TYPE_LABELS[reserve.type] || reserve.type}
                    </Badge>
                    {isInvestment && reserve.ticker && (
                      <Badge variant="outline" className="text-xs font-mono">
                        {reserve.ticker}
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-bold">
                    {formatCurrency(reserve.amount, reserve.currency)}
                  </p>
                  {isInvestment && reserve.quantity && (
                    <p className="text-xs text-muted-foreground">
                      {reserve.quantity} shares
                      {reserve.purchasePrice
                        ? ` @ ${formatCurrency(reserve.purchasePrice, reserve.currency)}`
                        : ""}
                    </p>
                  )}
                  {isInvestment && <InvestmentGainLoss reserve={reserve} />}
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {reserve.location}
                  </p>
                  {reserve.note && (
                    <p className="text-xs text-muted-foreground">
                      {reserve.note}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    {reserve.lastRecordedAt ? (
                      <p className="text-xs text-muted-foreground">
                        Updated{" "}
                        {new Date(reserve.lastRecordedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </p>
                    ) : (
                      <span />
                    )}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Record Value"
                        onClick={() => setRecordItem(reserve)}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="History"
                        onClick={() => setHistoryItem(reserve)}
                      >
                        <History className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditItem(reserve)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => setDeleteConfirm(reserve)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showCreate && (
        <ReserveDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          onSuccess={onRefresh}
        />
      )}

      {editItem && (
        <ReserveDialog
          reserve={editItem}
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          onSuccess={onRefresh}
        />
      )}

      {recordItem && (
        <RecordReserveDialog
          reserve={recordItem}
          open={!!recordItem}
          onOpenChange={(open) => !open && setRecordItem(null)}
          onSuccess={onRefresh}
        />
      )}

      {historyItem && (
        <ReserveHistoryDialog
          reserve={historyItem}
          open={!!historyItem}
          onOpenChange={(open) => !open && setHistoryItem(null)}
        />
      )}

      <ResponsiveDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Delete Reserve</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <p className="text-sm text-muted-foreground px-1">
            Are you sure you want to delete <span className="font-medium text-foreground">{deleteConfirm?.name}</span>? This cannot be undone.
          </p>
          <ResponsiveDialogFooter>
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
              >
                Delete
              </Button>
            </div>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </section>
  );
}
