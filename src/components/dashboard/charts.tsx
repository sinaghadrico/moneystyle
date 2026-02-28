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

export function MonthlyBarChart({ data }: { data: MonthlyData[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Income vs Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" className="text-xs" />
              <YAxis tickFormatter={currencyFormatter} className="text-xs" />
              <Tooltip
                formatter={currencyFormatter}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoryDonut({ data }: { data: CategoryBreakdown[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Expense by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="total"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={currencyFormatter} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopMerchantsChart({ data }: { data: MerchantTotal[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top 10 Merchants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tickFormatter={currencyFormatter} className="text-xs" />
              <YAxis
                type="category"
                dataKey="merchant"
                width={120}
                className="text-xs"
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={currencyFormatter} />
              <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
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
    () => new Set(categories.map((c) => c.name))
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Expense by Category</CardTitle>
        <div className="flex flex-wrap gap-1.5 pt-2">
          <Badge
            variant={allSelected ? "default" : "outline"}
            className="cursor-pointer select-none text-xs"
            onClick={toggleAll}
          >
            All
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.name}
              variant={visible.has(cat.name) ? "default" : "outline"}
              className="cursor-pointer select-none text-xs"
              style={
                visible.has(cat.name)
                  ? { backgroundColor: cat.color, borderColor: cat.color }
                  : { color: cat.color, borderColor: cat.color }
              }
              onClick={() => toggle(cat.name)}
            >
              {cat.name}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" className="text-xs" />
              <YAxis tickFormatter={currencyFormatter} className="text-xs" />
              <Tooltip
                formatter={currencyFormatter}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {categories
                .filter((cat) => visible.has(cat.name))
                .map((cat) => (
                  <Bar
                    key={cat.name}
                    dataKey={cat.name}
                    stackId="category"
                    fill={cat.color}
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" className="text-xs" />
              <YAxis tickFormatter={currencyFormatter} className="text-xs" />
              <Tooltip
                formatter={currencyFormatter}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
