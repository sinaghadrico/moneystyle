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
import { getBillHistory, unlinkTransactionFromPayment } from "@/actions/profile";
import { formatCurrency } from "@/lib/utils";
import type { BillData, BillPaymentData } from "@/lib/types";
import { LinkPaymentTransactionDialog } from "./link-payment-transaction-dialog";
import { Loader2, Link, Unlink } from "lucide-react";
import { toast } from "sonner";

export function BillHistoryDialog({
  bill,
  open,
  onOpenChange,
}: {
  bill: BillData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [payments, setPayments] = useState<BillPaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkPaymentId, setLinkPaymentId] = useState<string | null>(null);

  const loadHistory = () => {
    setLoading(true);
    getBillHistory(bill.id).then((data) => {
      setPayments(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (open) loadHistory();
  }, [open, bill.id]);

  const handleUnlink = async (paymentId: string) => {
    const result = await unlinkTransactionFromPayment(paymentId, "bill");
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
              Payment History — {bill.name}
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <div className="py-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : payments.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No payments recorded yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {payments.map((payment, idx) => (
                  <div
                    key={payment.id}
                    className="rounded-lg border p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">
                          {formatCurrency(payment.amount, bill.currency)}
                        </p>
                        {payment.note && (
                          <p className="text-xs text-muted-foreground">
                            {payment.note}
                          </p>
                        )}
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.paidAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          #{payments.length - idx}
                        </p>
                      </div>
                    </div>
                    {/* Transaction link section */}
                    <div className="flex items-center gap-2">
                      {payment.transactionId ? (
                        <>
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Link className="h-3 w-3" />
                            {payment.transactionMerchant || "Transaction"}
                            {payment.transactionDate && (
                              <span className="text-muted-foreground">
                                {" "}
                                {new Date(payment.transactionDate).toLocaleDateString("en-US", {
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
                            onClick={() => handleUnlink(payment.id)}
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
                          onClick={() => setLinkPaymentId(payment.id)}
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

      {linkPaymentId && (
        <LinkPaymentTransactionDialog
          paymentId={linkPaymentId}
          parentId={bill.id}
          parentType="bill"
          currency={bill.currency}
          open={!!linkPaymentId}
          onOpenChange={(o) => !o && setLinkPaymentId(null)}
          onSuccess={loadHistory}
        />
      )}
    </>
  );
}
