"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { CurrencySelect } from "@/components/ui/currency-select";
import { formatCurrency } from "@/lib/utils";
import {
  getTrips,
  getActiveTrip,
  createTrip,
  endTrip,
  getTripSummary,
} from "@/actions/trips";
import type { TripData, TripSummary } from "@/actions/trips";
import { toast } from "sonner";
import {
  Plane,
  Calendar,
  MapPin,
  TrendingUp,
  Clock,
  Ban,
  Loader2,
} from "lucide-react";

export function TravelContent() {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [activeTrip, setActiveTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [ending, setEnding] = useState(false);

  // Form state
  const [tripName, setTripName] = useState("");
  const [tripCurrency, setTripCurrency] = useState("USD");
  const [tripStartDate, setTripStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Summary dialog
  const [summaryTrip, setSummaryTrip] = useState<TripSummary | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allTrips, active] = await Promise.all([
        getTrips(),
        getActiveTrip(),
      ]);
      setTrips(allTrips);
      setActiveTrip(active);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTrip = async () => {
    if (!tripName.trim()) {
      toast.error("Please enter a trip name");
      return;
    }
    setCreating(true);
    const result = await createTrip({
      name: tripName,
      currency: tripCurrency,
      startDate: tripStartDate,
    });
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success(`Trip "${tripName}" started!`);
      setTripName("");
      setTripCurrency("USD");
      setTripStartDate(new Date().toISOString().split("T")[0]);
      await loadData();
    }
    setCreating(false);
  };

  const handleEndTrip = async () => {
    if (!activeTrip) return;
    setEnding(true);
    const result = await endTrip(activeTrip.id);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Trip ended!");
      await loadData();
    }
    setEnding(false);
  };

  const handleViewSummary = async (tripId: string) => {
    setSummaryLoading(true);
    setSummaryOpen(true);
    const result = await getTripSummary(tripId);
    if ("error" in result) {
      toast.error(result.error);
      setSummaryOpen(false);
    } else {
      setSummaryTrip(result);
    }
    setSummaryLoading(false);
  };

  const getDayNumber = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    return Math.max(
      1,
      Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    );
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pastTrips = trips.filter((t) => !t.isActive);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Plane className="h-6 w-6" />
        Travel Mode
      </h1>

      {/* Active Trip Banner */}
      {activeTrip && (
        <Card className="border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✈️</span>
                  <h2 className="text-lg font-bold">{activeTrip.name}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Day {getDayNumber(activeTrip.startDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {formatCurrency(activeTrip.totalSpent, activeTrip.currency)}{" "}
                    spent
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {activeTrip.transactionCount} transactions
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewSummary(activeTrip.id)}
                >
                  Summary
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEndTrip}
                  disabled={ending}
                >
                  {ending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Ban className="h-4 w-4 mr-1" />
                  )}
                  End Trip
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start New Trip */}
      {!activeTrip && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Start a New Trip
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="trip-name">Trip Name</Label>
              <Input
                id="trip-name"
                placeholder="e.g. Istanbul Trip"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="trip-currency">Currency</Label>
              <CurrencySelect
                id="trip-currency"
                value={tripCurrency}
                onValueChange={setTripCurrency}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="trip-start">Start Date</Label>
              <Input
                id="trip-start"
                type="date"
                value={tripStartDate}
                onChange={(e) => setTripStartDate(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleCreateTrip}
              disabled={creating || !tripName.trim()}
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plane className="h-4 w-4 mr-2" />
              )}
              Start Trip
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trip History */}
      {pastTrips.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Trip History
          </h2>
          {pastTrips.map((trip) => {
            const days = trip.endDate
              ? Math.max(
                  1,
                  Math.ceil(
                    (new Date(trip.endDate).getTime() -
                      new Date(trip.startDate).getTime()) /
                      (1000 * 60 * 60 * 24),
                  ),
                )
              : 1;
            return (
              <Card
                key={trip.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleViewSummary(trip.id)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{trip.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(trip.startDate)}
                        {trip.endDate && ` — ${formatDate(trip.endDate)}`}
                        {" · "}
                        {days} day{days > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(trip.totalSpent, trip.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {trip.transactionCount} transaction
                        {trip.transactionCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!activeTrip && pastTrips.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Plane className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              No trips yet. Start your first trip to track travel expenses in a
              separate currency!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Trip Summary Dialog */}
      <ResponsiveDialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <ResponsiveDialogContent className="max-w-lg">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {summaryTrip?.name ?? "Trip Summary"}
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>

          {summaryLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : summaryTrip ? (
            <div className="space-y-4 py-2">
              {/* Overview stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(
                      summaryTrip.totalSpent,
                      summaryTrip.currency,
                    )}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Daily Average</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(
                      summaryTrip.dailyAverage,
                      summaryTrip.currency,
                    )}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-lg font-bold">
                    {summaryTrip.daysCount} day
                    {summaryTrip.daysCount > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-bold">
                    {summaryTrip.transactionCount}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="text-sm text-muted-foreground text-center">
                {formatDate(summaryTrip.startDate)}
                {summaryTrip.endDate
                  ? ` — ${formatDate(summaryTrip.endDate)}`
                  : " — ongoing"}
              </div>

              {/* Category Breakdown */}
              {summaryTrip.categoryBreakdown.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">By Category</h4>
                  {summaryTrip.categoryBreakdown.map((cat) => {
                    const pct =
                      summaryTrip.totalSpent > 0
                        ? Math.round(
                            (cat.total / summaryTrip.totalSpent) * 100,
                          )
                        : 0;
                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span>{cat.name}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {formatCurrency(cat.total, summaryTrip.currency)} (
                            {pct}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Daily Spending Chart */}
              {summaryTrip.dailySpending.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Daily Spending</h4>
                  <div className="flex items-end gap-1 h-24">
                    {(() => {
                      const maxAmount = Math.max(
                        ...summaryTrip.dailySpending.map((d) => d.amount),
                      );
                      return summaryTrip.dailySpending.map((day) => (
                        <div
                          key={day.date}
                          className="flex-1 min-w-[4px] group relative"
                        >
                          <div
                            className="w-full rounded-t bg-emerald-500 transition-all hover:bg-emerald-400"
                            style={{
                              height: `${maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0}%`,
                              minHeight: day.amount > 0 ? "4px" : "0px",
                            }}
                          />
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                            <div className="bg-popover border rounded px-2 py-1 text-xs shadow-md whitespace-nowrap">
                              <p className="font-medium">
                                {formatCurrency(
                                  day.amount,
                                  summaryTrip.currency,
                                )}
                              </p>
                              <p className="text-muted-foreground">
                                {new Date(day.date).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" },
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>
                      {new Date(
                        summaryTrip.dailySpending[0].date,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span>
                      {new Date(
                        summaryTrip.dailySpending[
                          summaryTrip.dailySpending.length - 1
                        ].date,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <ResponsiveDialogFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSummaryOpen(false)}
            >
              Close
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
}
