"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { createSettlement } from "@/actions/persons";
import { Share2, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";

type PersonSummary = {
  id: string;
  name: string;
  phone: string | null;
  color: string;
  totalSplits: number;
  totalSettled: number;
  balance: number;
  recentSplits: {
    id: string;
    amount: number;
    description: string | null;
    date: string;
    merchant: string | null;
  }[];
  recentSettlements: {
    id: string;
    amount: number;
    note: string | null;
    date: string;
  }[];
};

export function PersonSummaryContent({ summary }: { summary: PersonSummary }) {
  const router = useRouter();
  const [settling, setSettling] = useState(false);
  const [settleConfirm, setSettleConfirm] = useState(false);

  const handleShare = async () => {
    const lines = [
      `Expense Summary with ${summary.name}`,
      "",
      summary.balance > 0
        ? `${summary.name} owes you ${formatCurrency(summary.balance)}`
        : summary.balance < 0
          ? `You owe ${summary.name} ${formatCurrency(Math.abs(summary.balance))}`
          : "All settled up!",
      "",
      `Total splits: ${formatCurrency(summary.totalSplits)}`,
      `Total settled: ${formatCurrency(summary.totalSettled)}`,
    ];

    if (summary.recentSplits.length > 0) {
      lines.push("", "Recent splits:");
      for (const s of summary.recentSplits.slice(0, 5)) {
        lines.push(
          `  ${s.date} - ${s.merchant ?? "Unknown"}: ${formatCurrency(s.amount)}`,
        );
      }
    }

    const text = lines.join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: `Expenses with ${summary.name}`, text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("📋 Summary copied to clipboard");
    }
  };

  const handleSettle = async () => {
    setSettleConfirm(false);
    setSettling(true);
    const res = await createSettlement({
      personId: summary.id,
      amount: summary.balance,
      note: "Full settlement",
    });
    setSettling(false);
    if ("success" in res) {
      toast.success("Settlement recorded");
      router.refresh();
    } else {
      toast.error("Failed to settle");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{summary.name}</h2>
          {summary.phone && (
            <p className="text-sm text-muted-foreground">{summary.phone}</p>
          )}
        </div>
      </div>

      {/* Balance card */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {summary.balance > 0
                ? "Owes you"
                : summary.balance < 0
                  ? "You owe"
                  : "All settled"}
            </p>
            <p
              className={`text-3xl font-bold ${
                summary.balance > 0
                  ? "text-red-500"
                  : summary.balance < 0
                    ? "text-green-500"
                    : "text-muted-foreground"
              }`}
            >
              {summary.balance === 0
                ? "0"
                : formatCurrency(Math.abs(summary.balance))}
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              Splits: {formatCurrency(summary.totalSplits)} | Settled:{" "}
              {formatCurrency(summary.totalSettled)}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleShare}
            >
              <Share2 className="mr-1.5 h-4 w-4" />
              Share
            </Button>
            {summary.balance > 0 && (
              <Button
                className="flex-1"
                disabled={settling}
                onClick={() => setSettleConfirm(true)}
              >
                <CheckCircle className="mr-1.5 h-4 w-4" />
                {settling ? "Settling..." : "Settle Up"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent splits */}
      {summary.recentSplits.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Recent Splits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.recentSplits.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <span className="font-medium">
                    {s.merchant ?? "Unknown"}
                  </span>
                  {s.description && (
                    <span className="ml-2 text-muted-foreground">
                      {s.description}
                    </span>
                  )}
                  <div className="text-xs text-muted-foreground">{s.date}</div>
                </div>
                <span className="font-medium text-red-500">
                  {formatCurrency(s.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent settlements */}
      {summary.recentSettlements.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Settlements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.recentSettlements.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <span className="font-medium">
                    {s.note ?? "Settlement"}
                  </span>
                  <div className="text-xs text-muted-foreground">{s.date}</div>
                </div>
                <span className="font-medium text-green-500">
                  {formatCurrency(s.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {summary.balance > 0 && (
        <ResponsiveDialog open={settleConfirm} onOpenChange={setSettleConfirm}>
          <ResponsiveDialogContent>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>Settle Up</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                Are you sure you want to settle{" "}
                {formatCurrency(summary.balance)} with {summary.name}?
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <ResponsiveDialogFooter>
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSettleConfirm(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSettle}>
                  Settle
                </Button>
              </div>
            </ResponsiveDialogFooter>
          </ResponsiveDialogContent>
        </ResponsiveDialog>
      )}
    </div>
  );
}
