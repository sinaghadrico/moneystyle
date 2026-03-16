"use client";

import { useFeatureFlag } from "@/components/settings/settings-provider";
import type { FeatureKey } from "@/lib/feature-flags";
import { Lock } from "lucide-react";

export function FeatureGate({
  feature,
  children,
}: {
  feature: FeatureKey;
  children: React.ReactNode;
}) {
  const enabled = useFeatureFlag(feature);

  if (!enabled) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Feature Unavailable</h2>
          <p className="text-sm text-muted-foreground">
            This feature is currently disabled by the administrator.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
