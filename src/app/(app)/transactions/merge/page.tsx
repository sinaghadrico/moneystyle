import { MergeSuggestionsContent } from "@/components/merge/merge-suggestions-content";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function TransactionsMergePage() {
  return (
    <FeatureGate feature="transactionMerge">
      <MergeSuggestionsContent />
    </FeatureGate>
  );
}
