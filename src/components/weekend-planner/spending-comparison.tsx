"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getWeekendSpendingComparison,
  unlinkTransactionFromWeekendPlan,
} from "@/actions/weekend-planner";
import {
  TrendingDown,
  TrendingUp,
  Loader2,
  X,
  Link2,
  BarChart3,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { WeekendSpendingComparison } from "@/lib/types";

export function SpendingComparison({
  planId,
  offerIndex,
  linkedTransactionIds,
  onUnlink,
  onOpenLinkDialog,
}: {
  planId: string;
  offerIndex: number;
  linkedTransactionIds: string[];
  onUnlink: (updatedIds: string[]) => void;
  onOpenLinkDialog: () => void;
}) {
  const [data, setData] = useState<WeekendSpendingComparison | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await getWeekendSpendingComparison(planId, offerIndex);
    if ("error" in res) {
      toast.error("❌ " + res.error);
    } else {
      setData(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (linkedTransactionIds.length > 0) {
      load();
    }
  }, [planId, offerIndex, linkedTransactionIds.length]);

  const handleUnlink = async (txId: string) => {
    const res = await unlinkTransactionFromWeekendPlan(planId, txId);
    if ("error" in res) {
      toast.error("❌ " + res.error);
    } else {
      onUnlink(res.linkedTransactionIds);
      toast.success("✅ Transaction unlinked");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const isOver = data.difference > 0;

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-3">
        <h4 className="font-medium text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-500" />
          Spending Comparison
        </h4>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Estimated</p>
            <p className="text-sm font-medium">
              {formatCurrency(data.estimatedTotal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Actual</p>
            <p className="text-sm font-medium">
              {formatCurrency(data.actualTotal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Difference</p>
            <p
              className={`text-sm font-medium flex items-center justify-center gap-1 ${
                isOver ? "text-red-500" : "text-green-500"
              }`}
            >
              {isOver ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isOver ? "+" : ""}
              {formatCurrency(data.difference)}
            </p>
          </div>
        </div>

        {data.linkedTransactions.length > 0 && (
          <div className="space-y-1">
            {data.linkedTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between text-xs py-1"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate">{tx.merchant || "Unknown"}</span>
                  <span className="text-muted-foreground shrink-0">
                    {formatDate(tx.date)}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="font-medium">
                    {formatCurrency(tx.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUnlink(tx.id)}
                    className="p-0.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs w-full"
          onClick={onOpenLinkDialog}
        >
          <Link2 className="h-3 w-3 mr-1" />
          Link More Transactions
        </Button>
      </CardContent>
    </Card>
  );
}
