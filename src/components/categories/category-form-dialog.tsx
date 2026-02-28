"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory, updateCategory } from "@/actions/categories";
import { toast } from "sonner";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280", "#64748b",
  "#06b6d4", "#84cc16", "#a855f7", "#f43f5e",
];

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
      toast.success(isEdit ? "Category updated" : "Category created");
      onOpenChange(false);
      onSuccess();
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Category" : "New Category"}
          </DialogTitle>
        </DialogHeader>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
