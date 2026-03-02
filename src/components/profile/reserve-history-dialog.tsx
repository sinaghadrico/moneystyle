"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { getReserveHistory } from "@/actions/profile";
import { formatCurrency } from "@/lib/utils";
import type { ReserveData, ReserveSnapshotData } from "@/lib/types";
import { ArrowUp, ArrowDown, Minus, Loader2 } from "lucide-react";

export function ReserveHistoryDialog({
  reserve,
  open,
  onOpenChange,
}: {
  reserve: ReserveData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [snapshots, setSnapshots] = useState<ReserveSnapshotData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getReserveHistory(reserve.id).then((data) => {
        setSnapshots(data);
        setLoading(false);
      });
    }
  }, [open, reserve.id]);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            History — {reserve.name}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : snapshots.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No history yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {snapshots.map((snap, idx) => {
                const prev = snapshots[idx + 1];
                const diff = prev ? snap.amount - prev.amount : null;

                return (
                  <div
                    key={snap.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {formatCurrency(snap.amount, reserve.currency)}
                      </p>
                      {snap.note && (
                        <p className="text-xs text-muted-foreground">
                          {snap.note}
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        {new Date(snap.recordedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      {diff !== null && (
                        <div className="flex items-center justify-end gap-1 text-xs">
                          {diff > 0 ? (
                            <>
                              <ArrowUp className="h-3 w-3 text-green-600" />
                              <span className="text-green-600">
                                +{formatCurrency(diff, reserve.currency)}
                              </span>
                            </>
                          ) : diff < 0 ? (
                            <>
                              <ArrowDown className="h-3 w-3 text-red-600" />
                              <span className="text-red-600">
                                {formatCurrency(diff, reserve.currency)}
                              </span>
                            </>
                          ) : (
                            <>
                              <Minus className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                No change
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
