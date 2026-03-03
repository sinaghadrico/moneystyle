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
import { createPerson, updatePerson } from "@/actions/persons";
import { toast } from "sonner";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280", "#64748b",
  "#06b6d4", "#84cc16", "#a855f7", "#f43f5e",
];

type PersonData = {
  id?: string;
  name: string;
  phone?: string | null;
  color: string;
};

export function PersonFormDialog({
  person,
  open,
  onOpenChange,
  onSuccess,
}: {
  person?: PersonData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (created?: { id: string; name: string }) => void;
}) {
  const isEdit = !!person?.id;
  const [name, setName] = useState(person?.name ?? "");
  const [phone, setPhone] = useState(person?.phone ?? "");
  const [color, setColor] = useState(person?.color ?? "#3b82f6");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    setSaving(true);

    const data = { name: name.trim(), phone: phone.trim() || null, color };
    const result = isEdit
      ? await updatePerson(person!.id!, data)
      : await createPerson(data);

    if (result.error) {
      const errors = result.error;
      if (typeof errors === "string") {
        setError(errors);
      } else {
        setError(
          Object.values(errors as Record<string, string[]>)
            .flat()
            .join(", "),
        );
      }
    } else {
      toast.success(isEdit ? "✅ Person updated" : "✅ Person created");
      onOpenChange(false);
      const person =
        "person" in result
          ? (result.person as { id: string; name: string })
          : undefined;
      onSuccess(!isEdit ? person : undefined);
    }
    setSaving(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {isEdit ? "Edit Person" : "New Person"}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Person name"
            />
          </div>
          <div className="grid gap-2">
            <Label>Phone (optional)</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+971..."
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
