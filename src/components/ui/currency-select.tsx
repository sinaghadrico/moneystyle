"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getActiveCurrencies } from "@/actions/currencies";
import type { CurrencyData } from "@/lib/types";

let cachedCurrencies: CurrencyData[] | null = null;

export function CurrencySelect({
  value,
  onValueChange,
  id,
}: {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
}) {
  const [currencies, setCurrencies] = useState<CurrencyData[]>(
    cachedCurrencies ?? []
  );

  useEffect(() => {
    if (cachedCurrencies) return;
    getActiveCurrencies().then((data) => {
      cachedCurrencies = data;
      setCurrencies(data);
    });
  }, []);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.code} — {c.symbol} {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
