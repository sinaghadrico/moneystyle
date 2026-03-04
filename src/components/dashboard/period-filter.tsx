"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PERIOD_OPTIONS } from "@/lib/constants";
import type { PeriodFilter } from "@/lib/types";

export function PeriodFilterSelect({
  value,
  onChange,
}: {
  value: PeriodFilter;
  onChange: (value: PeriodFilter) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as PeriodFilter)}>
      <SelectTrigger className="flex-1 sm:w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
