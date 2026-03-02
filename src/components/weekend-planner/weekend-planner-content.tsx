"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  generateWeekendPlan,
  getWeekendPlans,
  deleteWeekendPlan,
} from "@/actions/weekend-planner";
import {
  CalendarHeart,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  History,
  Trash2,
  MapPin,
  Clock,
  UtensilsCrossed,
  Lightbulb,
  DollarSign,
  ExternalLink,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import type { WeekendPlanData, WeekendOffer } from "@/lib/types";

const OFFER_TABS = [
  { key: 0, label: "اقتصادی" },
  { key: 1, label: "متعادل" },
  { key: 2, label: "ویژه" },
] as const;

const TIME_SLOT_COLORS: Record<string, string> = {
  "صبح": "bg-amber-500/10 text-amber-700",
  "ظهر": "bg-orange-500/10 text-orange-700",
  "عصر": "bg-blue-500/10 text-blue-700",
  "شب": "bg-indigo-500/10 text-indigo-700",
};

const FOOD_TYPE_COLORS: Record<string, string> = {
  restaurant: "bg-red-500/10 text-red-700",
  homemade: "bg-green-500/10 text-green-700",
  cafe: "bg-purple-500/10 text-purple-700",
};

const FOOD_TYPE_LABELS: Record<string, string> = {
  restaurant: "رستوران",
  homemade: "خانگی",
  cafe: "کافه",
};

export function WeekendPlannerContent() {
  const [plans, setPlans] = useState<WeekendPlanData[]>([]);
  const [viewIndex, setViewIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setHistoryLoading(true);
    const data = await getWeekendPlans();
    setPlans(data);
    setViewIndex(0);
    setActiveTab(0);
    setHistoryLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    const res = await generateWeekendPlan();
    if ("error" in res) {
      setError(res.error);
    } else {
      await loadHistory();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await deleteWeekendPlan(id);
    toast.success("Weekend plan deleted");
    await loadHistory();
  };

  const current = plans[viewIndex] ?? null;
  const currentOffer: WeekendOffer | null =
    current?.offers?.[activeTab] ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarHeart className="h-6 w-6" />
            Weekend Planner
          </h2>
          <p className="text-muted-foreground">
            برنامه‌ریزی آخر هفته بر اساس علایق و بودجه شما
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {plans.length > 0 ? "New Plan" : "Generate Plan"}
            </>
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!current && !loading && !historyLoading && !error && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CalendarHeart className="h-10 w-10 mx-auto mb-3 text-pink-400" />
            <p className="text-lg font-medium">No weekend plans yet</p>
            <p className="text-sm mt-1">
              Set your preferences in Profile, then generate a weekend plan.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {(loading || historyLoading) && !current && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {loading
                ? "AI is planning your weekend..."
                : "Loading plans..."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Current plan */}
      {current && currentOffer && (
        <div className="space-y-4">
          {/* History navigation */}
          {plans.length > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                disabled={viewIndex >= plans.length - 1}
                onClick={() => {
                  setViewIndex((i) => i + 1);
                  setActiveTab(0);
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Older
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <History className="h-3 w-3" />
                {new Date(current.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <span>
                  ({viewIndex + 1}/{plans.length})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={viewIndex <= 0}
                onClick={() => {
                  setViewIndex((i) => i - 1);
                  setActiveTab(0);
                }}
              >
                Newer
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Offer tabs */}
          {current.offers.length > 1 && (
            <div className="flex gap-2">
              {OFFER_TABS.map((tab) => {
                const offer = current.offers[tab.key];
                if (!offer) return null;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <span dir="rtl">{tab.label}</span>
                    <p className="text-xs mt-0.5 opacity-80">
                      {formatCurrency(offer.totalCost)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Summary card */}
          <Card>
            <CardContent className="pt-4 pb-4 space-y-2" dir="rtl">
              <h3 className="font-bold text-base">{currentOffer.title}</h3>
              <p className="text-sm text-muted-foreground">
                {currentOffer.summary}
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4 text-green-500" />
                هزینه کل: {formatCurrency(currentOffer.totalCost)}
              </div>
            </CardContent>
          </Card>

          {/* Activities */}
          {currentOffer.activities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                Activities
              </h4>
              {currentOffer.activities.map((activity, i) => (
                <Card key={i}>
                  <CardContent className="pt-3 pb-3 space-y-1.5" dir="rtl">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-medium text-sm">
                        {activity.name}
                      </h5>
                      <Badge
                        variant="secondary"
                        className={`text-xs shrink-0 ${TIME_SLOT_COLORS[activity.timeSlot] ?? ""}`}
                      >
                        {activity.timeSlot}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    {activity.location && (
                      <div className="flex items-center gap-2 text-xs">
                        <Navigation className="h-3 w-3 text-blue-500 shrink-0" />
                        <span className="text-muted-foreground">
                          {activity.location}
                          {activity.area && ` — ${activity.area}`}
                        </span>
                        {activity.mapUrl && (
                          <a
                            href={activity.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-blue-500 hover:text-blue-600 shrink-0"
                          >
                            <MapPin className="h-3 w-3" />
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(activity.estimatedCost)}
                      </span>
                      {activity.category && (
                        <Badge variant="outline" className="text-xs">
                          {activity.category}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Food suggestions */}
          {currentOffer.food.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-orange-500" />
                Food
              </h4>
              {currentOffer.food.map((f, i) => (
                <Card key={i}>
                  <CardContent className="pt-3 pb-3 space-y-1.5" dir="rtl">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {f.meal}
                        </span>
                        <h5 className="font-medium text-sm">{f.name}</h5>
                        {f.restaurant && (
                          <span className="text-xs text-muted-foreground">
                            {f.restaurant}
                          </span>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs shrink-0 ${FOOD_TYPE_COLORS[f.type] ?? ""}`}
                      >
                        {FOOD_TYPE_LABELS[f.type] ?? f.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {f.description}
                    </p>
                    {f.area && f.type !== "homemade" && (
                      <div className="flex items-center gap-2 text-xs">
                        <Navigation className="h-3 w-3 text-orange-500 shrink-0" />
                        <span className="text-muted-foreground">{f.area}</span>
                        {f.mapUrl && (
                          <a
                            href={f.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-blue-500 hover:text-blue-600 shrink-0"
                          >
                            <MapPin className="h-3 w-3" />
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      {formatCurrency(f.estimatedCost)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tips */}
          {currentOffer.tips.length > 0 && (
            <Card>
              <CardContent className="pt-4 pb-4 space-y-2" dir="rtl">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  نکات
                </h4>
                <ul className="space-y-1">
                  {currentOffer.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-xs mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Generated by AI based on your preferences and budget.
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
    </div>
  );
}
