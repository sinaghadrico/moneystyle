"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftRight } from "lucide-react";
import { useSettingsContext, type Settings } from "@/components/settings/settings-context";
import { CurrencyManagementSection } from "@/components/settings/currency-management-section";

export default function SettingsTransactionsPage() {
  const { settings, accounts, update } = useSettingsContext();

  if (!settings) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowLeftRight className="h-4 w-4" />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="txType">Default Transaction Type</Label>
            <Select
              value={settings.defaultTransactionType}
              onValueChange={(v) => update({ defaultTransactionType: v as Settings["defaultTransactionType"] })}
            >
              <SelectTrigger id="txType" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultAccount">Default Account</Label>
            <Select
              value={settings.defaultAccountId ?? "none"}
              onValueChange={(v) =>
                update({ defaultAccountId: v === "none" ? null : v })
              }
            >
              <SelectTrigger id="defaultAccount" className="w-full">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="autoCategorize">
              Auto-categorize by merchant rules
            </Label>
            <Switch
              id="autoCategorize"
              checked={settings.autoCategorize}
              onCheckedChange={(v) => update({ autoCategorize: v })}
            />
          </div>
        </CardContent>
      </Card>

      <CurrencyManagementSection />
    </div>
  );
}
