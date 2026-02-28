"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mergeTransactions } from "@/actions/merge";
import type { TransactionWithCategory } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Check } from "lucide-react";

export function MergeDialog({
  transactions,
  open,
  onOpenChange,
  onSuccess,
}: {
  transactions: TransactionWithCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [primaryId, setPrimaryId] = useState(transactions[0]?.id ?? "");
  const [merging, setMerging] = useState(false);

  const handleMerge = async () => {
    setMerging(true);
    const mergeIds = transactions
      .filter((t) => t.id !== primaryId)
      .map((t) => t.id);

    const result = await mergeTransactions(primaryId, mergeIds);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        `Merged ${result.mergedCount} transaction(s) into primary`
      );
      onSuccess();
      onOpenChange(false);
    }
    setMerging(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Merge Transactions</DialogTitle>
          <DialogDescription>
            Select the primary transaction. Others will be merged into it (their
            files will be combined, and they will be hidden from calculations).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto py-2">
          {transactions.map((tx) => (
            <button
              key={tx.id}
              onClick={() => setPrimaryId(tx.id)}
              className={`w-full rounded-lg border p-3 text-left transition-colors ${
                primaryId === tx.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {formatDate(tx.date)}
                    </span>
                    {tx.amount != null && (
                      <span className="text-sm font-bold">
                        {formatCurrency(Number(tx.amount))}
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {tx.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tx.merchant}
                    {tx.description && ` — ${tx.description}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {tx.source && <span>Source: {tx.source}</span>}
                    {tx.mediaFiles.length > 0 && (
                      <span>{tx.mediaFiles.length} file(s)</span>
                    )}
                  </div>
                </div>
                {primaryId === tx.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      Primary
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleMerge} disabled={merging}>
            {merging ? "Merging..." : `Merge ${transactions.length} into 1`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
