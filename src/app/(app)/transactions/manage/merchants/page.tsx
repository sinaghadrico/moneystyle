"use client";

import { MerchantsContent } from "@/components/merchants/merchants-content";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function MerchantsPage() {
  return (
    <FeatureGate feature="txMerchants">
      <MerchantsContent />
    </FeatureGate>
  );
}
