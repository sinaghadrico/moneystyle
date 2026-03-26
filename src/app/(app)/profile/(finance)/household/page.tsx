"use client";

import { HouseholdSection } from "@/components/profile/household-section";
import { HouseholdLeaderboard } from "@/components/profile/household-leaderboard";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function HouseholdPage() {
  return (
    <FeatureGate feature="profileHousehold">
      <div className="space-y-6">
        <HouseholdSection />
        <HouseholdLeaderboard />
      </div>
    </FeatureGate>
  );
}
