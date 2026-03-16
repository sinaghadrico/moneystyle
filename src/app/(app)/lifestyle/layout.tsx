import { LifestyleTabs } from "@/components/lifestyle/lifestyle-tabs";
import { ProfileCompletenessBanner } from "@/components/lifestyle/profile-completeness-banner";
import { FeatureGate } from "@/components/layout/feature-gate";

export default function LifestyleLayout({ children }: { children: React.ReactNode }) {
  return (
    <FeatureGate feature="lifestyle">
      <div className="space-y-6">
        <LifestyleTabs />
        <ProfileCompletenessBanner />
        {children}
      </div>
    </FeatureGate>
  );
}
