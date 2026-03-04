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
import { deleteIncomeSource } from "@/actions/profile";
import { formatCurrency } from "@/lib/utils";
import type { IncomeSourceData } from "@/lib/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function IncomeSourcesSection({
  sources,
  onRefresh,
}: {
  sources: IncomeSourceData[];
  onRefresh: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<IncomeSourceData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<IncomeSourceData | null>(null);

  const handleDelete = async (id: string) => {
    setDeleteConfirm(null);
    await deleteIncomeSource(id);
    toast.success("🗑️ Income source deleted");
    onRefresh();
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">💵 Income Sources</h3>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {sources.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            💵 No income sources yet. Add your salary, freelance income, etc.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <Card key={source.id} className="group relative">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{source.name}</h4>
                      {!source.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg font-bold mt-1">
                      {formatCurrency(source.amount, source.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Deposit: {source.depositDay}
                      {getOrdinalSuffix(source.depositDay)} of month
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditItem(source)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteConfirm(source)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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

      <ResponsiveDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Delete Income Source</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <p className="text-sm text-muted-foreground px-1">
            Are you sure you want to delete <span className="font-medium text-foreground">{deleteConfirm?.name}</span>? This cannot be undone.
          </p>
          <ResponsiveDialogFooter>
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
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

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
