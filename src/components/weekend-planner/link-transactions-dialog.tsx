"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { getTransactions } from "@/actions/transactions";
import { linkTransactionsToWeekendPlan } from "@/actions/weekend-planner";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { TransactionWithCategory } from "@/lib/types";

export function LinkTransactionsDialog({
  open,
  onOpenChange,
  planId,
  linkedTransactionIds,
  onLinked,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  linkedTransactionIds: string[];
  onLinked: (ids: string[]) => void;
}) {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await getTransactions({
        type: "expense",
        dateFrom: thirtyDaysAgo.toISOString().split("T")[0],
        pageSize: 100,
        sortBy: "date",
        sortOrder: "desc",
      });

      setTransactions(result.data);
      // Pre-select already linked
      setSelected(new Set(linkedTransactionIds));
      setLoading(false);
    };

    load();
  }, [open, linkedTransactionIds]);

  const toggleSelection = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLink = async () => {
    const newIds = Array.from(selected).filter(
      (id) => !linkedTransactionIds.includes(id)
    );
    if (newIds.length === 0) {
      onOpenChange(false);
      return;
    }

    setSaving(true);
    const res = await linkTransactionsToWeekendPlan({
      planId,
      transactionIds: newIds,
    });

    if ("error" in res) {
      toast.error("❌ " + res.error);
    } else {
      onLinked(res.linkedTransactionIds);
      toast.success(`✅ Linked ${newIds.length} transaction(s)`);
      onOpenChange(false);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Link Transactions</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No recent expense transactions found.
          </p>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {transactions.map((tx) => {
                const isLinked = linkedTransactionIds.includes(tx.id);
                const isSelected = selected.has(tx.id);
                return (
                  <label
                    key={tx.id}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-muted/50 ${
                      isLinked ? "opacity-60" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => !isLinked && toggleSelection(tx.id)}
                      disabled={isLinked}
                      className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input hover:border-primary"
                      } ${isLinked ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tx.merchant || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.date)} &middot;{" "}
                        {tx.category?.name ?? "—"}
                      </p>
                    </div>
                    <span className="text-sm font-medium shrink-0">
                      {formatCurrency(tx.amount ?? 0)}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleLink} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Link Selected
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
