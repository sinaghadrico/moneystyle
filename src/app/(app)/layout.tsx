export const dynamic = "force-dynamic";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SettingsProvider } from "@/components/settings/settings-provider";
import { OnboardingRedirect } from "@/components/onboarding/onboarding-redirect";
import { getOnboardingStatus } from "@/actions/onboarding";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const onboardingCompleted = await getOnboardingStatus();

  return (
    <SettingsProvider>
      <OnboardingRedirect onboardingCompleted={onboardingCompleted} />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 pb-36 md:p-6 md:pb-20">
            {children}
          </main>
        </div>
      </div>
      <BottomNav />
    </SettingsProvider>
  );
}
