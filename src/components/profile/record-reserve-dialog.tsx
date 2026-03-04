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
import { recordReserveValue } from "@/actions/profile";
import { toast } from "sonner";
import type { ReserveData } from "@/lib/types";

export function RecordReserveDialog({
  reserve,
  open,
  onOpenChange,
  onSuccess,
}: {
  reserve: ReserveData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState(reserve.amount.toString());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaving(true);

    const result = await recordReserveValue(reserve.id, {
      amount: parseFloat(amount),
      note: note.trim() || null,
    });

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
      toast.success("✅ Value recorded");
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
            Record Value — {reserve.name}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Current Amount ({reserve.currency})</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="grid gap-2">
            <Label>Note (optional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Monthly check"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || !amount}>
              {saving ? "Saving..." : "Record"}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
