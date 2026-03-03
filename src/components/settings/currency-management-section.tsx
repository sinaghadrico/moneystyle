"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { toast } from "sonner";
import { Coins, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  getAllCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
} from "@/actions/currencies";
import type { CurrencyData } from "@/lib/types";

export function CurrencyManagementSection() {
  const [currencies, setCurrencies] = useState<CurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CurrencyData | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadCurrencies = useCallback(async () => {
    setLoading(true);
    const data = await getAllCurrencies();
    setCurrencies(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCurrencies();
  }, [loadCurrencies]);

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (c: CurrencyData) => {
    setEditing(c);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await deleteCurrency(id);
    toast.success("🗑️ Currency deleted");
    setDeleting(null);
    loadCurrencies();
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="h-4 w-4" />
              Currencies
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleAdd}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : currencies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No currencies configured.</p>
          ) : (
            <div className="space-y-2">
              {currencies.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-sm font-medium">{c.code}</span>
                    <span className="text-sm text-muted-foreground truncate">
                      {c.symbol} {c.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      1 {c.code} = {c.rateToUsd} USD
                    </span>
                    {!c.isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(c)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(c.id)}
                      disabled={deleting === c.id}
                    >
                      {deleting === c.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CurrencyDialog
        currency={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={loadCurrencies}
      />
    </>
  );
}

function CurrencyDialog({
  currency,
  open,
  onOpenChange,
  onSuccess,
}: {
  currency: CurrencyData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const isEdit = !!currency;
  const [code, setCode] = useState(currency?.code ?? "");
  const [name, setName] = useState(currency?.name ?? "");
  const [symbol, setSymbol] = useState(currency?.symbol ?? "");
  const [rateToUsd, setRateToUsd] = useState(
    currency?.rateToUsd?.toString() ?? ""
  );
  const [isActive, setIsActive] = useState(currency?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset form when currency/open changes
  useEffect(() => {
    if (open) {
      setCode(currency?.code ?? "");
      setName(currency?.name ?? "");
      setSymbol(currency?.symbol ?? "");
      setRateToUsd(currency?.rateToUsd?.toString() ?? "");
      setIsActive(currency?.isActive ?? true);
      setError("");
    }
  }, [currency, open]);

  const handleSave = async () => {
    setError("");
    setSaving(true);

    const data = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      symbol: symbol.trim(),
      rateToUsd: parseFloat(rateToUsd),
      isActive,
    };

    const result = isEdit
      ? await updateCurrency(currency!.id, data)
      : await createCurrency(data);

    if (result.error) {
      const errors = result.error;
      if (typeof errors === "string") {
        setError(errors);
      } else {
        setError(
          Object.values(errors as Record<string, string[]>)
            .flat()
            .join(", ")
        );
      }
    } else {
      toast.success(isEdit ? "✅ Currency updated" : "✅ Currency added");
      onOpenChange(false);
      onSuccess();
    }
    setSaving(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {isEdit ? "Edit Currency" : "Add Currency"}
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="USD"
                maxLength={5}
              />
            </div>
            <div className="grid gap-2">
              <Label>Symbol</Label>
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="$"
                maxLength={10}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="US Dollar"
            />
          </div>
          <div className="grid gap-2">
            <Label>Rate to USD (1 unit = X USD)</Label>
            <Input
              type="number"
              step="any"
              value={rateToUsd}
              onChange={(e) => setRateToUsd(e.target.value)}
              placeholder="1.0"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label>Active</Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !code.trim() || !name.trim() || !symbol.trim() || !rateToUsd}
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Add"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
