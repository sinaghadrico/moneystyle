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
import { Plus, Pencil, Trash2, CheckCircle, Bell, Clock } from "lucide-react";
import { toast } from "sonner";

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
  const [deleteConfirm, setDeleteConfirm] = useState<InstallmentData | null>(null);

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

      <ResponsiveDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Delete Installment</ResponsiveDialogTitle>
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
  const progress =
    installment.totalCount !== null && installment.totalCount > 0
      ? Math.round((installment.paidCount / installment.totalCount) * 100)
      : null;

  return (
    <Card className={`group ${!installment.isActive ? "opacity-60" : ""}`}>
      <CardContent className="pt-4 pb-4 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold">{installment.name}</h4>
          <Badge variant="outline" className="text-xs">
            Due {installment.dueDay}
            {getOrdinalSuffix(installment.dueDay)}
          </Badge>
        </div>
        <p className="text-lg font-bold">
          {formatCurrency(installment.amount, installment.currency)}
        </p>

        {progress !== null && (
          <div className="space-y-1">
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

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Bell className="h-3 w-3 shrink-0" />
          Remind {installment.reminderDays} day
          {installment.reminderDays !== 1 ? "s" : ""} before
        </p>

        {installment.lastPaidAt && (
          <p className="text-xs text-muted-foreground">
            Last paid {new Date(installment.lastPaidAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}

        <div className="flex items-center justify-end gap-1 pt-1">
          {installment.isActive && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs mr-auto"
              onClick={onMarkPaid}
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
