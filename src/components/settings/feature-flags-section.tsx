"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ToggleLeft } from "lucide-react";
import { FEATURE_LABELS, type FeatureKey, type FeatureFlags } from "@/lib/feature-flags";

const FEATURE_GROUPS: { title: string; keys: FeatureKey[] }[] = [
  {
    title: "Lifestyle",
    keys: ["billNegotiator", "weekendPlanner", "mealPlanner", "shoppingLists"],
  },
  {
    title: "AI & Tools",
    keys: ["moneyPilot", "chat", "receiptScanner", "moneyMap"],
  },
  {
    title: "Transactions",
    keys: ["priceAnalysis", "transactionMerge", "importCsv", "importAi", "importTelegram", "txAdd", "txEdit", "txDelete", "txSplit", "txItems", "txConfirm", "txMood", "txMerchants"],
  },
  {
    title: "Dashboard",
    keys: ["dashPrediction", "dashBudgets", "dashSavings", "dashDebts", "dashCategoryChart", "dashHeatmap", "dashCharts", "dashNetWorth", "dashMood", "dashPriceWatch", "spendingWrapped"],
  },
  {
    title: "Profile",
    keys: ["profileIncome", "profilePayments", "profileSubscriptions", "profileCashflow", "profileGoals", "profileHousehold", "profileTips", "profileChallenges", "profileTravel"],
  },
  {
    title: "General",
    keys: ["onboarding"],
  },
];

export function FeatureFlagsSection({
  flags,
  onChange,
}: {
  flags: FeatureFlags;
  onChange: (flags: FeatureFlags) => void;
}) {
  const toggleGroup = (keys: FeatureKey[], value: boolean) => {
    const updated = { ...flags };
    for (const key of keys) updated[key] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {FEATURE_GROUPS.map((group) => {
        const allOn = group.keys.every((k) => flags[k]);
        const allOff = group.keys.every((k) => !flags[k]);

        return (
          <Card key={group.title}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ToggleLeft className="h-4 w-4" />
                  {group.title}
                </CardTitle>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.keys, !allOn)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {allOn ? "Disable all" : allOff ? "Enable all" : "Enable all"}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.keys.map((key) => {
                const { label, description } = FEATURE_LABELS[key];
                return (
                  <div key={key} className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label htmlFor={`ff-${key}`} className="text-sm font-medium">
                        {label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    <Switch
                      id={`ff-${key}`}
                      checked={flags[key]}
                      onCheckedChange={(v) => onChange({ ...flags, [key]: v })}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
