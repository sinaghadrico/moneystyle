"use client";

import { useState } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorPicker } from "@/components/ui/color-picker";
import { FormDialogFooter } from "@/components/ui/form-dialog-footer";
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
            <ColorPicker color={color} onChange={setColor} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <FormDialogFooter
          onCancel={() => onOpenChange(false)}
          onSave={handleSave}
          saving={saving}
          disabled={!name.trim()}
          saveLabel={isEdit ? "Update" : "Create"}
        />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
