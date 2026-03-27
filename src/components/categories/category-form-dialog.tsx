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
import { ColorPicker } from "@/components/ui/color-picker";
import { FormDialogFooter } from "@/components/ui/form-dialog-footer";
import { createCategory, updateCategory } from "@/actions/categories";
import { toast } from "sonner";

type CategoryData = {
  id?: string;
  name: string;
  color: string;
};

export function CategoryFormDialog({
  category,
  open,
  onOpenChange,
  onSuccess,
}: {
  category?: CategoryData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const isEdit = !!category?.id;
  const [name, setName] = useState(category?.name ?? "");
  const [color, setColor] = useState(category?.color ?? "#3b82f6");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaving(true);

    const data = { name: name.trim(), color };
    const result = isEdit
      ? await updateCategory(category!.id!, data)
      : await createCategory(data);

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
      toast.success(isEdit ? "✅ Category updated" : "✅ Category created");
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
            {isEdit ? "Edit Category" : "New Category"}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
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
