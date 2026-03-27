"use client";

import { ResponsiveDialogFooter } from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";

interface FormDialogFooterProps {
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  disabled?: boolean;
  saveLabel?: string;
}

export function FormDialogFooter({
  onCancel,
  onSave,
  saving,
  disabled,
  saveLabel = "Save",
}: FormDialogFooterProps) {
  return (
    <ResponsiveDialogFooter>
      <div className="flex w-full gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={onSave}
          disabled={saving || disabled}
        >
          {saving ? "Saving..." : saveLabel}
        </Button>
      </div>
    </ResponsiveDialogFooter>
  );
}
