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
import { useAppSettings } from "@/components/settings/settings-provider";
import { Trash2 } from "lucide-react";

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
  const { settings } = useAppSettings();
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
      toast.error("❌ " + msg);
    } else {
      toast.success(`🎯 Budget set for ${categoryName}`);
      onOpenChange(false);
      onSuccess();
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    await deleteBudget(categoryId);
    setSaving(false);
    toast.success(`🗑️ Budget removed for ${categoryName}`);
    onOpenChange(false);
    onSuccess();
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <div className="flex items-center justify-between">
            <ResponsiveDialogTitle>Budget for {categoryName}</ResponsiveDialogTitle>
            {existingLimit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
                disabled={saving}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </ResponsiveDialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label>Monthly Limit ({settings.currency})</Label>
              <Input
                type="number"
                step="0.01"
                value={form.monthlyLimit}
                onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })}
                placeholder="e.g. 5000"
              />
            </div>
            <div className="grid gap-1">
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
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            You&apos;ll be warned when spending reaches this % of the limit
          </p>
        </div>
        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || !form.monthlyLimit}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
