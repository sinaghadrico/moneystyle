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
import { BillDialog } from "./bill-dialog";
import { BillHistoryDialog } from "./bill-history-dialog";
import { RecordBillPaymentDialog } from "./record-bill-payment-dialog";
import { deleteBill } from "@/actions/bills";
import { formatCurrency } from "@/lib/utils";
import type { BillData } from "@/lib/types";
import { renderInstructions } from "./payment-instructions-display";
import { Plus, Pencil, Trash2, CheckCircle, Bell, Clock, Link, CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import NextLink from "next/link";
import { getBillHistory } from "@/actions/bills";
import type { BillPaymentData } from "@/lib/types";

export function BillsSection({
  bills,
  onRefresh,
}: {
  bills: BillData[];
  onRefresh: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<BillData | null>(null);
  const [historyItem, setHistoryItem] = useState<BillData | null>(null);
  const [payItem, setPayItem] = useState<BillData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<BillData | null>(null);

  const handleDelete = async (id: string) => {
    setDeleteConfirm(null);
    await deleteBill(id);
    toast.success("🗑️ Bill deleted");
    onRefresh();
  };

  const activeBills = bills.filter((b) => b.isActive);
  const inactiveBills = bills.filter((b) => !b.isActive);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">📄 Bills</h3>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {bills.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            📄 No bills yet. Track recurring bills like electricity, water, and
            internet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeBills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onEdit={() => setEditItem(bill)}
              onDelete={() => setDeleteConfirm(bill)}
              onRecordPayment={() => setPayItem(bill)}
              onShowHistory={() => setHistoryItem(bill)}
            />
          ))}
          {inactiveBills.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground pt-2">Inactive</p>
              {inactiveBills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onEdit={() => setEditItem(bill)}
                  onDelete={() => setDeleteConfirm(bill)}
                  onRecordPayment={() => setPayItem(bill)}
                  onShowHistory={() => setHistoryItem(bill)}
                />
              ))}
            </>
          )}
        </div>
      )}

      {showCreate && (
        <BillDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          onSuccess={onRefresh}
        />
      )}

      {editItem && (
        <BillDialog
          bill={editItem}
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          onSuccess={onRefresh}
        />
      )}

      {historyItem && (
        <BillHistoryDialog
          bill={historyItem}
          open={!!historyItem}
          onOpenChange={(open) => !open && setHistoryItem(null)}
        />
      )}

      {payItem && (
        <RecordBillPaymentDialog
          bill={payItem}
          open={!!payItem}
          onOpenChange={(open) => !open && setPayItem(null)}
          onSuccess={onRefresh}
        />
      )}

      <ResponsiveDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Delete Bill</ResponsiveDialogTitle>
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

function BillCard({
  bill,
  onEdit,
  onDelete,
  onRecordPayment,
  onShowHistory,
}: {
  bill: BillData;
  onEdit: () => void;
  onDelete: () => void;
  onRecordPayment: () => void;
  onShowHistory: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"instructions" | "linked" | null>(null);
  const [linkedPayments, setLinkedPayments] = useState<BillPaymentData[]>([]);
  const [loadingLinked, setLoadingLinked] = useState(false);

  const hasInstructions = !!bill.paymentInstructions;
  const hasLinked = !!bill.lastPaidAt;

  const handleTabClick = async (tab: "instructions" | "linked") => {
    if (activeTab === tab) {
      setActiveTab(null);
      return;
    }
    if (tab === "linked" && linkedPayments.length === 0) {
      setLoadingLinked(true);
      const history = await getBillHistory(bill.id);
      setLinkedPayments(history.filter((p) => p.transactionId));
      setLoadingLinked(false);
    }
    setActiveTab(tab);
  };

  return (
    <Card className={`group ${!bill.isActive ? "opacity-60" : ""}`}>
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold">{bill.name}</h4>
          <Badge variant="outline" className="text-xs">
            Due {bill.dueDay}
            {getOrdinalSuffix(bill.dueDay)}
          </Badge>
        </div>

        {/* Amount */}
        <p className="text-lg font-bold">
          ~{formatCurrency(bill.amount, bill.currency)}
        </p>

        {/* Meta info */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Bell className="h-3 w-3 shrink-0" />
            {bill.reminderDays}d before
          </span>
          {bill.lastPaidAt && (
            <span>
              Last paid {bill.lastPaidAmount !== null && formatCurrency(bill.lastPaidAmount, bill.currency) + " on "}
              {new Date(bill.lastPaidAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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

            {activeTab === "instructions" && bill.paymentInstructions && (
              <div className="mt-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-xs leading-relaxed whitespace-pre-wrap">
                {renderInstructions(bill.paymentInstructions)}
              </div>
            )}

            {activeTab === "linked" && (
              <div className="mt-2 space-y-1">
                {loadingLinked ? (
                  <p className="text-xs text-muted-foreground px-1">Loading...</p>
                ) : linkedPayments.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-1">No linked transactions.</p>
                ) : (
                  linkedPayments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs bg-muted/50 rounded-md px-2.5 py-1.5">
                      <span className="truncate font-medium">
                        {p.transactionMerchant || "Transaction"}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 ml-2 text-muted-foreground">
                        <span>
                          {p.transactionDate && new Date(p.transactionDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(p.amount, bill.currency)}
                        </span>
                        {p.transactionId && (
                          <NextLink href={`/transactions?tx=${p.transactionId}`} className="text-muted-foreground hover:text-foreground transition-colors">
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
          {bill.isActive && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs mr-auto"
              onClick={onRecordPayment}
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Paid
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
