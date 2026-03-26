"use client";

import { SubscriptionsSection } from "@/components/profile/subscriptions-section";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function SubscriptionsPage() {
  return (
    <FeatureGate feature="profileSubscriptions">
      <SubscriptionsSection />
    </FeatureGate>
  );
}
