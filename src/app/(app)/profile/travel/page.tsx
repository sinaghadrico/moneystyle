"use client";

import { TravelContent } from "@/components/travel/travel-content";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function ProfileTravelPage() {
  return (
    <FeatureGate feature="profileTravel">
      <TravelContent />
    </FeatureGate>
  );
}
