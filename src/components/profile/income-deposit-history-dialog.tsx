"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getIncomeDepositHistory, unlinkTransactionFromPayment } from "@/actions/profile";
import { formatCurrency } from "@/lib/utils";
import type { IncomeSourceData, IncomeDepositData } from "@/lib/types";
import { LinkPaymentTransactionDialog } from "./link-payment-transaction-dialog";
import { Loader2, Link, Unlink } from "lucide-react";
import { toast } from "sonner";

export function IncomeDepositHistoryDialog({
  source,
  open,
  onOpenChange,
}: {
  source: IncomeSourceData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [deposits, setDeposits] = useState<IncomeDepositData[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkDepositId, setLinkDepositId] = useState<string | null>(null);

  const loadHistory = () => {
    setLoading(true);
    getIncomeDepositHistory(source.id).then((data) => {
      setDeposits(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (open) loadHistory();
  }, [open, source.id]);

  const handleUnlink = async (depositId: string) => {
    const result = await unlinkTransactionFromPayment(depositId, "income");
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Transaction unlinked");
      loadHistory();
    }
  };

  return (
    <>
      <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              Deposit History — {source.name}
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <div className="py-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : deposits.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No deposits recorded yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {deposits.map((deposit, idx) => (
                  <div
                    key={deposit.id}
                    className="rounded-lg border p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">
                          {formatCurrency(deposit.amount, source.currency)}
                        </p>
                        {deposit.note && (
                          <p className="text-xs text-muted-foreground">
                            {deposit.note}
                          </p>
                        )}
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-xs text-muted-foreground">
                          {new Date(deposit.receivedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          #{deposits.length - idx}
                        </p>
                      </div>
                    </div>
                    {/* Transaction link section */}
                    <div className="flex items-center gap-2">
                      {deposit.transactionId ? (
                        <>
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Link className="h-3 w-3" />
                            {deposit.transactionMerchant || "Transaction"}
                            {deposit.transactionDate && (
                              <span className="text-muted-foreground">
                                {" "}
                                {new Date(deposit.transactionDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            )}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={() => handleUnlink(deposit.id)}
                          >
                            <Unlink className="h-3 w-3 mr-1" />
                            Unlink
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs px-2"
                          onClick={() => setLinkDepositId(deposit.id)}
                        >
                          <Link className="h-3 w-3 mr-1" />
                          Link transaction
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {linkDepositId && (
        <LinkPaymentTransactionDialog
          paymentId={linkDepositId}
          parentId={source.id}
          parentType="income"
          currency={source.currency}
          open={!!linkDepositId}
          onOpenChange={(o) => !o && setLinkDepositId(null)}
          onSuccess={loadHistory}
        />
      )}
    </>
  );
}
