import { WealthPilotContent } from "@/components/wealth/wealth-pilot-content";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function WealthPage() {
  return (
    <FeatureGate feature="wealthPilot">
      <WealthPilotContent />
    </FeatureGate>
  );
}
