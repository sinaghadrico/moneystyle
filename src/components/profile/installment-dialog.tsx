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
import { createInstallment, updateInstallment } from "@/actions/profile";
import { toast } from "sonner";
import type { InstallmentData } from "@/lib/types";

export function InstallmentDialog({
  installment,
  open,
  onOpenChange,
  onSuccess,
}: {
  installment?: InstallmentData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const isEdit = !!installment?.id;
  const [name, setName] = useState(installment?.name ?? "");
  const [amount, setAmount] = useState(installment?.amount?.toString() ?? "");
  const [currency, setCurrency] = useState(installment?.currency ?? "AED");
  const [dueDay, setDueDay] = useState(
    installment?.dueDay?.toString() ?? "1"
  );
  const [totalCount, setTotalCount] = useState(
    installment?.totalCount?.toString() ?? ""
  );
  const [paidCount, setPaidCount] = useState(
    installment?.paidCount?.toString() ?? "0"
  );
  const [isActive, setIsActive] = useState(installment?.isActive ?? true);
  const [reminderDays, setReminderDays] = useState(
    installment?.reminderDays?.toString() ?? "2"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaving(true);

    const data = {
      name: name.trim(),
      amount: parseFloat(amount),
      currency,
      dueDay: parseInt(dueDay),
      totalCount: totalCount ? parseInt(totalCount) : null,
      paidCount: parseInt(paidCount) || 0,
      isActive,
      reminderDays: parseInt(reminderDays) || 2,
    };

    const result = isEdit
      ? await updateInstallment(installment!.id, data)
      : await createInstallment(data);

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
      toast.success(isEdit ? "Installment updated" : "Installment added");
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
            {isEdit ? "Edit Installment" : "Add Installment"}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Car Loan, Internet"
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
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="AED"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Due Day (1-31)</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Reminder (days before)</Label>
              <Input
                type="number"
                min={0}
                max={30}
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Total Installments</Label>
              <Input
                type="number"
                min={1}
                value={totalCount}
                onChange={(e) => setTotalCount(e.target.value)}
                placeholder="Ongoing if empty"
              />
            </div>
            <div className="grid gap-2">
              <Label>Paid Count</Label>
              <Input
                type="number"
                min={0}
                value={paidCount}
                onChange={(e) => setPaidCount(e.target.value)}
              />
            </div>
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
