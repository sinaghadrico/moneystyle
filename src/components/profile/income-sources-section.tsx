"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { IncomeSourceDialog } from "./income-source-dialog";
import { RecordIncomeDepositDialog } from "./record-income-deposit-dialog";
import { IncomeDepositHistoryDialog } from "./income-deposit-history-dialog";
import { deleteIncomeSource, getIncomeDepositHistory } from "@/actions/income-sources";
import { formatCurrency } from "@/lib/utils";
import type { IncomeSourceData, IncomeDepositData } from "@/lib/types";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  Link,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import NextLink from "next/link";

export function IncomeSourcesSection({
  sources,
  onRefresh,
}: {
  sources: IncomeSourceData[];
  onRefresh: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<IncomeSourceData | null>(null);
  const [depositItem, setDepositItem] = useState<IncomeSourceData | null>(null);
  const [historyItem, setHistoryItem] = useState<IncomeSourceData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<IncomeSourceData | null>(
    null,
  );

  const handleDelete = async (id: string) => {
    setDeleteConfirm(null);
    await deleteIncomeSource(id);
    toast.success("Income source deleted");
    onRefresh();
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Income Sources</h3>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {sources.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No income sources yet. Add your salary, freelance income, etc.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sources.map((source) => (
            <IncomeSourceCard
              key={source.id}
              source={source}
              onEdit={() => setEditItem(source)}
              onDelete={() => setDeleteConfirm(source)}
              onRecordDeposit={() => setDepositItem(source)}
              onShowHistory={() => setHistoryItem(source)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <IncomeSourceDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          onSuccess={onRefresh}
        />
      )}

      {editItem && (
        <IncomeSourceDialog
          source={editItem}
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          onSuccess={onRefresh}
        />
      )}

      {depositItem && (
        <RecordIncomeDepositDialog
          source={depositItem}
          open={!!depositItem}
          onOpenChange={(open) => !open && setDepositItem(null)}
          onSuccess={onRefresh}
        />
      )}

      {historyItem && (
        <IncomeDepositHistoryDialog
          source={historyItem}
          open={!!historyItem}
          onOpenChange={(open) => !open && setHistoryItem(null)}
        />
      )}

      <ResponsiveDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Delete Income Source</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <p className="text-sm text-muted-foreground px-1">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {deleteConfirm?.name}
            </span>
            ? This cannot be undone.
          </p>
          <ResponsiveDialogFooter>
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
              >
                Delete
              </Button>
            </div>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </section>
  );
}

function IncomeSourceCard({
  source,
  onEdit,
  onDelete,
  onRecordDeposit,
  onShowHistory,
}: {
  source: IncomeSourceData;
  onEdit: () => void;
  onDelete: () => void;
  onRecordDeposit: () => void;
  onShowHistory: () => void;
}) {
  const [linkedOpen, setLinkedOpen] = useState(false);
  const [linkedDeposits, setLinkedDeposits] = useState<IncomeDepositData[]>([]);
  const [loadingLinked, setLoadingLinked] = useState(false);

  const handleToggleLinked = async () => {
    if (!linkedOpen && linkedDeposits.length === 0) {
      setLoadingLinked(true);
      const history = await getIncomeDepositHistory(source.id);
      setLinkedDeposits(history.filter((d) => d.transactionId));
      setLoadingLinked(false);
    }
    setLinkedOpen(!linkedOpen);
  };

  return (
    <Card className={`group ${!source.isActive ? "opacity-60" : ""}`}>
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold">{source.name}</h4>
          {!source.isActive && (
            <Badge variant="secondary" className="text-xs">
              Inactive
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {source.depositDay}
            {getOrdinalSuffix(source.depositDay)} of month
          </Badge>
        </div>

        {/* Amount */}
        <p className="text-lg font-bold">
          {formatCurrency(source.amount, source.currency)}
        </p>

        {/* Meta info */}
        {source.lastReceivedAt && (
          <p className="text-xs text-muted-foreground">
            Last received{" "}
            {new Date(source.lastReceivedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        )}

        {/* Linked Transactions tab */}
        {source.lastReceivedAt && (
          <div className="border-t pt-2">
            <div className="flex gap-1">
              <button
                type="button"
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  linkedOpen
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={handleToggleLinked}
              >
                <Link className="h-3.5 w-3.5 shrink-0" />
                Linked
              </button>
            </div>

            {linkedOpen && (
              <div className="mt-2 space-y-1">
                {loadingLinked ? (
                  <p className="text-xs text-muted-foreground px-1">
                    Loading...
                  </p>
                ) : linkedDeposits.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-1">
                    No linked transactions.
                  </p>
                ) : (
                  linkedDeposits.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between text-xs bg-muted/50 rounded-md px-2.5 py-1.5"
                    >
                      <span className="truncate font-medium">
                        {d.transactionMerchant || "Transaction"}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 ml-2 text-muted-foreground">
                        <span>
                          {d.transactionDate &&
                            new Date(d.transactionDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(d.amount, source.currency)}
                        </span>
                        {d.transactionId && (
                          <NextLink
                            href={`/transactions?tx=${d.transactionId}`}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </NextLink>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 border-t pt-2">
          {source.isActive && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs mr-auto"
              onClick={onRecordDeposit}
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Received ?
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onShowHistory}
            title="Deposit history"
          >
            <Clock className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onEdit}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
