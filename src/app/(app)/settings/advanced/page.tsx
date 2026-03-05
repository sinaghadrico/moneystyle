"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Loader2 } from "lucide-react";
import { useSettingsContext } from "@/components/settings/settings-context";

export default function SettingsAdvancedPage() {
  const { handleExport, exportingCsv, exportingJson } = useSettingsContext();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-4 w-4" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
            disabled={exportingCsv}
          >
            {exportingCsv ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("json")}
            disabled={exportingJson}
          >
            {exportingJson ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export JSON
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Export all transactions with categories, accounts, and tags
        </p>
      </CardContent>
    </Card>
  );
}
