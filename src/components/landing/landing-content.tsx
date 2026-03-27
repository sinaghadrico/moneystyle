"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { signInAsDemo } from "@/actions/auth";
import { useInView } from "@/hooks/use-in-view";
import { useTelegramAutoAuth } from "@/hooks/use-telegram-auto-auth";
import { LandingHero } from "./landing-hero";
import { LandingSections } from "./landing-sections";
import { LandingFeatures } from "./landing-features";
import { LandingFooter } from "./landing-footer";

// ─── Component ───────────────────────────────────────────────────────────────

export function LandingContent() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);
  const { isTelegram: isTelegramMiniApp, authStatus: tgAuthStatus, signInWithTelegram } = useTelegramAutoAuth();

  const hero = useInView(0.1);
  const pain = useInView(0.15);
  const whyTrack = useInView(0.15);
  const pillars = [useInView(0.15), useInView(0.15), useInView(0.15)];
  const howItWorks = useInView(0.15);
  const comparison = useInView(0.15);
  const features = useInView(0.1);
  const trust = useInView(0.15);
  const ctaSection = useInView(0.15);

  const handleDemo = async () => {
    setDemoLoading(true);
    if (isLoggedIn) {
      await signOut({ redirect: false });
    }
    const result = await signInAsDemo();
    if (result.success) {
      window.location.href = "/dashboard";
    }
    setDemoLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
      <LandingHero
        isLoggedIn={isLoggedIn}
        isTelegramMiniApp={isTelegramMiniApp}
        tgAuthStatus={tgAuthStatus}
        theme={theme}
        demoLoading={demoLoading}
        heroRef={hero.ref}
        heroInView={hero.inView}
        onSetTheme={setTheme}
        onDemo={handleDemo}
        onSignInWithTelegram={signInWithTelegram}
      />

      <LandingSections
        painRef={pain.ref}
        painInView={pain.inView}
        whyTrackRef={whyTrack.ref}
        whyTrackInView={whyTrack.inView}
        pillarRefs={pillars.map((p) => p.ref)}
        pillarInViews={pillars.map((p) => p.inView)}
        howItWorksRef={howItWorks.ref}
        howItWorksInView={howItWorks.inView}
        comparisonRef={comparison.ref}
        comparisonInView={comparison.inView}
      />

      <LandingFeatures
        featuresRef={features.ref}
        featuresInView={features.inView}
      />

      <LandingFooter
        isLoggedIn={isLoggedIn}
        demoLoading={demoLoading}
        trustRef={trust.ref}
        trustInView={trust.inView}
        ctaRef={ctaSection.ref}
        ctaInView={ctaSection.inView}
        onDemo={handleDemo}
      />
    </div>
  );
}
