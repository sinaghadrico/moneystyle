"use client";

import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PreferencesSection } from "./preferences-section";
import { AccountSection } from "./account-section";
import { getUserProfile } from "@/actions/auth";
import { getUserPreferences } from "@/actions/weekend-planner";
import type { UserPreferenceData } from "@/lib/types";

export function ProfilePersonalContent() {
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferenceData>({
    entertainment: [],
    food: [],
    likes: [],
    city: "Dubai",
    companionType: "solo",
  });
  const [profile, setProfile] = useState<{
    name: string | null;
    username: string | null;
    email: string;
    image: string | null;
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [prefs, prof] = await Promise.all([
      getUserPreferences(),
      getUserProfile(),
    ]);
    setPreferences(prefs);
    if (prof) setProfile(prof);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[120px] rounded-lg" />
        <Skeleton className="h-[120px] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {profile && <AccountSection profile={profile} onRefresh={loadData} />}
      <PreferencesSection preferences={preferences} onRefresh={loadData} />
    </div>
  );
}
