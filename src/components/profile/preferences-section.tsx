"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Film, UtensilsCrossed, Heart, X, Plus, Loader2, MapPin, Users } from "lucide-react";
import { updateUserPreferences } from "@/actions/weekend-planner";
import { toast } from "sonner";
import type { UserPreferenceData } from "@/lib/types";
import { UAE_CITIES, COMPANION_TYPES } from "@/lib/types";

type TagCategory = "entertainment" | "food" | "likes";

const SECTIONS: {
  key: TagCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
}[] = [
  {
    key: "entertainment",
    label: "Entertainment",
    icon: Film,
    placeholder: "e.g. Cinema, Hiking, Gaming...",
  },
  {
    key: "food",
    label: "Food Preferences",
    icon: UtensilsCrossed,
    placeholder: "e.g. Sushi, Iranian, Steak...",
  },
  {
    key: "likes",
    label: "Likes & Interests",
    icon: Heart,
    placeholder: "e.g. Nature, Art, Music...",
  },
];

export function PreferencesSection({
  preferences,
  onRefresh,
}: {
  preferences: UserPreferenceData;
  onRefresh: () => void;
}) {
  const [data, setData] = useState<UserPreferenceData>(preferences);
  const [saving, setSaving] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const addTag = async (category: TagCategory, value: string) => {
    const trimmed = value.trim();
    if (!trimmed || data[category].includes(trimmed)) return;

    const updated = {
      ...data,
      [category]: [...data[category], trimmed],
    };
    setData(updated);
    await save(updated);
  };

  const removeTag = async (category: TagCategory, index: number) => {
    const updated = {
      ...data,
      [category]: data[category].filter((_, i) => i !== index),
    };
    setData(updated);
    await save(updated);
  };

  const save = async (newData: UserPreferenceData) => {
    setSaving(true);
    const res = await updateUserPreferences(newData);
    if ("error" in res) {
      toast.error(res.error);
    }
    setSaving(false);
    onRefresh();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    category: TagCategory
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = inputRefs.current[category];
      if (input) {
        addTag(category, input.value);
        input.value = "";
      }
    }
  };

  const handleAdd = (category: TagCategory) => {
    const input = inputRefs.current[category];
    if (input) {
      addTag(category, input.value);
      input.value = "";
      input.focus();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Heart className="h-4 w-4 text-pink-500" />
          Preferences
          {saving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* City & Companion selects */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              City
            </div>
            <Select
              value={data.city}
              onValueChange={async (value) => {
                const updated = { ...data, city: value };
                setData(updated);
                await save(updated);
              }}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UAE_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-muted-foreground" />
              Companion
            </div>
            <Select
              value={data.companionType}
              onValueChange={async (value) => {
                const updated = { ...data, companionType: value };
                setData(updated);
                await save(updated);
              }}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPANION_TYPES.map((ct) => (
                  <SelectItem key={ct.value} value={ct.value}>
                    {ct.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.key} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {section.label}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data[section.key].map((tag, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(section.key, i)}
                      className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  ref={(el) => { inputRefs.current[section.key] = el; }}
                  placeholder={section.placeholder}
                  className="h-8 text-sm"
                  onKeyDown={(e) => handleKeyDown(e, section.key)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleAdd(section.key)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
