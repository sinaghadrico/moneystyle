import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCY } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let _currencyOverride: string | null = null;

export function setCurrencyOverride(currency: string) {
  _currencyOverride = currency;
}

export function formatCurrency(amount: number, currency?: string): string {
  const cur = currency || _currencyOverride || CURRENCY;
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMonth(dateStr: string): string {
  const d = new Date(dateStr + "-01");
  return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

export function getDateRange(period: string): Date | null {
  const now = new Date();
  switch (period) {
    case "3m":
      return new Date(now.getFullYear(), now.getMonth() - 3, 1);
    case "6m":
      return new Date(now.getFullYear(), now.getMonth() - 6, 1);
    case "1y":
      return new Date(now.getFullYear() - 1, now.getMonth(), 1);
    default:
      return null;
  }
}
