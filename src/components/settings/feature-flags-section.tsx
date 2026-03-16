"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ToggleLeft } from "lucide-react";
import { FEATURE_KEYS, FEATURE_LABELS, type FeatureFlags } from "@/lib/feature-flags";

export function FeatureFlagsSection({
  flags,
  onChange,
}: {
  flags: FeatureFlags;
  onChange: (flags: FeatureFlags) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ToggleLeft className="h-4 w-4" />
          Feature Flags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Toggle features on or off for all users.
        </p>
        {FEATURE_KEYS.map((key) => {
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
}
