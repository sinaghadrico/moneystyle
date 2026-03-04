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
import { Badge } from "@/components/ui/badge";
import { updateItemGroup, createItemGroup } from "@/actions/price-analysis";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

type Props = {
  groupId?: string;
  canonicalName?: string;
  rawNames?: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function GroupFormDialog({
  groupId,
  canonicalName,
  rawNames,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const isEdit = !!groupId;
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(canonicalName ?? "");
  const [members, setMembers] = useState<string[]>(rawNames ?? []);
  const [newMember, setNewMember] = useState("");

  function addMember() {
    const trimmed = newMember.trim();
    if (trimmed && !members.includes(trimmed)) {
      setMembers([...members, trimmed]);
    }
    setNewMember("");
  }

  async function handleSave() {
    setSaving(true);
    const data = { canonicalName: name, rawNames: members };
    const result = isEdit
      ? await updateItemGroup(groupId, data)
      : await createItemGroup(data);
    setSaving(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Group updated" : "Group created");
    onOpenChange(false);
    onSuccess();
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {isEdit ? "Edit Group" : "New Group"}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="space-y-3 py-2">
          <div className="grid gap-1">
            <Label>Group Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Milk"
            />
          </div>

          <div className="grid gap-1">
            <Label>Members</Label>
            {members.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {members.map((m) => (
                  <Badge key={m} variant="secondary" className="gap-1">
                    {m}
                    <button onClick={() => setMembers(members.filter((n) => n !== m))}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                placeholder="Add item name..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMember();
                  }
                }}
                className="flex-1"
              />
              <Button size="icon" variant="outline" onClick={addMember} className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
              disabled={saving || !name.trim() || members.length === 0}
            >
              {saving ? "Saving..." : isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
