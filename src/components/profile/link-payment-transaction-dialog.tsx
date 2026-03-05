"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  getSuggestedTransactions,
  getSuggestedIncomeTransactions,
  linkTransactionToPayment,
} from "@/actions/profile";
import type { SuggestedTransaction } from "@/actions/profile";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Star } from "lucide-react";

export function LinkPaymentTransactionDialog({
  paymentId,
  parentId,
  parentType,
  currency,
  open,
  onOpenChange,
  onSuccess,
}: {
  paymentId: string;
  parentId: string;
  parentType: "installment" | "bill" | "income";
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [transactions, setTransactions] = useState<SuggestedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      const fetchFn = parentType === "income"
        ? getSuggestedIncomeTransactions(parentId)
        : getSuggestedTransactions(parentId, parentType);
      fetchFn.then((data) => {
        setTransactions(data);
        setLoading(false);
      });
    }
  }, [open, parentId, parentType]);

  const handleLink = async () => {
    if (!selectedTxId) return;
    setSaving(true);
    const result = await linkTransactionToPayment(paymentId, parentType, selectedTxId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Transaction linked");
      onOpenChange(false);
      onSuccess();
    }
    setSaving(false);
  };

  const suggested = transactions.filter((t) => t.isSuggested);
  const others = transactions.filter((t) => !t.isSuggested);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Link Transaction</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="py-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No unlinked transactions found.
            </p>
          ) : (
            <div className="max-h-[50vh] overflow-y-auto space-y-1">
              {suggested.length > 0 && (
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 pb-1">
                  <Star className="h-3 w-3" /> Suggested matches
                </p>
              )}
              {suggested.map((tx) => (
                <TransactionOption
                  key={tx.id}
                  tx={tx}
                  selected={selectedTxId === tx.id}
                  currency={currency}
                  onSelect={() => setSelectedTxId(selectedTxId === tx.id ? null : tx.id)}
                />
              ))}
              {others.length > 0 && suggested.length > 0 && (
                <p className="text-xs font-medium text-muted-foreground pt-2 pb-1">
                  Other transactions
                </p>
              )}
              {others.map((tx) => (
                <TransactionOption
                  key={tx.id}
                  tx={tx}
                  selected={selectedTxId === tx.id}
                  currency={currency}
                  onSelect={() => setSelectedTxId(selectedTxId === tx.id ? null : tx.id)}
                />
              ))}
            </div>
          )}
        </div>
        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleLink}
              disabled={saving || !selectedTxId}
            >
              {saving ? "Linking..." : "Link"}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function TransactionOption({
  tx,
  selected,
  currency,
  onSelect,
}: {
  tx: SuggestedTransaction;
  selected: boolean;
  currency: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`w-full flex items-center justify-between rounded-md border p-2 text-left text-sm transition-colors ${
        selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
      onClick={onSelect}
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-xs">
          {tx.merchant || tx.description || "Transaction"}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </div>
      <p className="text-xs font-medium shrink-0 ml-2">
        {formatCurrency(tx.amount, currency)}
      </p>
    </button>
  );
}
