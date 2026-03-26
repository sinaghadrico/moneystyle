"use client";

import { useSettingsContext } from "@/components/settings/settings-context";
import { FeatureFlagsSection } from "@/components/settings/feature-flags-section";
import { type FeatureFlags } from "@/lib/feature-flags";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export default function FeaturesSettingsPage() {
  const { settings, update, saving, handleSave, isAdmin } = useSettingsContext();

  if (!isAdmin) {
    redirect("/settings");
  }

  if (!settings) return null;

  return (
    <>
      <FeatureFlagsSection
        flags={settings.featureFlags}
        onChange={(flags: FeatureFlags) => update({ featureFlags: flags })}
      />
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </>
  );
}
