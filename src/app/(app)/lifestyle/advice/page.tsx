import { MoneyAdviceSection } from "@/components/profile/money-advice-section";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function AdvicePage() {
  return (
    <FeatureGate feature="moneyAdvice">
      <MoneyAdviceSection />
    </FeatureGate>
  );
}
