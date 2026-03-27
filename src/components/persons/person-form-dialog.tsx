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
import { createPerson, updatePerson } from "@/actions/persons";
import { toast } from "sonner";

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
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Person name"
              />
            </div>
            <div className="grid gap-1">
              <Label>Phone (optional)</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+971..."
              />
            </div>
          </div>
          <div className="grid gap-1.5">
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
