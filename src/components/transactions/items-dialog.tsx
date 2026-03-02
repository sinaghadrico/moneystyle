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
import {
  getTransactionItems,
  saveTransactionItems,
} from "@/actions/transactions";
import type { TransactionWithCategory } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type ItemRow = {
  name: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
};

function emptyRow(): ItemRow {
  return { name: "", quantity: "1", unitPrice: "", totalPrice: "" };
}

export function ItemsDialog({
  transaction,
  open,
  onOpenChange,
  onSaved,
}: {
  transaction: TransactionWithCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const txAmount = transaction.amount ?? 0;
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getTransactionItems(transaction.id).then((items) => {
      if (items.length > 0) {
        setRows(
          items.map((item) => ({
            name: item.name,
            quantity: item.quantity.toString(),
            unitPrice: item.unitPrice != null ? item.unitPrice.toString() : "",
            totalPrice: item.totalPrice.toString(),
          })),
        );
      } else {
        setRows([]);
      }
      setLoading(false);
    });
  }, [open, transaction.id]);

  const updateRow = (idx: number, field: keyof ItemRow, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[idx], [field]: value };

      // Auto-calculate totalPrice when quantity or unitPrice changes
      if (field === "quantity" || field === "unitPrice") {
        const qty = parseFloat(row.quantity) || 0;
        const unit = parseFloat(row.unitPrice);
        if (!isNaN(unit) && unit > 0) {
          row.totalPrice = (qty * unit).toFixed(2);
        }
      }

      next[idx] = row;
      return next;
    });
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const itemsTotal = rows.reduce(
    (sum, r) => sum + (parseFloat(r.totalPrice) || 0),
    0,
  );
  const totalMatch = Math.abs(itemsTotal - txAmount) < 0.01;

  const isValid = rows.every(
    (r) => r.name.trim() !== "" && parseFloat(r.totalPrice) > 0,
  );

  const handleSave = async () => {
    setSaving(true);
    const result = await saveTransactionItems(
      transaction.id,
      rows.map((r) => ({
        name: r.name.trim(),
        quantity: parseFloat(r.quantity) || 1,
        unitPrice: r.unitPrice ? parseFloat(r.unitPrice) : null,
        totalPrice: parseFloat(r.totalPrice),
      })),
    );

    if ("error" in result) {
      toast.error(
        typeof result.error === "string" ? result.error : "Failed to save items",
      );
    } else {
      toast.success(
        rows.length > 0
          ? `Saved ${rows.length} item${rows.length > 1 ? "s" : ""}`
          : "Items cleared",
      );
      onOpenChange(false);
      onSaved();
    }
    setSaving(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            Items — {transaction.merchant || "Transaction"}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3 py-4">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 sm:flex-row sm:items-end"
              >
                <div className="flex-1">
                  <Label
                    className={`text-xs text-muted-foreground ${idx === 0 ? "" : "sm:hidden"}`}
                  >
                    Name
                  </Label>
                  <Input
                    className="h-9"
                    value={row.name}
                    onChange={(e) => updateRow(idx, "name", e.target.value)}
                    placeholder="Item name"
                  />
                </div>
                <div className="sm:w-16">
                  <Label
                    className={`text-xs text-muted-foreground ${idx === 0 ? "" : "sm:hidden"}`}
                  >
                    Qty
                  </Label>
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    className="h-9"
                    value={row.quantity}
                    onChange={(e) => updateRow(idx, "quantity", e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="sm:w-24">
                  <Label
                    className={`text-xs text-muted-foreground ${idx === 0 ? "" : "sm:hidden"}`}
                  >
                    Price
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-9"
                    value={row.unitPrice}
                    onChange={(e) => updateRow(idx, "unitPrice", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="sm:w-24">
                  <Label
                    className={`text-xs text-muted-foreground ${idx === 0 ? "" : "sm:hidden"}`}
                  >
                    Total
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-9"
                    value={row.totalPrice}
                    onChange={(e) =>
                      updateRow(idx, "totalPrice", e.target.value)
                    }
                    placeholder="0.00"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 self-end"
                  onClick={() => removeRow(idx)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={addRow}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Item
            </Button>

            {rows.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium">
                <span>Items total: {formatCurrency(itemsTotal)}</span>
                <span className="text-muted-foreground">
                  Transaction: {formatCurrency(txAmount)}
                </span>
                <span className={totalMatch ? "text-green-600" : "text-amber-500"}>
                  {totalMatch ? "Match" : "Mismatch"}
                </span>
              </div>
            )}
          </div>
        )}

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading || (rows.length > 0 && !isValid)}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
