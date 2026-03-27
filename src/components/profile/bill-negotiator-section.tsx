"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getBillNegotiation,
  getBillNegotiationHistory,
  deleteBillNegotiation,
} from "@/actions/bill-negotiation";
import { formatCurrency } from "@/lib/utils";
import type { BillNegotiatorRecommendation, BillNegotiatorHistoryItem } from "@/lib/types";
import {
  Scissors,
  Loader2,
  Lightbulb,
  History,
  ChevronLeft,
  ChevronRight,
  Trash2,
  TrendingDown,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useAiCheck, AiSetupDialog } from "@/components/ai-setup-dialog";
import { cn } from "@/lib/utils";

const CONFIDENCE_CONFIG = {
  high: { label: "High", color: "text-green-600 border-green-200 bg-green-50 dark:bg-green-950/30" },
  medium: { label: "Medium", color: "text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30" },
  low: { label: "Low", color: "text-muted-foreground border-border bg-muted/50" },
} as const;

const PRIORITY_CONFIG = {
  high: { label: "High Priority", color: "bg-red-500" },
  medium: { label: "Medium", color: "bg-yellow-500" },
  low: { label: "Low", color: "bg-blue-500" },
} as const;

const CATEGORY_LABELS: Record<string, string> = {
  subscription: "Subscription",
  bill: "Bill",
  installment: "Installment",
  duplicate: "Duplicate",
  overpriced: "Overpriced",
};

export function BillNegotiatorSection() {
  const [history, setHistory] = useState<BillNegotiatorHistoryItem[]>([]);
  const [viewIndex, setViewIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setHistoryLoading(true);
    const items = await getBillNegotiationHistory();
    setHistory(items);
    setViewIndex(0);
    setHistoryLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const { checkAi, showSetup, setShowSetup } = useAiCheck();

  const handleAnalyze = async () => {
    if (!checkAi()) return;
    setLoading(true);
    setError(null);
    const res = await getBillNegotiation();
    if ("error" in res) {
      setError(res.error);
    } else {
      await loadHistory();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await deleteBillNegotiation(id);
    toast.success("Deleted");
    await loadHistory();
  };

  const current = history[viewIndex] ?? null;
  const hasHistory = history.length > 0;

  return (
    <>
      <AiSetupDialog open={showSetup} onOpenChange={setShowSetup} />
      <section className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Scissors className="h-5 w-5 text-rose-500" />
              Bill Negotiator
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Scissors className="mr-1 h-4 w-4" />
                  {hasHistory ? "Re-analyze" : "Analyze"}
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            AI finds bills and subscriptions you can reduce or cancel.
          </p>
        </div>

        {error && (
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {!hasHistory && !loading && !historyLoading && !error && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 text-rose-400" />
              <p>Find savings in your bills, subscriptions, and recurring expenses.</p>
              <p className="text-xs mt-1">
                Analyzes your bills, installments, and 3 months of transactions.
              </p>
            </CardContent>
          </Card>
        )}

        {(loading || historyLoading) && !hasHistory && (
          <Card>
            <CardContent className="py-8 flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {loading ? "Scanning your expenses..." : "Loading history..."}
              </p>
            </CardContent>
          </Card>
        )}

        {current && (
          <div className="space-y-3">
            {/* History navigation */}
            <div className="flex items-center justify-between">
              {history.length > 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  disabled={viewIndex >= history.length - 1}
                  onClick={() => setViewIndex((i) => i + 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              ) : <div />}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <History className="h-3 w-3 shrink-0" />
                <span>
                  {new Date(current.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {history.length > 1 && (
                  <span>
                    ({viewIndex + 1}/{history.length})
                  </span>
                )}
              </div>
              {history.length > 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  disabled={viewIndex <= 0}
                  onClick={() => setViewIndex((i) => i - 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : <div />}
            </div>

            {/* Savings summary */}
            <Card className="border-rose-200 dark:border-rose-900/50">
              <CardContent className="pt-4 pb-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-lg border p-3">
                    <TrendingDown className="h-4 w-4 mx-auto text-rose-500 mb-1" />
                    <p className="text-[10px] text-muted-foreground">Monthly Savings</p>
                    <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(current.totalMonthlySavings)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <DollarSign className="h-4 w-4 mx-auto text-emerald-500 mb-1" />
                    <p className="text-[10px] text-muted-foreground">Yearly Savings</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(current.totalYearlySavings)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {current.recommendations.length} recommendation{current.recommendations.length !== 1 ? "s" : ""} found
                </p>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {current.recommendations.map((rec, idx) => (
              <RecommendationCard key={idx} rec={rec} />
            ))}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                AI suggestions — verify before taking action.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive"
                onClick={() => handleDelete(current.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function RecommendationCard({ rec }: { rec: BillNegotiatorRecommendation }) {
  const [expanded, setExpanded] = useState(false);
  const confidence = CONFIDENCE_CONFIG[rec.confidence] ?? CONFIDENCE_CONFIG.medium;
  const priority = PRIORITY_CONFIG[rec.priority] ?? PRIORITY_CONFIG.medium;

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm flex-1">{rec.title}</h4>
          <div className="flex gap-1 shrink-0">
            <Badge variant="outline" className={cn("text-[10px]", confidence.color)}>
              {confidence.label}
            </Badge>
            <div className={cn("h-2 w-2 rounded-full mt-1.5", priority.color)} title={priority.label} />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{rec.description}</p>

        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="secondary" className="text-[10px]">
            {CATEGORY_LABELS[rec.category] ?? rec.category}
          </Badge>
          {rec.currentAmount > 0 && (
            <span className="text-xs text-muted-foreground">
              Now: {formatCurrency(rec.currentAmount)}
            </span>
          )}
          {rec.suggestedAmount != null && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              Could be: {formatCurrency(rec.suggestedAmount)}
            </span>
          )}
          <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
            Save {formatCurrency(rec.monthlySavings)}/mo
          </span>
        </div>

        {/* Expandable action steps */}
        {rec.actionSteps.length > 0 && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "Hide steps" : `${rec.actionSteps.length} action steps`}
            </button>
            {expanded && (
              <ol className="space-y-1 pl-4 list-decimal">
                {rec.actionSteps.map((step, i) => (
                  <li key={i} className="text-xs text-muted-foreground">{step}</li>
                ))}
              </ol>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
