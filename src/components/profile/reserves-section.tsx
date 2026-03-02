"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReserveDialog } from "./reserve-dialog";
import { RecordReserveDialog } from "./record-reserve-dialog";
import { ReserveHistoryDialog } from "./reserve-history-dialog";
import { deleteReserve } from "@/actions/profile";
import { formatCurrency } from "@/lib/utils";
import type { ReserveData } from "@/lib/types";
import { Plus, Pencil, Trash2, MapPin, RefreshCw, History } from "lucide-react";
import { toast } from "sonner";

const TYPE_STYLES: Record<string, string> = {
  cash: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  gold: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  crypto:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  family: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const TYPE_LABELS: Record<string, string> = {
  cash: "Cash",
  gold: "Gold",
  crypto: "Crypto",
  family: "Family",
  other: "Other",
};

export function ReservesSection({
  reserves,
  onRefresh,
}: {
  reserves: ReserveData[];
  onRefresh: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<ReserveData | null>(null);
  const [recordItem, setRecordItem] = useState<ReserveData | null>(null);
  const [historyItem, setHistoryItem] = useState<ReserveData | null>(null);

  const handleDelete = async (id: string) => {
    await deleteReserve(id);
    toast.success("Reserve deleted");
    onRefresh();
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reserves & Savings</h3>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {reserves.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No reserves yet. Track cash, gold, crypto, or family savings.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reserves.map((reserve) => (
            <Card key={reserve.id} className="group relative">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{reserve.name}</h4>
                      <Badge
                        variant="secondary"
                        className={TYPE_STYLES[reserve.type] || TYPE_STYLES.other}
                      >
                        {TYPE_LABELS[reserve.type] || reserve.type}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold">
                      {formatCurrency(reserve.amount, reserve.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {reserve.location}
                    </p>
                    {reserve.note && (
                      <p className="text-xs text-muted-foreground">
                        {reserve.note}
                      </p>
                    )}
                    {reserve.lastRecordedAt && (
                      <p className="text-xs text-muted-foreground">
                        Updated{" "}
                        {new Date(reserve.lastRecordedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Record Value"
                      onClick={() => setRecordItem(reserve)}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="History"
                      onClick={() => setHistoryItem(reserve)}
                    >
                      <History className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditItem(reserve)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDelete(reserve.id)}
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
        <ReserveDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          onSuccess={onRefresh}
        />
      )}

      {editItem && (
        <ReserveDialog
          reserve={editItem}
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          onSuccess={onRefresh}
        />
      )}

      {recordItem && (
        <RecordReserveDialog
          reserve={recordItem}
          open={!!recordItem}
          onOpenChange={(open) => !open && setRecordItem(null)}
          onSuccess={onRefresh}
        />
      )}

      {historyItem && (
        <ReserveHistoryDialog
          reserve={historyItem}
          open={!!historyItem}
          onOpenChange={(open) => !open && setHistoryItem(null)}
        />
      )}
    </section>
  );
}
