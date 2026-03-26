"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { Settings2, Palette, Sun, Moon, Monitor, Loader2 } from "lucide-react";
import { useSettingsContext, type Settings } from "@/components/settings/settings-context";
import { CurrencySelect } from "@/components/ui/currency-select";

export default function SettingsGeneralPage() {
  const { settings, update, saving, handleSave } = useSettingsContext();
  const { theme, setTheme } = useTheme();

  if (!settings) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="h-4 w-4" />
            General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Primary Currency</Label>
            <CurrencySelect
              id="currency"
              value={settings.currency}
              onValueChange={(v) => update({ currency: v })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pageSize">Default Page Size</Label>
            <Input
              id="pageSize"
              type="number"
              min={5}
              max={100}
              value={settings.defaultPageSize}
              onChange={(e) =>
                update({ defaultPageSize: parseInt(e.target.value) || 20 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dashboardPeriod">Dashboard Period</Label>
            <Select
              value={settings.defaultDashboardPeriod}
              onValueChange={(v) => update({ defaultDashboardPeriod: v as Settings["defaultDashboardPeriod"] })}
            >
              <SelectTrigger id="dashboardPeriod" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm" className="mt-2">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex-1"
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex-1"
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
                className="flex-1"
              >
                <Monitor className="mr-2 h-4 w-4" />
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
