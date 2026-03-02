"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  MonthlyData,
  CategoryBreakdown,
  MerchantTotal,
  MonthlyCategoryData,
  CategoryMeta,
} from "@/lib/types";
import { formatMonth } from "@/lib/utils";

const currencyFormatter = (value: number | undefined) =>
  `AED ${(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

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

const legendStyle = {
  fontSize: 12,
  paddingTop: 12,
  color: "var(--muted-foreground)",
  fill: "var(--muted-foreground)",
};

const axisStyle = {
  fontSize: 11,
  fill: "var(--muted-foreground)",
};

export function MonthlyBarChart({ data }: { data: MonthlyData[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Monthly Income vs Expense
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4} barCategoryGap="20%">
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6} />
                </linearGradient>
              </defs>
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
                cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              />
              <Legend wrapperStyle={legendStyle} />
              <Bar
                dataKey="income"
                fill="url(#incomeGrad)"
                radius={[6, 6, 0, 0]}
                name="Income"
              />
              <Bar
                dataKey="expense"
                fill="url(#expenseGrad)"
                radius={[6, 6, 0, 0]}
                name="Expense"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoryDonut({ data }: { data: CategoryBreakdown[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.total, 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Expense by Category
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[320px] flex">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  dataKey="total"
                  nameKey="name"
                  paddingAngle={2}
                  strokeWidth={0}
                  onMouseEnter={(_, i) => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.color}
                      opacity={
                        activeIndex === null || activeIndex === index ? 1 : 0.4
                      }
                      style={{ transition: "opacity 0.2s", cursor: "pointer" }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={currencyFormatter}
                  contentStyle={tooltipStyle}
                  labelStyle={tooltipLabelStyle}
                />
                {/* Center label */}
                <text
                  x="50%"
                  y="48%"
                  textAnchor="middle"
                  fill="var(--foreground)"
                  fontSize={20}
                  fontWeight={700}
                >
                  {currencyFormatter(total)}
                </text>
                <text
                  x="50%"
                  y="56%"
                  textAnchor="middle"
                  fill="var(--muted-foreground)"
                  fontSize={11}
                >
                  Total
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-[140px] flex flex-col justify-center gap-1.5 pr-2">
            {data.slice(0, 7).map((entry, i) => (
              <div
                key={entry.name}
                className="flex items-center gap-2 text-xs"
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                style={{
                  opacity: activeIndex === null || activeIndex === i ? 1 : 0.4,
                  transition: "opacity 0.2s",
                  cursor: "pointer",
                }}
              >
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="truncate flex-1 text-muted-foreground">
                  {entry.name}
                </span>
                <span className="font-medium tabular-nums">
                  {total > 0 ? ((entry.total / total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopMerchantsChart({ data }: { data: MerchantTotal[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Top 10 Merchants
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barSize={18}>
              <defs>
                <linearGradient id="merchantGrad" x1="0" y1="0" x2="1" y2="0">
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
                dataKey="total"
                fill="url(#merchantGrad)"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function MonthlyCategoryChart({
  data,
  categories,
}: {
  data: MonthlyCategoryData[];
  categories: CategoryMeta[];
}) {
  const [visible, setVisible] = useState<Set<string>>(
    () => new Set(categories.map((c) => c.name)),
  );

  const toggle = (name: string) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const allSelected = visible.size === categories.length;
  const toggleAll = () => {
    if (allSelected) {
      setVisible(new Set());
    } else {
      setVisible(new Set(categories.map((c) => c.name)));
    }
  };

  const chartData = data.map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Monthly Expense by Category
        </CardTitle>
        <div className="flex flex-wrap gap-1.5 pt-2">
          <Badge
            variant={allSelected ? "default" : "outline"}
            className="cursor-pointer select-none text-xs px-2.5 py-0.5 rounded-full transition-all"
            onClick={toggleAll}
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.name}
              variant={visible.has(cat.name) ? "default" : "outline"}
              className="cursor-pointer select-none text-xs px-2.5 py-0.5 rounded-full transition-all"
              style={
                visible.has(cat.name)
                  ? {
                      backgroundColor: cat.color,
                      borderColor: cat.color,
                      color: "#fff",
                    }
                  : { color: cat.color, borderColor: cat.color }
              }
              onClick={() => toggle(cat.name)}
            >
              {cat.name}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="15%">
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
                cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              />
              <Legend wrapperStyle={{ ...legendStyle, fontSize: 11 }} />
              {categories
                .filter((cat) => visible.has(cat.name))
                .map((cat) => (
                  <Bar
                    key={cat.name}
                    dataKey={cat.name}
                    stackId="category"
                    fill={cat.color}
                    radius={[0, 0, 0, 0]}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function MonthlyTrendChart({ data }: { data: MonthlyData[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatMonth(d.month),
    net: Math.round((d.income - d.expense) * 100) / 100,
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Legend wrapperStyle={legendStyle} />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={2.5}
                fill="url(#incomeArea)"
                dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2.5}
                fill="url(#expenseArea)"
                dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                name="Expense"
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                name="Net"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
