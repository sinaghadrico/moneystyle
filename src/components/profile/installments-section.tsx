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
import { InstallmentDialog } from "./installment-dialog";
import { InstallmentHistoryDialog } from "./installment-history-dialog";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { deleteInstallment } from "@/actions/profile";
import { formatCurrency } from "@/lib/utils";
import type { InstallmentData } from "@/lib/types";
import { renderInstructions } from "./payment-instructions-display";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Bell,
  Clock,
  Link,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import NextLink from "next/link";
import { getInstallmentHistory } from "@/actions/profile";
import type { InstallmentPaymentData } from "@/lib/types";

export function InstallmentsSection({
  installments,
  onRefresh,
}: {
  installments: InstallmentData[];
  onRefresh: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<InstallmentData | null>(null);
  const [historyItem, setHistoryItem] = useState<InstallmentData | null>(null);
  const [payItem, setPayItem] = useState<InstallmentData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<InstallmentData | null>(
    null,
  );

  const handleDelete = async (id: string) => {
    setDeleteConfirm(null);
    await deleteInstallment(id);
    toast.success("🗑️ Installment deleted");
    onRefresh();
  };

  const activeInstallments = installments.filter((i) => i.isActive);
  const inactiveInstallments = installments.filter((i) => !i.isActive);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">📋 Installments</h3>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {installments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            📋 No installments yet. Track loans and fixed-payment plans.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeInstallments.map((inst) => (
            <InstallmentCard
              key={inst.id}
              installment={inst}
              onEdit={() => setEditItem(inst)}
              onDelete={() => setDeleteConfirm(inst)}
              onMarkPaid={() => setPayItem(inst)}
              onShowHistory={() => setHistoryItem(inst)}
            />
          ))}
          {inactiveInstallments.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground pt-2">
                Completed / Inactive
              </p>
              {inactiveInstallments.map((inst) => (
                <InstallmentCard
                  key={inst.id}
                  installment={inst}
                  onEdit={() => setEditItem(inst)}
                  onDelete={() => setDeleteConfirm(inst)}
                  onMarkPaid={() => setPayItem(inst)}
                  onShowHistory={() => setHistoryItem(inst)}
                />
              ))}
            </>
          )}
        </div>
      )}

      {showCreate && (
        <InstallmentDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          onSuccess={onRefresh}
        />
      )}

      {editItem && (
        <InstallmentDialog
          installment={editItem}
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          onSuccess={onRefresh}
        />
      )}

      {historyItem && (
        <InstallmentHistoryDialog
          installment={historyItem}
          open={!!historyItem}
          onOpenChange={(open) => !open && setHistoryItem(null)}
        />
      )}

      {payItem && (
        <RecordPaymentDialog
          installment={payItem}
          open={!!payItem}
          onOpenChange={(open) => !open && setPayItem(null)}
          onSuccess={onRefresh}
        />
      )}

      <ResponsiveDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Delete Installment</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <p className="text-sm text-muted-foreground px-1">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {deleteConfirm?.name}
            </span>
            ? This cannot be undone.
          </p>
          <ResponsiveDialogFooter>
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirm(null)}
              >
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

function InstallmentCard({
  installment,
  onEdit,
  onDelete,
  onMarkPaid,
  onShowHistory,
}: {
  installment: InstallmentData;
  onEdit: () => void;
  onDelete: () => void;
  onMarkPaid: () => void;
  onShowHistory: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"instructions" | "linked" | null>(
    null,
  );
  const [linkedPayments, setLinkedPayments] = useState<
    InstallmentPaymentData[]
  >([]);
  const [loadingLinked, setLoadingLinked] = useState(false);

  const hasInstructions = !!installment.paymentInstructions;
  const hasLinked = installment.paidCount > 0;

  const handleTabClick = async (tab: "instructions" | "linked") => {
    if (activeTab === tab) {
      setActiveTab(null);
      return;
    }
    if (tab === "linked" && linkedPayments.length === 0) {
      setLoadingLinked(true);
      const history = await getInstallmentHistory(installment.id);
      setLinkedPayments(history.filter((p) => p.transactionId));
      setLoadingLinked(false);
    }
    setActiveTab(tab);
  };

  const progress =
    installment.totalCount !== null && installment.totalCount > 0
      ? Math.round((installment.paidCount / installment.totalCount) * 100)
      : null;

  return (
    <Card className={`group ${!installment.isActive ? "opacity-60" : ""}`}>
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold">{installment.name}</h4>
          <Badge variant="outline" className="text-xs">
            Due {installment.dueDay}
            {getOrdinalSuffix(installment.dueDay)}
          </Badge>
        </div>

        {/* Amount + progress */}
        <div>
          <p className="text-lg font-bold">
            {formatCurrency(installment.amount, installment.currency)}
          </p>
          {progress !== null && (
            <div className="space-y-1 mt-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {installment.paidCount}/{installment.totalCount} paid
              </p>
            </div>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Bell className="h-3 w-3 shrink-0" />
            {installment.reminderDays}d before
          </span>
          {installment.lastPaidAt && (
            <span>
              Last paid{" "}
              {new Date(installment.lastPaidAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Tabs: How to pay / Linked Transactions */}
        {(hasInstructions || hasLinked) && (
          <div className="border-t pt-2">
            <div className="flex gap-1">
              {hasInstructions && (
                <button
                  type="button"
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "instructions"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => handleTabClick("instructions")}
                >
                  <CreditCard className="h-3.5 w-3.5 shrink-0" />
                  How to pay
                </button>
              )}
              {hasLinked && (
                <button
                  type="button"
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === "linked"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => handleTabClick("linked")}
                >
                  <Link className="h-3.5 w-3.5 shrink-0" />
                  Linked
                </button>
              )}
            </div>

            {activeTab === "instructions" &&
              installment.paymentInstructions && (
                <div className="mt-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-xs leading-relaxed whitespace-pre-wrap">
                  {renderInstructions(installment.paymentInstructions)}
                </div>
              )}

            {activeTab === "linked" && (
              <div className="mt-2 space-y-1">
                {loadingLinked ? (
                  <p className="text-xs text-muted-foreground px-1">
                    Loading...
                  </p>
                ) : linkedPayments.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-1">
                    No linked transactions.
                  </p>
                ) : (
                  linkedPayments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-xs bg-muted/50 rounded-md px-2.5 py-1.5"
                    >
                      <span className="truncate font-medium">
                        {p.transactionMerchant || "Transaction"}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 ml-2 text-muted-foreground">
                        <span>
                          {p.transactionDate &&
                            new Date(p.transactionDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(p.amount, installment.currency)}
                        </span>
                        {p.transactionId && (
                          <NextLink
                            href={`/transactions?tx=${p.transactionId}`}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </NextLink>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 border-t pt-2">
          {installment.isActive && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs mr-auto"
              onClick={onMarkPaid}
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Paid ?
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onShowHistory}
            title="Payment history"
          >
            <Clock className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onEdit}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
