"use client";

import { useSettingsContext } from "@/components/settings/settings-context";
import { FeatureFlagsSection } from "@/components/settings/feature-flags-section";
import { type FeatureFlags } from "@/lib/feature-flags";
import { redirect } from "next/navigation";

export default function FeaturesSettingsPage() {
  const { settings, update, isAdmin } = useSettingsContext();

  if (!isAdmin) {
    redirect("/settings");
  }

  if (!settings) return null;

  return (
    <FeatureFlagsSection
      flags={settings.featureFlags}
      onChange={(flags: FeatureFlags) => update({ featureFlags: flags })}
    />
  );
}
