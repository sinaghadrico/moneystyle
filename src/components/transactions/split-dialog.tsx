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
        <div className="space-y-3 py-4">
          {rows.map((row, idx) => (
            <div key={idx} className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label className={`text-xs text-muted-foreground ${idx === 0 ? "" : "sm:hidden"}`}>
                  Category
                </Label>
                <Select
                  value={row.categoryId || "none"}
                  onValueChange={(v) =>
                    updateRow(idx, "categoryId", v === "none" ? "" : v)
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Category" />
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
              <div className="sm:w-28">
                <Label className={`text-xs text-muted-foreground ${idx === 0 ? "" : "sm:hidden"}`}>
                  Person
                </Label>
                <div className="flex items-center gap-1">
                  <Select
                    value={row.personId || "me"}
                    onValueChange={(v) =>
                      updateRow(idx, "personId", v === "me" ? "" : v)
                    }
                  >
                    <SelectTrigger className="h-9">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => setShowPersonCreate(idx)}
                    type="button"
                    title="Add person"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="sm:w-28">
                <Label className={`text-xs text-muted-foreground ${idx === 0 ? "" : "sm:hidden"}`}>
                  Amount
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  className="h-9"
                  value={row.amount}
                  onChange={(e) => updateRow(idx, "amount", e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="flex-1">
                <Label className={`text-xs text-muted-foreground ${idx === 0 ? "" : "sm:hidden"}`}>
                  Note
                </Label>
                <Input
                  className="h-9"
                  value={row.description}
                  onChange={(e) =>
                    updateRow(idx, "description", e.target.value)
                  }
                  placeholder="Optional"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 self-end"
                disabled={rows.length <= 2}
                onClick={() => removeRow(idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Split
          </Button>

          <div
            className={`flex justify-between text-sm font-medium ${Math.abs(remaining) < 0.01 ? "text-green-600" : "text-destructive"}`}
          >
            <span>
              Total: {formatCurrency(splitTotal)} / {formatCurrency(totalAmount)}
            </span>
            {Math.abs(remaining) >= 0.01 && (
              <span>Remaining: {formatCurrency(remaining)}</span>
            )}
          </div>
        </div>
        <ResponsiveDialogFooter className="flex justify-between">
          {hasSplits && (
            <Button
              variant="destructive"
              onClick={handleUnsplit}
              disabled={saving}
            >
              Remove Split
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !isValid}>
              {saving ? "Saving..." : "Save Split"}
            </Button>
          </div>
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
