import { MealPlannerContent } from "@/components/meal-planner/meal-planner-content";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function MealsPage() {
  return (
    <FeatureGate feature="mealPlanner">
      <MealPlannerContent />
    </FeatureGate>
  );
}
