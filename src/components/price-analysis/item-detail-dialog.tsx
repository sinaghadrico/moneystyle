"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from "@/components/ui/responsive-dialog";
import { getGroupDetail, getIndividualItemDetail } from "@/actions/price-analysis";
import type { ItemDetail } from "@/lib/types";
import { ItemPriceHistoryChart, MerchantComparisonChart } from "./price-charts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

type Props = {
  /** The normalizedName (for group) or raw name (for item) to show */
  itemKey: string | null;
  /** "group" = aggregated group detail, "item" = single raw item */
  mode: "group" | "item";
  fuzzy: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ItemDetailDialog({ itemKey, mode, fuzzy, open, onOpenChange }: Props) {
  const [detail, setDetail] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemKey || !open) return;
    setLoading(true);
    const promise =
      mode === "group"
        ? getGroupDetail(itemKey, fuzzy)
        : getIndividualItemDetail(itemKey);
    promise.then(setDetail).finally(() => setLoading(false));
  }, [itemKey, mode, fuzzy, open]);

  const subtitle =
    mode === "group"
      ? "Group price history across all member items"
      : "Price history for this specific item";

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            {detail?.displayName || itemKey || "Detail"}
            <Badge variant={mode === "group" ? "default" : "secondary"} className="text-[10px]">
              {mode === "group" ? "Group" : "Item"}
            </Badge>
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>{subtitle}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {loading ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-[280px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : !detail ? (
          <div className="p-4 text-sm text-muted-foreground">No data found.</div>
        ) : (
          <div className="space-y-6 p-1">
            {/* Price History Chart */}
            <div>
              <h3 className="mb-2 text-sm font-medium">Price History</h3>
              <ItemPriceHistoryChart data={detail.priceHistory} />
            </div>

            {/* Merchant Comparison Chart */}
            {detail.merchantStats.length > 1 && (
              <div>
                <h3 className="mb-2 text-sm font-medium">Merchant Comparison</h3>
                <MerchantComparisonChart data={detail.merchantStats} />
              </div>
            )}

            {/* Merchant Stats Table */}
            {detail.merchantStats.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium">Details by Merchant</h3>
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-3 py-2 text-left font-medium">Merchant</th>
                        <th className="px-3 py-2 text-right font-medium">Avg</th>
                        <th className="px-3 py-2 text-right font-medium">Min</th>
                        <th className="px-3 py-2 text-right font-medium">Max</th>
                        <th className="px-3 py-2 text-right font-medium">#</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.merchantStats.map((ms) => (
                        <tr key={ms.merchant} className="border-b last:border-0">
                          <td className="px-3 py-2">{ms.merchant}</td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {formatCurrency(ms.avgPrice)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-green-600">
                            {formatCurrency(ms.minPrice)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-red-500">
                            {formatCurrency(ms.maxPrice)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">{ms.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div>
              <h3 className="mb-2 text-sm font-medium">
                Transactions ({detail.priceHistory.length})
              </h3>
              <div className="max-h-[240px] overflow-y-auto rounded-lg border divide-y">
                {detail.priceHistory
                  .slice()
                  .reverse()
                  .slice(0, 30)
                  .map((ph, i) => (
                    <div
                      key={`${ph.transactionId}-${i}`}
                      className="flex items-center justify-between px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {formatDate(ph.date)}
                        </span>
                        <span>{ph.merchant}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium tabular-nums">
                          {formatCurrency(ph.price)}
                        </span>
                        <Link
                          href={`/transactions?search=${encodeURIComponent(ph.transactionId)}`}
                          className="text-muted-foreground hover:text-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
