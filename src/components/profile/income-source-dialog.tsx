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
import { Switch } from "@/components/ui/switch";
import { CurrencySelect } from "@/components/ui/currency-select";
import { createIncomeSource, updateIncomeSource } from "@/actions/profile";
import { toast } from "sonner";
import type { IncomeSourceData } from "@/lib/types";

export function IncomeSourceDialog({
  source,
  open,
  onOpenChange,
  onSuccess,
}: {
  source?: IncomeSourceData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const isEdit = !!source?.id;
  const [name, setName] = useState(source?.name ?? "");
  const [amount, setAmount] = useState(source?.amount?.toString() ?? "");
  const [depositDay, setDepositDay] = useState(
    source?.depositDay?.toString() ?? "1"
  );
  const [currency, setCurrency] = useState(source?.currency ?? "AED");
  const [isActive, setIsActive] = useState(source?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaving(true);

    const data = {
      name: name.trim(),
      amount: parseFloat(amount),
      depositDay: parseInt(depositDay),
      currency,
      isActive,
    };

    const result = isEdit
      ? await updateIncomeSource(source!.id, data)
      : await createIncomeSource(data);

    if (result.error) {
      const errors = result.error;
      if (typeof errors === "string") {
        setError(errors);
      } else {
        setError(
          Object.values(errors as Record<string, string[]>)
            .flat()
            .join(", ")
        );
      }
    } else {
      toast.success(isEdit ? "Income source updated" : "Income source added");
      onOpenChange(false);
      onSuccess();
    }
    setSaving(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {isEdit ? "Edit Income Source" : "Add Income Source"}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Salary, Freelance"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label>Currency</Label>
              <CurrencySelect value={currency} onValueChange={setCurrency} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Deposit Day (1-31)</Label>
            <Input
              type="number"
              min={1}
              max={31}
              value={depositDay}
              onChange={(e) => setDepositDay(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label>Active</Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim() || !amount}
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Add"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
