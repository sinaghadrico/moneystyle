"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  generateMealPlan,
  getMealPlans,
  deleteMealPlan,
  type MealPlanData,
  type MealData,
} from "@/actions/meal-planner";
import {
  ChefHat,
  Loader2,
  Sparkles,
  Coffee,
  Sun,
  Moon,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

const MEAL_ICONS = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
} as const;

const MEAL_LABELS: Record<string, string> = {
  breakfast: "صبحانه",
  lunch: "ناهار",
  dinner: "شام",
};

export function MealPlannerContent() {
  const [plans, setPlans] = useState<MealPlanData[]>([]);
  const [viewIndex, setViewIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const loadHistory = async () => {
    setHistoryLoading(true);
    const data = await getMealPlans();
    setPlans(data);
    setViewIndex(0);
    setHistoryLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    const res = await generateMealPlan();
    if ("error" in res) {
      setError(res.error);
    } else {
      await loadHistory();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMealPlan(id);
    toast.success("🗑️ Meal plan deleted");
    await loadHistory();
  };

  const current = plans[viewIndex] ?? null;

  const toggleMeal = (key: string) => {
    setExpandedMeal((prev) => (prev === key ? null : key));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ChefHat className="h-6 w-6" />
            Meal Planner
          </h2>
          <p className="text-muted-foreground">
            برنامه غذایی هفتگی بر اساس خریدهایت
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

      {error && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {!current && !loading && !historyLoading && !error && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ChefHat className="h-10 w-10 mx-auto mb-3 text-orange-400" />
            <p className="text-lg font-medium">No meal plans yet</p>
            <p className="text-sm mt-1">
              Generate a weekly Iranian meal plan based on your recent grocery
              purchases.
            </p>
          </CardContent>
        </Card>
      )}

      {(loading || historyLoading) && !current && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {loading
                ? "AI is planning your meals..."
                : "Loading plans..."}
            </p>
          </CardContent>
        </Card>
      )}

      {current && (
        <div className="space-y-4">
          {/* Navigation */}
          {plans.length > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                disabled={viewIndex >= plans.length - 1}
                onClick={() => {
                  setViewIndex((i) => i + 1);
                  setExpandedMeal(null);
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
                  setExpandedMeal(null);
                }}
              >
                Newer
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Days */}
          {current.days.map((day) => (
            <Card key={day.day}>
              <CardContent className="pt-4 pb-4 space-y-3">
                <h3 className="font-bold text-base">{day.day}</h3>
                {(["breakfast", "lunch", "dinner"] as const).map((mealKey) => {
                  const meal = day.meals?.[mealKey];
                  if (!meal) return null;
                  const Icon = MEAL_ICONS[mealKey];
                  const uniqueKey = `${day.day}-${mealKey}`;
                  const isExpanded = expandedMeal === uniqueKey;

                  return (
                    <MealCard
                      key={mealKey}
                      meal={meal}
                      mealLabel={MEAL_LABELS[mealKey]}
                      icon={Icon}
                      expanded={isExpanded}
                      onToggle={() => toggleMeal(uniqueKey)}
                    />
                  );
                })}
              </CardContent>
            </Card>
          ))}

          {/* Shopping List */}
          {current.shoppingList.length > 0 && (
            <Card>
              <CardContent className="pt-4 pb-4 space-y-2">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-orange-500" />
                  لیست خرید اضافی
                </h3>
                <div className="flex flex-wrap gap-2">
                  {current.shoppingList.map((item, idx) => (
                    <Badge key={idx} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Generated by AI based on your purchase history.
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

function MealCard({
  meal,
  mealLabel,
  icon: Icon,
  expanded,
  onToggle,
}: {
  meal: MealData;
  mealLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <span className="text-xs text-muted-foreground">{mealLabel}</span>
            <p className="font-medium text-sm truncate">{meal.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {meal.hasIngredients ? (
            <Badge
              variant="secondary"
              className="text-xs text-green-600 bg-green-500/10"
            >
              <Check className="h-3 w-3 mr-0.5" />
              موجود
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="text-xs text-orange-600 bg-orange-500/10"
            >
              <X className="h-3 w-3 mr-0.5" />
              نیاز به خرید
            </Badge>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="border-t p-3 space-y-3 bg-muted/20">
          {Array.isArray(meal.ingredients) && meal.ingredients.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                مواد لازم
              </p>
              <div className="flex flex-wrap gap-1.5">
                {meal.ingredients.map((ing, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {ing}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {meal.recipe && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                دستور پخت
              </p>
              <p
                className="text-sm leading-relaxed whitespace-pre-line"
                dir="rtl"
              >
                {meal.recipe}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
