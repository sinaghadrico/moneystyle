"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import {
  getHousehold,
  createHousehold,
  renameHousehold,
  inviteToHousehold,
  cancelInvite,
  removeMember,
  leaveHousehold,
  deleteHousehold,
  getPendingInvites,
  acceptInvite,
  getHouseholdTransactions,
} from "@/actions/household";
import { formatCurrency } from "@/lib/utils";
import type { HouseholdData, HouseholdTransactionData } from "@/lib/types";
import {
  Users,
  Plus,
  Mail,
  Trash2,
  LogOut,
  Crown,
  Loader2,
  Check,
  X,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

export function HouseholdSection() {
  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState<HouseholdData | null>(null);
  const [pendingInvites, setPendingInvites] = useState<
    { id: string; token: string; householdName: string; invitedByName: string }[]
  >([]);
  const [transactions, setTransactions] = useState<HouseholdTransactionData[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [householdName, setHouseholdName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [newName, setNewName] = useState("");

  const loadData = useCallback(async () => {
    const [h, invites] = await Promise.all([getHousehold(), getPendingInvites()]);
    setHousehold(h);
    setPendingInvites(invites);
    if (h) {
      const txData = await getHouseholdTransactions({ limit: 20 });
      setTransactions(txData.transactions);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!householdName.trim()) return;
    setSaving(true);
    const result = await createHousehold(householdName);
    setSaving(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Household created");
      setShowCreate(false);
      setHouseholdName("");
      loadData();
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSaving(true);
    const result = await inviteToHousehold(inviteEmail);
    setSaving(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success(`Invite sent to ${inviteEmail}`);
      setShowInvite(false);
      setInviteEmail("");
      loadData();
    }
  };

  const handleAcceptInvite = async (token: string) => {
    const result = await acceptInvite(token);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Joined household");
      loadData();
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const result = await removeMember(memberId);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Member removed");
      loadData();
    }
  };

  const handleLeave = async () => {
    const result = await leaveHousehold();
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Left household");
      loadData();
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    const result = await deleteHousehold();
    setSaving(false);
    setShowDelete(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Household deleted");
      loadData();
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    const result = await cancelInvite(inviteId);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Invite cancelled");
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  // Pending invites for this user
  if (!household && pendingInvites.length > 0) {
    return (
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Household Invites</h3>
        {pendingInvites.map((inv) => (
          <Card key={inv.id}>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm">
                <span className="font-medium">{inv.invitedByName}</span> invited you to join{" "}
                <span className="font-medium">{inv.householdName}</span>
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => handleAcceptInvite(inv.token)}>
                  <Check className="mr-1 h-4 w-4" /> Accept
                </Button>
                <Button size="sm" variant="outline">
                  <X className="mr-1 h-4 w-4" /> Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" /> Create Your Own
        </Button>
        <CreateDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          name={householdName}
          setName={setHouseholdName}
          saving={saving}
          onSave={handleCreate}
        />
      </section>
    );
  }

  // No household yet
  if (!household) {
    return (
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Household</h3>
        <Card>
          <CardContent className="py-8 text-center space-y-3">
            <Users className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              Create a household to share finances with your family or partner.
            </p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="mr-1 h-4 w-4" /> Create Household
            </Button>
          </CardContent>
        </Card>
        <CreateDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          name={householdName}
          setName={setHouseholdName}
          saving={saving}
          onSave={handleCreate}
        />
      </section>
    );
  }

  const isOwner = household.members.some(
    (m) => m.role === "owner" && m.userId === household.members[0]?.userId
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{household.name}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => { setNewName(household.name); setShowRename(true); }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowInvite(true)}>
          <Mail className="mr-1 h-4 w-4" /> Invite
        </Button>
      </div>

      {/* Members */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Members ({household.members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {household.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {member.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium flex items-center gap-1">
                    {member.name}
                    {member.role === "owner" && (
                      <Crown className="h-3 w-3 text-amber-500" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>
              {member.role !== "owner" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pending invites */}
      {household.pendingInvites.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Invites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {household.pendingInvites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{inv.email}</span>
                  <Badge variant="outline" className="text-xs">Pending</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleCancelInvite(inv.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Shared transactions */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Household Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-1.5 border-b last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {tx.merchant || tx.description || "Transaction"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.userName} &middot;{" "}
                    {new Date(tx.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {tx.categoryName && ` · ${tx.categoryName}`}
                  </p>
                </div>
                <p
                  className={`text-sm font-medium shrink-0 ml-2 ${
                    tx.type === "income" ? "text-green-600" : ""
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(Math.abs(tx.amount), tx.currency)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={handleLeave}
        >
          <LogOut className="mr-1 h-4 w-4" /> Leave
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 className="mr-1 h-4 w-4" /> Delete Household
        </Button>
      </div>

      {/* Invite dialog */}
      <ResponsiveDialog open={showInvite} onOpenChange={setShowInvite}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Invite Member</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="partner@example.com"
              />
            </div>
          </div>
          <ResponsiveDialogFooter>
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleInvite}
                disabled={saving || !inviteEmail.trim()}
              >
                {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Mail className="mr-1 h-4 w-4" />}
                Send Invite
              </Button>
            </div>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {/* Delete confirmation */}
      <ResponsiveDialog open={showDelete} onOpenChange={setShowDelete}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Delete Household</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure? All members will be removed. Individual data stays intact.
          </p>
          <ResponsiveDialogFooter>
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDelete(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={saving}>
                {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </div>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {/* Rename dialog */}
      <ResponsiveDialog open={showRename} onOpenChange={setShowRename}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Rename Household</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Our Family"
              />
            </div>
          </div>
          <ResponsiveDialogFooter>
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowRename(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={saving || !newName.trim()}
                onClick={async () => {
                  setSaving(true);
                  const result = await renameHousehold(newName);
                  setSaving(false);
                  if ("error" in result) {
                    toast.error(result.error);
                  } else {
                    toast.success("Household renamed");
                    setShowRename(false);
                    loadData();
                  }
                }}
              >
                {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      <CreateDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        name={householdName}
        setName={setHouseholdName}
        saving={saving}
        onSave={handleCreate}
      />
    </section>
  );
}

function CreateDialog({
  open,
  onOpenChange,
  name,
  setName,
  saving,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
  setName: (v: string) => void;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Create Household</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Household Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Our Family, Home Budget"
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={onSave} disabled={saving || !name.trim()}>
              {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
