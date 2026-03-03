"use client";

import { useState } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteAccount } from "@/actions/accounts";
import { toast } from "sonner";

type AccountInfo = {
  id: string;
  name: string;
  transactionCount: number;
};

export function DeleteAccountDialog({
  account,
  allAccounts,
  open,
  onOpenChange,
  onSuccess,
}: {
  account: AccountInfo;
  allAccounts: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const otherAccounts = allAccounts.filter((a) => a.id !== account.id);
  const [reassignId, setReassignId] = useState<string>(
    otherAccounts[0]?.id ?? ""
  );
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!reassignId) {
      toast.error("❌ Select an account to reassign transactions to");
      return;
    }
    setDeleting(true);
    const result = await deleteAccount(account.id, reassignId);
    if (result.error) {
      toast.error(
        "❌ " + (typeof result.error === "string" ? result.error : "Failed to delete")
      );
    } else {
      toast.success("🗑️ Account deleted");
      onOpenChange(false);
      onSuccess();
    }
    setDeleting(false);
  };

  if (otherAccounts.length === 0) {
    return (
      <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Cannot Delete</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              You must have at least one account. Create another account before
              deleting this one.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    );
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Delete &ldquo;{account.name}&rdquo;?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {account.transactionCount > 0
              ? `This account has ${account.transactionCount} transactions. They will be reassigned to the selected account.`
              : "This account has no transactions. Its transactions (if any) will be reassigned."}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium">
            Reassign transactions to:
          </label>
          <Select
            value={reassignId}
            onValueChange={setReassignId}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {otherAccounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting || !reassignId}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
