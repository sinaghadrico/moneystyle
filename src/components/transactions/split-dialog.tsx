"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { splitTransaction, unsplitTransaction } from "@/actions/transactions";
import { PersonFormDialog } from "@/components/persons/person-form-dialog";
import type { TransactionWithCategory } from "@/lib/types";
import type { Category, Person } from "@prisma/client";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type SplitRow = {
  categoryId: string;
  personId: string;
  amount: string;
  description: string;
};

export function SplitDialog({
  transaction,
  categories,
  persons: initialPersons,
  open,
  onOpenChange,
  onSuccess,
}: {
  transaction: TransactionWithCategory;
  categories: Category[];
  persons: Person[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const totalAmount = transaction.amount ?? 0;
  const hasSplits = transaction.splits && transaction.splits.length > 0;

  const [persons, setPersons] = useState<Person[]>(initialPersons);
  const [saving, setSaving] = useState(false);
  const [showPersonCreate, setShowPersonCreate] = useState<number | null>(null);
  const [rows, setRows] = useState<SplitRow[]>(() => {
    if (hasSplits && transaction.splits) {
      return transaction.splits.map((s) => ({
        categoryId: s.categoryId ?? "",
        personId: s.personId ?? "",
        amount: s.amount.toString(),
        description: s.description ?? "",
      }));
    }
    return [
      {
        categoryId: transaction.categoryId ?? "",
        personId: "",
        amount: "",
        description: "",
      },
      { categoryId: "", personId: "", amount: "", description: "" },
    ];
  });

  const splitTotal = rows.reduce(
    (sum, r) => sum + (parseFloat(r.amount) || 0),
    0,
  );
  const remaining = Math.round((totalAmount - splitTotal) * 100) / 100;
  const isValid =
    rows.length >= 2 &&
    rows.every((r) => parseFloat(r.amount) > 0) &&
    Math.abs(remaining) < 0.01;

  const updateRow = (idx: number, field: keyof SplitRow, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { categoryId: "", personId: "", amount: remaining > 0 ? remaining.toString() : "", description: "" },
    ]);
  };

  const removeRow = (idx: number) => {
    if (rows.length <= 2) return;
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await splitTransaction(transaction.id, {
      splits: rows.map((r) => ({
        categoryId: r.categoryId || null,
        personId: r.personId || null,
        amount: parseFloat(r.amount),
        description: r.description || null,
      })),
    });

    if ("error" in result) {
      toast.error(`❌ ${typeof result.error === "string" ? result.error : "Failed to split"}`);
    } else {
      toast.success("✂️ Transaction split");
      onOpenChange(false);
      onSuccess();
    }
    setSaving(false);
  };

  const handleUnsplit = async () => {
    setSaving(true);
    const result = await unsplitTransaction(transaction.id);
    if ("error" in result) {
      toast.error(`❌ ${String(result.error)}`);
    } else {
      toast.success("🗑️ Split removed");
      onOpenChange(false);
      onSuccess();
    }
    setSaving(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            Split Transaction — {formatCurrency(totalAmount)}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="space-y-3 py-2">
          {rows.map((row, idx) => (
            <div key={idx} className="rounded-lg border bg-muted/30 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Split {idx + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={rows.length <= 2}
                  onClick={() => removeRow(idx)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-0.5">
                  <Label className="text-[10px] text-muted-foreground">Category</Label>
                  <Select
                    value={row.categoryId || "none"}
                    onValueChange={(v) =>
                      updateRow(idx, "categoryId", v === "none" ? "" : v)
                    }
                  >
                    <SelectTrigger className="h-8 w-full text-sm">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-0.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-muted-foreground">Person</Label>
                    <button
                      type="button"
                      className="text-[10px] text-primary hover:underline"
                      onClick={() => setShowPersonCreate(idx)}
                    >
                      + New
                    </button>
                  </div>
                  <Select
                    value={row.personId || "me"}
                    onValueChange={(v) =>
                      updateRow(idx, "personId", v === "me" ? "" : v)
                    }
                  >
                    <SelectTrigger className="h-8 w-full text-sm">
                      <SelectValue placeholder="Me" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="me">Me</SelectItem>
                      {persons.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-0.5">
                  <Label className="text-[10px] text-muted-foreground">Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="h-8 text-sm"
                    value={row.amount}
                    onChange={(e) => updateRow(idx, "amount", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-0.5">
                  <Label className="text-[10px] text-muted-foreground">Note</Label>
                  <Input
                    className="h-8 text-sm"
                    value={row.description}
                    onChange={(e) =>
                      updateRow(idx, "description", e.target.value)
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={addRow}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Split
            </Button>
            <div
              className={`text-xs font-medium ${Math.abs(remaining) < 0.01 ? "text-green-600" : "text-destructive"}`}
            >
              {formatCurrency(splitTotal)} / {formatCurrency(totalAmount)}
              {Math.abs(remaining) >= 0.01 && (
                <span className="ml-1.5">({formatCurrency(remaining)} left)</span>
              )}
            </div>
          </div>
        </div>
        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || !isValid}>
              {saving ? "Saving..." : "Save Split"}
            </Button>
          </div>
          {hasSplits && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleUnsplit}
              disabled={saving}
            >
              Remove Split
            </Button>
          )}
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>

      {showPersonCreate !== null && (
        <PersonFormDialog
          open
          onOpenChange={(o) => !o && setShowPersonCreate(null)}
          onSuccess={(created) => {
            if (created) {
              setPersons((prev) => [
                ...prev,
                { id: created.id, name: created.name } as Person,
              ].sort((a, b) => a.name.localeCompare(b.name)));
              updateRow(showPersonCreate, "personId", created.id);
            }
            setShowPersonCreate(null);
          }}
        />
      )}
    </ResponsiveDialog>
  );
}
