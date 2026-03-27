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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { incrementPaidCount } from "@/actions/installments";
import { getSuggestedTransactions } from "@/actions/profile";
import type { SuggestedTransaction } from "@/lib/types";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import type { InstallmentData } from "@/lib/types";
import { ChevronDown, ChevronUp, Link, Loader2, Star } from "lucide-react";

export function RecordPaymentDialog({
  installment,
  open,
  onOpenChange,
  onSuccess,
}: {
  installment: InstallmentData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState(installment.amount.toString());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Link transaction state
  const [linkOpen, setLinkOpen] = useState(false);
  const [transactions, setTransactions] = useState<SuggestedTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  useEffect(() => {
    if (linkOpen && transactions.length === 0) {
      setLoadingTx(true);
      getSuggestedTransactions(installment.id, "installment").then((data) => {
        setTransactions(data);
        setLoadingTx(false);
      });
    }
  }, [linkOpen, installment.id, transactions.length]);

  const handleSave = async () => {
    setError("");
    setSaving(true);

    const result = await incrementPaidCount(installment.id, {
      amount: parseFloat(amount),
      note: note.trim() || null,
      transactionId: selectedTxId,
    });

    if (result.error) {
      const errors = result.error;
      if (typeof errors === "string") {
        setError(errors);
      } else {
        setError(
          Object.values(errors as Record<string, string[]>)
            .flat()
            .join(", ")
        );
      }
    } else if (result.completed) {
      toast.success("All installments paid! Marked as inactive.");
      onOpenChange(false);
      onSuccess();
    } else {
      toast.success("Payment recorded");
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
          <ResponsiveDialogTitle>
            Record Payment — {installment.name}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Amount ({installment.currency})</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="grid gap-2">
            <Label>Note (optional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. March bill"
            />
          </div>

          {/* Link Transaction Section */}
          <div className="border rounded-lg">
            <button
              type="button"
              className="flex w-full items-center justify-between p-3 text-sm font-medium"
              onClick={() => setLinkOpen(!linkOpen)}
            >
              <span className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Link Transaction
                {selectedTxId && (
                  <span className="text-xs text-muted-foreground">(1 selected)</span>
                )}
              </span>
              {linkOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {linkOpen && (
              <div className="border-t px-3 pb-3 pt-2">
                {loadingTx ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : transactions.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    No unlinked transactions found.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {selectedTxId && (
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:underline mb-1"
                        onClick={() => setSelectedTxId(null)}
                      >
                        Clear selection
                      </button>
                    )}
                    {suggested.length > 0 && (
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 pt-1">
                        <Star className="h-3 w-3" /> Suggested
                      </p>
                    )}
                    {suggested.map((tx) => (
                      <TransactionOption
                        key={tx.id}
                        tx={tx}
                        selected={selectedTxId === tx.id}
                        currency={installment.currency}
                        onSelect={() => setSelectedTxId(selectedTxId === tx.id ? null : tx.id)}
                      />
                    ))}
                    {others.length > 0 && suggested.length > 0 && (
                      <p className="text-xs font-medium text-muted-foreground pt-2">
                        Other transactions
                      </p>
                    )}
                    {others.map((tx) => (
                      <TransactionOption
                        key={tx.id}
                        tx={tx}
                        selected={selectedTxId === tx.id}
                        currency={installment.currency}
                        onSelect={() => setSelectedTxId(selectedTxId === tx.id ? null : tx.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || !amount}>
              {saving ? "Saving..." : "Record"}
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
