"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  generateWealthPlan,
  getWealthPlanHistory,
  toggleWealthAction,
  deleteWealthPlan,
} from "@/actions/wealth-pilot";
import { formatCurrency } from "@/lib/utils";
import type { WealthPlanHistoryItem, WealthAction, WealthScoreBreakdown } from "@/lib/types";
import {
  Rocket,
  Loader2,
  Lightbulb,
  History,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Zap,
  Repeat,
  TrendingUp,
  BarChart3,
  Scissors,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Shield,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { useAiCheck, AiSetupDialog } from "@/components/ai-setup-dialog";
import { cn } from "@/lib/utils";

const CATEGORY_CONFIG = {
  quick_win: { label: "Quick Win", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
  monthly_habit: { label: "Monthly Habit", icon: Repeat, color: "text-blue-500", bg: "bg-blue-500/10" },
  growth_move: { label: "Growth Move", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  trade_signal: { label: "Trade Signal", icon: BarChart3, color: "text-purple-500", bg: "bg-purple-500/10" },
  expense_hack: { label: "Expense Hack", icon: Scissors, color: "text-rose-500", bg: "bg-rose-500/10" },
} as const;

const TIMELINE_LABELS = {
  tomorrow: "Tomorrow",
  this_week: "This Week",
  this_month: "This Month",
  next_3_months: "Next 3 Months",
} as const;

const RISK_COLORS = {
  low: "text-green-600 bg-green-50 dark:bg-green-950/30",
  medium: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30",
  high: "text-red-600 bg-red-50 dark:bg-red-950/30",
};

function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 70 ? "text-emerald-500" : score >= 40 ? "text-amber-500" : "text-red-500";
  const ring =
    score >= 70 ? "stroke-emerald-500" : score >= 40 ? "stroke-amber-500" : "stroke-red-500";
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" className="stroke-muted" />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={ring}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 1s ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold", color)}>{score}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function ScoreBreakdown({ breakdown }: { breakdown: WealthScoreBreakdown }) {
  const items = [
    { key: "savingsRate", label: "Savings Rate", icon: Target, ...breakdown.savingsRate },
    { key: "emergencyFund", label: "Emergency Fund", icon: Shield, ...breakdown.emergencyFund },
    { key: "diversification", label: "Diversification", icon: BarChart3, ...breakdown.diversification },
    { key: "debtRatio", label: "Debt Ratio", icon: TrendingUp, ...breakdown.debtRatio },
    { key: "passiveIncome", label: "Passive Income", icon: Zap, ...breakdown.passiveIncome },
  ];

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const pct = (item.score / item.max) * 100;
        const color = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500";
        const Icon = item.icon;
        return (
          <div key={item.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {item.score}/{item.max}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground">{item.detail}</p>
          </div>
        );
      })}
    </div>
  );
}

function ActionCard({
  action,
  completed,
  onToggle,
}: {
  action: WealthAction;
  completed: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = CATEGORY_CONFIG[action.category] ?? CATEGORY_CONFIG.quick_win;
  const Icon = config.icon;

  return (
    <Card className={cn(completed && "opacity-60")}>
      <CardContent className="pt-4 pb-4 space-y-2">
        <div className="flex items-start gap-2">
          <button onClick={onToggle} className="mt-0.5 shrink-0">
            {completed ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className={cn("font-semibold text-sm", completed && "line-through")}>
                {action.title}
              </h4>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap pl-7">
          <Badge variant="outline" className={cn("text-[10px] gap-1", config.color)}>
            <Icon className="h-2.5 w-2.5" />
            {config.label}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {TIMELINE_LABELS[action.timeline] ?? action.timeline}
          </Badge>
          <Badge variant="outline" className={cn("text-[10px]", RISK_COLORS[action.risk])}>
            {action.risk} risk
          </Badge>
        </div>

        <div className="flex items-center gap-3 pl-7 flex-wrap">
          {action.expectedReturn && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {action.expectedReturn}
            </span>
          )}
          {action.platform && (
            <span className="text-xs text-muted-foreground">
              via {action.platform}
            </span>
          )}
        </div>

        {action.steps.length > 0 && (
          <div className="pl-7">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "Hide steps" : `${action.steps.length} steps`}
            </button>
            {expanded && (
              <ol className="space-y-1 pl-4 list-decimal mt-1">
                {action.steps.map((step, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    {step}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function WealthPilotContent() {
  const [history, setHistory] = useState<WealthPlanHistoryItem[]>([]);
  const [viewIndex, setViewIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const loadHistory = async () => {
    setHistoryLoading(true);
    const items = await getWealthPlanHistory();
    setHistory(items);
    setViewIndex(0);
    setHistoryLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const { checkAi, showSetup, setShowSetup } = useAiCheck();

  const handleGenerate = async () => {
    if (!checkAi()) return;
    setLoading(true);
    setError(null);
    const res = await generateWealthPlan();
    if ("error" in res) {
      setError(res.error);
    } else {
      await loadHistory();
    }
    setLoading(false);
  };

  const handleToggleAction = async (actionId: string) => {
    const plan = history[viewIndex];
    if (!plan) return;
    const res = await toggleWealthAction(plan.id, actionId);
    if ("completed" in res) {
      setHistory((prev) =>
        prev.map((p) =>
          p.id === plan.id ? { ...p, completedActions: res.completed ?? [] } : p
        )
      );
    }
  };

  const handleDelete = async (id: string) => {
    await deleteWealthPlan(id);
    toast.success("Plan deleted");
    await loadHistory();
  };

  const current = history[viewIndex] ?? null;
  const hasHistory = history.length > 0;

  const filteredActions = current
    ? activeFilter
      ? current.actions.filter((a) => a.category === activeFilter)
      : current.actions
    : [];

  const completedCount = current
    ? current.actions.filter((a) => current.completedActions.includes(a.id)).length
    : 0;

  return (
    <>
      <AiSetupDialog open={showSetup} onOpenChange={setShowSetup} />
      <section className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Rocket className="h-5 w-5 text-violet-500" />
              Wealth Pilot
            </h2>
            <Button size="sm" variant="outline" onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Rocket className="mr-1 h-4 w-4" />
                  {hasHistory ? "New Plan" : "Generate Plan"}
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-powered action plan to grow your wealth with exact steps.
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
              <Lightbulb className="h-8 w-8 mx-auto mb-2 text-violet-400" />
              <p>Get a personalized wealth growth plan with exact action steps.</p>
              <p className="text-xs mt-1">
                Uses your real income, expenses, and reserves data.
              </p>
            </CardContent>
          </Card>
        )}

        {(loading || historyLoading) && !hasHistory && (
          <Card>
            <CardContent className="py-8 flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {loading ? "Building your wealth plan..." : "Loading..."}
              </p>
            </CardContent>
          </Card>
        )}

        {current && (
          <div className="space-y-4">
            {/* History nav */}
            {history.length > 1 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost" size="sm" className="h-8 px-2"
                  disabled={viewIndex >= history.length - 1}
                  onClick={() => setViewIndex((i) => i + 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <History className="h-3 w-3" />
                  {new Date(current.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                  <span>({viewIndex + 1}/{history.length})</span>
                </div>
                <Button
                  variant="ghost" size="sm" className="h-8 px-2"
                  disabled={viewIndex <= 0}
                  onClick={() => setViewIndex((i) => i - 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Wealth Score */}
            <Card>
              <CardContent className="pt-4 pb-4">
                <h3 className="text-xs font-medium text-muted-foreground text-center mb-2">
                  Wealth Score
                </h3>
                <ScoreGauge score={current.wealthScore} />
                <p className="text-sm text-center mt-3 font-medium">{current.summary}</p>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="rounded-lg border p-2">
                    <p className="text-[10px] text-muted-foreground">Monthly Surplus</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(current.monthlySurplus)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-2">
                    <p className="text-[10px] text-muted-foreground">Investable</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(current.investableCapital)}
                    </p>
                  </div>
                  <div className="rounded-lg border p-2">
                    <p className="text-[10px] text-muted-foreground">Actions</p>
                    <p className="text-sm font-bold">
                      {completedCount}/{current.actions.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card>
              <CardContent className="pt-4 pb-4">
                <h3 className="text-xs font-medium text-muted-foreground mb-3">Score Breakdown</h3>
                <ScoreBreakdown breakdown={current.scoreBreakdown} />
              </CardContent>
            </Card>

            {/* Projections */}
            <Card>
              <CardContent className="pt-4 pb-4">
                <h3 className="text-xs font-medium text-muted-foreground mb-3">
                  Wealth Projections
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] text-muted-foreground">1 Year</p>
                    <p className="text-sm font-bold">{formatCurrency(current.projections.oneYear)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] text-muted-foreground">3 Years</p>
                    <p className="text-sm font-bold">{formatCurrency(current.projections.threeYear)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] text-muted-foreground">5 Years</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(current.projections.fiveYear)}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  {current.projections.assumptions}
                </p>
              </CardContent>
            </Card>

            {/* Category filter */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveFilter(null)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors border",
                  !activeFilter
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "bg-muted/50 text-muted-foreground border-border"
                )}
              >
                All ({current.actions.length})
              </button>
              {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map((cat) => {
                const count = current.actions.filter((a) => a.category === cat).length;
                if (count === 0) return null;
                const cfg = CATEGORY_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors border",
                      activeFilter === cat
                        ? "bg-primary text-primary-foreground border-transparent"
                        : "bg-muted/50 text-muted-foreground border-border"
                    )}
                  >
                    {cfg.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            {filteredActions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                completed={current.completedActions.includes(action.id)}
                onToggle={() => handleToggleAction(action.id)}
              />
            ))}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Not financial advice. Always do your own research.
              </p>
              <Button
                variant="ghost" size="sm" className="h-7 text-xs text-destructive"
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
