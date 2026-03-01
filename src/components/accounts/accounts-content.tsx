"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountFormDialog } from "./account-form-dialog";
import { DeleteAccountDialog } from "./delete-account-dialog";
import { getAccountsWithStats } from "@/actions/accounts";
import { formatCurrency } from "@/lib/utils";
import type { AccountWithStats } from "@/lib/types";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function AccountsContent() {
  const [accounts, setAccounts] = useState<AccountWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editAcc, setEditAcc] = useState<AccountWithStats | null>(null);
  const [deleteAcc, setDeleteAcc] = useState<AccountWithStats | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getAccountsWithStats();
    setAccounts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">{accounts.length} accounts</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add Account
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((acc) => (
            <Card key={acc.id} className="group relative">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: acc.color }}
                    />
                    <div>
                      <h3 className="font-semibold">{acc.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {acc.bank && <span>{acc.bank} &middot; </span>}
                        {acc.transactionCount} transactions
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditAcc(acc)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteAcc(acc)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="mt-3 text-lg font-bold">
                  {formatCurrency(acc.totalAmount)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreate && (
        <AccountFormDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          onSuccess={loadData}
        />
      )}

      {editAcc && (
        <AccountFormDialog
          account={editAcc}
          open={!!editAcc}
          onOpenChange={(open) => !open && setEditAcc(null)}
          onSuccess={loadData}
        />
      )}

      {deleteAcc && (
        <DeleteAccountDialog
          account={deleteAcc}
          allAccounts={accounts}
          open={!!deleteAcc}
          onOpenChange={(open) => !open && setDeleteAcc(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
