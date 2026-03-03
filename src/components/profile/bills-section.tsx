"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const handleDelete = async (id: string) => {
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
              onDelete={() => handleDelete(bill.id)}
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
                  onDelete={() => handleDelete(bill.id)}
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
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold">{bill.name}</h4>
              <span className="text-lg font-bold">
                ~{formatCurrency(bill.amount, bill.currency)}
              </span>
              <Badge variant="outline" className="text-xs">
                Due {bill.dueDay}
                {getOrdinalSuffix(bill.dueDay)}
              </Badge>
            </div>

            {bill.lastPaidAt && (
              <p className="text-xs text-muted-foreground">
                Last paid{" "}
                {bill.lastPaidAmount !== null &&
                  formatCurrency(bill.lastPaidAmount, bill.currency) + " on "}
                {new Date(bill.lastPaidAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}

            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Bell className="h-3 w-3" />
              Remind {bill.reminderDays} day
              {bill.reminderDays !== 1 ? "s" : ""} before
            </p>
          </div>

          <div className="flex items-center gap-1">
            {bill.isActive && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={onRecordPayment}
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Record Payment
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
            <div className="flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
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
          </div>
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
