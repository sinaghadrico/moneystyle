import { ShoppingBasketsSection } from "@/components/lifestyle/shopping-baskets-section";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function ShoppingPage() {
  return (
    <FeatureGate feature="shoppingLists">
      <ShoppingBasketsSection />
    </FeatureGate>
  );
}
