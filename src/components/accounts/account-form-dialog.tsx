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
import { createAccount, updateAccount } from "@/actions/accounts";
import { toast } from "sonner";

const ACCOUNT_TYPES = [
  { value: "bank", label: "Bank Account" },
  { value: "wallet", label: "Wallet" },
  { value: "crypto", label: "Crypto Wallet" },
  { value: "exchange", label: "Exchange" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
] as const;

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280", "#64748b",
  "#06b6d4", "#84cc16", "#a855f7", "#f43f5e",
];

type AccountData = {
  id?: string;
  name: string;
  type?: string;
  bank?: string | null;
  color: string;
};

export function AccountFormDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
}: {
  account?: AccountData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const isEdit = !!account?.id;
  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState(account?.type ?? "bank");
  const [bank, setBank] = useState(account?.bank ?? "");
  const [color, setColor] = useState(account?.color ?? "#3b82f6");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaving(true);

    const data = { name: name.trim(), type, bank: bank.trim() || null, color };
    const result = isEdit
      ? await updateAccount(account!.id!, data)
      : await createAccount(data);

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
      toast.success(isEdit ? "✅ Account updated" : "✅ Account created");
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
            {isEdit ? "Edit Account" : "New Account"}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Account name"
              />
            </div>
            <div className="grid gap-1">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Institution (optional)</Label>
            <Input
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="Bank, exchange, or provider name"
            />
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    color === c
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  type="button"
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-14 cursor-pointer p-0.5"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-24 font-mono text-sm"
                maxLength={7}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
