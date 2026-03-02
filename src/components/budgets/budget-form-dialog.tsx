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
import { upsertBudget, deleteBudget } from "@/actions/budgets";
import { toast } from "sonner";

type BudgetFormProps = {
  categoryId: string;
  categoryName: string;
  existingLimit?: number;
  existingThreshold?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function BudgetFormDialog({
  categoryId,
  categoryName,
  existingLimit,
  existingThreshold,
  open,
  onOpenChange,
  onSuccess,
}: BudgetFormProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    monthlyLimit: existingLimit?.toString() ?? "",
    alertThreshold: (existingThreshold ?? 80).toString(),
  });

  const handleSave = async () => {
    setSaving(true);
    const result = await upsertBudget({
      categoryId,
      monthlyLimit: Number(form.monthlyLimit),
      alertThreshold: Number(form.alertThreshold),
    });
    setSaving(false);

    if ("error" in result && result.error) {
      const msg = Object.values(result.error as Record<string, string[]>).flat().join(", ");
      toast.error(msg);
    } else {
      toast.success(`Budget set for ${categoryName}`);
      onOpenChange(false);
      onSuccess();
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    await deleteBudget(categoryId);
    setSaving(false);
    toast.success(`Budget removed for ${categoryName}`);
    onOpenChange(false);
    onSuccess();
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Budget for {categoryName}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Monthly Limit (AED)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.monthlyLimit}
              onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })}
              placeholder="e.g. 5000"
            />
          </div>
          <div className="grid gap-2">
            <Label>Alert Threshold (%)</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={form.alertThreshold}
              onChange={(e) =>
                setForm({ ...form, alertThreshold: e.target.value })
              }
              placeholder="80"
            />
            <p className="text-xs text-muted-foreground">
              You&apos;ll be warned when spending reaches this % of the limit
            </p>
          </div>
        </div>
        <ResponsiveDialogFooter>
          {existingLimit && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
              className="mr-auto"
            >
              Remove Budget
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.monthlyLimit}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
