"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { getInstallmentHistory } from "@/actions/profile";
import { formatCurrency } from "@/lib/utils";
import type { InstallmentData, InstallmentPaymentData } from "@/lib/types";
import { Loader2 } from "lucide-react";

export function InstallmentHistoryDialog({
  installment,
  open,
  onOpenChange,
}: {
  installment: InstallmentData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [payments, setPayments] = useState<InstallmentPaymentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getInstallmentHistory(installment.id).then((data) => {
        setPayments(data);
        setLoading(false);
      });
    }
  }, [open, installment.id]);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            Payment History — {installment.name}
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
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {formatCurrency(payment.amount, installment.currency)}
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
              ))}
            </div>
          )}
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
