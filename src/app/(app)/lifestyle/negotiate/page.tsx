import { BillNegotiatorSection } from "@/components/profile/bill-negotiator-section";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function NegotiatePage() {
  return (
    <FeatureGate feature="billNegotiator">
      <BillNegotiatorSection />
    </FeatureGate>
  );
}
