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
import { deleteCategory } from "@/actions/categories";
import { toast } from "sonner";

type CategoryInfo = {
  id: string;
  name: string;
  transactionCount: number;
};

export function DeleteCategoryDialog({
  category,
  allCategories,
  open,
  onOpenChange,
  onSuccess,
}: {
  category: CategoryInfo;
  allCategories: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [reassignId, setReassignId] = useState<string>("");
  const [deleting, setDeleting] = useState(false);
  const otherCategories = allCategories.filter((c) => c.id !== category.id);

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteCategory(category.id, reassignId || undefined);
    if (result.error) {
      toast.error(
        "❌ " + (typeof result.error === "string" ? result.error : "Failed to delete"),
      );
    } else {
      toast.success("🗑️ Category deleted");
      onOpenChange(false);
      onSuccess();
    }
    setDeleting(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Delete &quot;{category.name}&quot;?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {category.transactionCount > 0
              ? `This category has ${category.transactionCount} transactions. You can reassign them to another category or leave them uncategorized.`
              : "This category has no transactions and can be safely deleted."}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {category.transactionCount > 0 && otherCategories.length > 0 && (
          <div className="py-4">
            <label className="text-sm font-medium">
              Reassign transactions to:
            </label>
            <Select
              value={reassignId || "none"}
              onValueChange={(v) => setReassignId(v === "none" ? "" : v)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Leave uncategorized" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Leave uncategorized</SelectItem>
                {otherCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
