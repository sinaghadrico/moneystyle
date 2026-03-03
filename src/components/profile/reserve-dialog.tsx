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
import { CurrencySelect } from "@/components/ui/currency-select";
import { createReserve, updateReserve } from "@/actions/profile";
import { toast } from "sonner";
import type { ReserveData } from "@/lib/types";

const RESERVE_TYPES = [
  { value: "cash", label: "Cash" },
  { value: "gold", label: "Gold" },
  { value: "crypto", label: "Crypto" },
  { value: "family", label: "Family" },
  { value: "other", label: "Other" },
];

export function ReserveDialog({
  reserve,
  open,
  onOpenChange,
  onSuccess,
}: {
  reserve?: ReserveData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const isEdit = !!reserve?.id;
  const [name, setName] = useState(reserve?.name ?? "");
  const [amount, setAmount] = useState(reserve?.amount?.toString() ?? "");
  const [currency, setCurrency] = useState(reserve?.currency ?? "AED");
  const [type, setType] = useState(reserve?.type ?? "cash");
  const [location, setLocation] = useState(reserve?.location ?? "");
  const [note, setNote] = useState(reserve?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaving(true);

    const data = {
      name: name.trim(),
      amount: parseFloat(amount),
      currency,
      type,
      location: location.trim(),
      note: note.trim() || null,
    };

    const result = isEdit
      ? await updateReserve(reserve!.id, data)
      : await createReserve(data);

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
      toast.success(isEdit ? "✅ Reserve updated" : "✅ Reserve added");
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
            {isEdit ? "Edit Reserve" : "Add Reserve"}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cash, Gold Coins"
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
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESERVE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Safe at home, Binance"
            />
          </div>
          <div className="grid gap-2">
            <Label>Note (optional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional details"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim() || !amount || !location.trim()}
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Add"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
