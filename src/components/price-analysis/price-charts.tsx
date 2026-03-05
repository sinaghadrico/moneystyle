"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import type { ItemPricePoint, ItemMerchantStats } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";

const tooltipStyle = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  padding: "10px 14px",
  fontSize: "13px",
  color: "var(--foreground)",
  fill: "var(--foreground)",
};

const tooltipLabelStyle = {
  color: "var(--foreground)",
  fill: "var(--foreground)",
};

const axisStyle = {
  fontSize: 11,
  fill: "var(--muted-foreground)",
};

const MERCHANT_COLORS = [
  "#3b82f6",
  "#22c55e",
  "#ef4444",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

const currencyFormatter = (value: number | undefined) =>
  formatCurrency(value ?? 0);

export function ItemPriceHistoryChart({ data }: { data: ItemPricePoint[] }) {
  // Group by merchant for multi-line
  const merchants = [...new Set(data.map((d) => d.merchant))];

  // Build chart data: each point = date + price per merchant
  const dateMap = new Map<string, Record<string, number>>();
  for (const point of data) {
    const dateKey = point.date.slice(0, 10);
    let entry = dateMap.get(dateKey);
    if (!entry) {
      entry = {};
      dateMap.set(dateKey, entry);
    }
    entry[point.merchant] = point.price;
  }

  const chartData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, prices]) => ({
      date,
      label: formatDate(date),
      ...prices,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No price history available
      </div>
    );
  }

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
            opacity={0.5}
          />
          <XAxis
            dataKey="label"
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tickFormatter={currencyFormatter}
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
            dx={-4}
          />
          <Tooltip
            formatter={currencyFormatter}
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            cursor={{
              stroke: "var(--muted-foreground)",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12, color: "var(--muted-foreground)", fill: "var(--muted-foreground)" }} />
          {merchants.map((merchant, i) => (
            <Line
              key={merchant}
              type="monotone"
              dataKey={merchant}
              stroke={MERCHANT_COLORS[i % MERCHANT_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: MERCHANT_COLORS[i % MERCHANT_COLORS.length] }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
              connectNulls
              name={merchant}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MerchantComparisonChart({ data }: { data: ItemMerchantStats[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        No merchant data available
      </div>
    );
  }

  const chartData = data.map((d) => ({
    merchant: d.merchant,
    avgPrice: d.avgPrice,
    minPrice: d.minPrice,
    maxPrice: d.maxPrice,
  }));

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" barSize={18}>
          <defs>
            <linearGradient id="priceBarGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="var(--border)"
            opacity={0.5}
          />
          <XAxis
            type="number"
            tickFormatter={currencyFormatter}
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="merchant"
            width={110}
            tick={{ ...axisStyle, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={currencyFormatter}
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            cursor={{ fill: "var(--muted)", opacity: 0.3 }}
          />
          <Bar
            dataKey="avgPrice"
            fill="url(#priceBarGrad)"
            radius={[0, 6, 6, 0]}
            name="Avg Price"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
