"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getItemGroups,
  updateItemGroup,
  deleteItemGroup,
  createItemGroup,
} from "@/actions/price-analysis";
import type { ItemGroupData } from "@/lib/types";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ItemGroupsDialog({ open, onOpenChange }: Props) {
  const [groups, setGroups] = useState<ItemGroupData[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRawNames, setEditRawNames] = useState<string[]>([]);
  const [newMember, setNewMember] = useState("");

  // Creating new group
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createMembers, setCreateMembers] = useState<string[]>([]);
  const [createNewMember, setCreateNewMember] = useState("");

  useEffect(() => {
    if (open) loadGroups();
  }, [open]);

  async function loadGroups() {
    setLoading(true);
    const data = await getItemGroups();
    setGroups(data);
    setLoading(false);
  }

  function startEdit(group: ItemGroupData) {
    setEditingId(group.id);
    setEditName(group.canonicalName);
    setEditRawNames([...group.rawNames]);
    setNewMember("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditRawNames([]);
    setNewMember("");
  }

  async function saveEdit() {
    if (!editingId) return;
    const result = await updateItemGroup(editingId, {
      canonicalName: editName,
      rawNames: editRawNames,
    });
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Group updated");
    cancelEdit();
    loadGroups();
  }

  async function handleDelete(id: string) {
    const result = await deleteItemGroup(id);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Group deleted");
    loadGroups();
  }

  function addMember() {
    const trimmed = newMember.trim();
    if (trimmed && !editRawNames.includes(trimmed)) {
      setEditRawNames([...editRawNames, trimmed]);
    }
    setNewMember("");
  }

  function removeMember(name: string) {
    setEditRawNames(editRawNames.filter((n) => n !== name));
  }

  async function handleCreate() {
    const result = await createItemGroup({
      canonicalName: createName,
      rawNames: createMembers,
    });
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Group created");
    setCreating(false);
    setCreateName("");
    setCreateMembers([]);
    setCreateNewMember("");
    loadGroups();
  }

  function addCreateMember() {
    const trimmed = createNewMember.trim();
    if (trimmed && !createMembers.includes(trimmed)) {
      setCreateMembers([...createMembers, trimmed]);
    }
    setCreateNewMember("");
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Item Groups</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Manage item name groupings for price comparison
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-4 p-1">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : groups.length === 0 && !creating ? (
            <p className="text-sm text-muted-foreground">
              No item groups yet. Create one manually or use AI normalization.
            </p>
          ) : (
            <div className="space-y-3">
              {groups.map((group) =>
                editingId === group.id ? (
                  <div key={group.id} className="rounded-lg border p-3 space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Group name"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {editRawNames.map((name) => (
                        <Badge key={name} variant="secondary" className="gap-1">
                          {name}
                          <button onClick={() => removeMember(name)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newMember}
                        onChange={(e) => setNewMember(e.target.value)}
                        placeholder="Add item name..."
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMember())}
                        className="flex-1"
                      />
                      <Button size="sm" variant="outline" onClick={addMember}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit}>
                        <Save className="h-3.5 w-3.5 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={group.id}
                    className="flex items-start justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{group.canonicalName}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {group.source}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {group.rawNames.map((name) => (
                          <Badge key={name} variant="secondary" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => startEdit(group)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDelete(group.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {/* Create new group */}
          {creating ? (
            <div className="rounded-lg border p-3 space-y-3 border-dashed">
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Group name (e.g., Milk)"
              />
              <div className="flex flex-wrap gap-1.5">
                {createMembers.map((name) => (
                  <Badge key={name} variant="secondary" className="gap-1">
                    {name}
                    <button
                      onClick={() =>
                        setCreateMembers(createMembers.filter((n) => n !== name))
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={createNewMember}
                  onChange={(e) => setCreateNewMember(e.target.value)}
                  placeholder="Add item name..."
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addCreateMember())
                  }
                  className="flex-1"
                />
                <Button size="sm" variant="outline" onClick={addCreateMember}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={!createName.trim() || createMembers.length === 0}
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCreating(false);
                    setCreateName("");
                    setCreateMembers([]);
                    setCreateNewMember("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <ResponsiveDialogFooter>
          {!creating && (
            <Button variant="outline" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New Group
            </Button>
          )}
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
