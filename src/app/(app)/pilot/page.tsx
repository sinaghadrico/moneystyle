import { MoneyPilotContent } from "@/components/money-pilot/money-pilot-content";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function MoneyPilotPage() {
  return (
    <FeatureGate feature="moneyPilot">
      <MoneyPilotContent />
    </FeatureGate>
  );
}
