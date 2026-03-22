"use client";

import { useSettingsContext } from "@/components/settings/settings-context";
import { FeatureFlagsSection } from "@/components/settings/feature-flags-section";
import { type FeatureFlags } from "@/lib/feature-flags";
import {
  SettingsContextProvider,
} from "@/components/settings/settings-context";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function FeaturesInner() {
  const { settings, update, saving, handleSave, loading } = useSettingsContext();

  if (loading || !settings) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
      <FeatureFlagsSection
        flags={settings.featureFlags}
        onChange={(flags: FeatureFlags) => update({ featureFlags: flags })}
      />
    </div>
  );
}

export default function AdminFeaturesPage() {
  return (
    <SettingsContextProvider>
      <FeaturesInner />
    </SettingsContextProvider>
  );
}
