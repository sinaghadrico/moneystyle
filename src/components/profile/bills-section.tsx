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
import { deleteBill } from "@/actions/profile";
import { formatCurrency } from "@/lib/utils";
import type { BillData } from "@/lib/types";
import { Plus, Pencil, Trash2, CheckCircle, Bell, Clock } from "lucide-react";
import { toast } from "sonner";

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
  return (
    <Card className={`group ${!bill.isActive ? "opacity-60" : ""}`}>
      <CardContent className="pt-4 pb-4 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold">{bill.name}</h4>
          <Badge variant="outline" className="text-xs">
            Due {bill.dueDay}
            {getOrdinalSuffix(bill.dueDay)}
          </Badge>
        </div>
        <p className="text-lg font-bold">
          ~{formatCurrency(bill.amount, bill.currency)}
        </p>

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Bell className="h-3 w-3 shrink-0" />
          Remind {bill.reminderDays} day
          {bill.reminderDays !== 1 ? "s" : ""} before
        </p>

        {bill.lastPaidAt && (
          <p className="text-xs text-muted-foreground">
            Last paid {bill.lastPaidAmount !== null && formatCurrency(bill.lastPaidAmount, bill.currency) + " on "}
            {new Date(bill.lastPaidAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        )}

        <div className="flex items-center justify-end gap-1 pt-1">
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
