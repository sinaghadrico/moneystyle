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
import { addToSavings } from "@/actions/savings";
import type { SavingsProgress } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export function AddSavingsDialog({
  goal,
  open,
  onOpenChange,
  onSuccess,
}: {
  goal: SavingsProgress;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [amount, setAmount] = useState("");

  const remaining = goal.targetAmount - goal.currentAmount;

  const handleAdd = async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;

    setSaving(true);
    const result = await addToSavings(goal.id, num);

    if ("error" in result) {
      toast.error("❌ " + result.error);
    } else if (result.completed) {
      toast.success(`🎯 Goal "${goal.name}" completed!`);
      onOpenChange(false);
      onSuccess();
    } else {
      toast.success(`✅ Added ${formatCurrency(num, goal.currency)} to ${goal.name}`);
      onOpenChange(false);
      onSuccess();
    }
    setSaving(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Add to {goal.name}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Current: {formatCurrency(goal.currentAmount, goal.currency)}</span>
            <span>Target: {formatCurrency(goal.targetAmount, goal.currency)}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(goal.percentage, 100)}%`,
                backgroundColor: goal.color,
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label>Amount ({goal.currency})</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={remaining > 0 ? `Remaining: ${formatCurrency(remaining, goal.currency)}` : "0"}
            />
          </div>
          {remaining > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(remaining.toString())}
            >
              Fill remaining ({formatCurrency(remaining, goal.currency)})
            </Button>
          )}
        </div>
        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleAdd}
              disabled={saving || !amount || parseFloat(amount) <= 0}
            >
              {saving ? "Adding..." : "Add"}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
