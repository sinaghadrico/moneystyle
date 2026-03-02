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
import { upsertSavingsGoal, deleteSavingsGoal } from "@/actions/savings";
import type { SavingsProgress } from "@/lib/types";
import { toast } from "sonner";

export function SavingsFormDialog({
  goal,
  open,
  onOpenChange,
  onSuccess,
}: {
  goal?: SavingsProgress;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: goal?.name ?? "",
    targetAmount: goal?.targetAmount?.toString() ?? "",
    deadline: goal?.deadline
      ? new Date(goal.deadline).toISOString().slice(0, 10)
      : "",
    color: goal?.color ?? "#10b981",
  });

  const handleSave = async () => {
    setSaving(true);
    const result = await upsertSavingsGoal(
      {
        name: form.name,
        targetAmount: form.targetAmount,
        deadline: form.deadline || null,
        color: form.color,
      },
      goal?.id,
    );

    if ("error" in result) {
      toast.error("Failed to save goal");
    } else {
      toast.success(goal ? "Goal updated" : "Goal created");
      onOpenChange(false);
      onSuccess();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!goal) return;
    setSaving(true);
    await deleteSavingsGoal(goal.id);
    toast.success("Goal deleted");
    onOpenChange(false);
    onSuccess();
    setSaving(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{goal ? "Edit" : "New"} Savings Goal</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Emergency Fund"
            />
          </div>
          <div className="grid gap-2">
            <Label>Target Amount (AED)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.targetAmount}
              onChange={(e) =>
                setForm({ ...form, targetAmount: e.target.value })
              }
              placeholder="10000"
            />
          </div>
          <div className="grid gap-2">
            <Label>Deadline (optional)</Label>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-10 w-14 cursor-pointer p-1"
              />
              <Input
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </div>
        <ResponsiveDialogFooter className="flex justify-between">
          {goal && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              Delete
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name || !form.targetAmount}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
