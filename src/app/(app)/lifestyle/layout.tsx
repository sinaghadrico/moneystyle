import { LifestyleTabs } from "@/components/lifestyle/lifestyle-tabs";
import { ProfileCompletenessBanner } from "@/components/lifestyle/profile-completeness-banner";

export default function LifestyleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <LifestyleTabs />
      <ProfileCompletenessBanner />
      {children}
    </div>
  );
}
