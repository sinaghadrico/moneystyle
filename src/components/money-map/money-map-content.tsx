"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ChevronDown, ChevronRight, TrendingUp, Map as MapIcon } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  getLocationStats,
  getLocationTimeline,
  type LocationStat,
} from "@/actions/transactions";
import { cn } from "@/lib/utils";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

function GoogleMapView({ locations }: { locations: LocationStat[] }) {
  const mapLocations = useMemo(
    () => locations.filter((l) => l.latitude && l.longitude),
    [locations],
  );
  const [selectedLocation, setSelectedLocation] = useState<LocationStat | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";

  if (!apiKey || mapLocations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-muted/30 rounded-lg border">
        <MapIcon className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          {!apiKey ? "Google Maps API key not set" : "No GPS data yet"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Use the 📍 button when adding transactions to capture GPS
        </p>
      </div>
    );
  }

  const center = {
    lat: mapLocations.reduce((s, l) => s + l.latitude!, 0) / mapLocations.length,
    lng: mapLocations.reduce((s, l) => s + l.longitude!, 0) / mapLocations.length,
  };

  const maxSpend = Math.max(...mapLocations.map((l) => l.totalSpent), 1);

  function getMarkerScale(amount: number): number {
    const ratio = amount / maxSpend;
    return 0.8 + ratio * 0.7;
  }

  function getMarkerColor(amount: number): string {
    const ratio = amount / maxSpend;
    if (ratio > 0.6) return "#ef4444";
    if (ratio > 0.3) return "#f59e0b";
    return "#10b981";
  }

  return (
    <div className="rounded-lg overflow-hidden border h-[400px]">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={12}
          gestureHandling="greedy"
          disableDefaultUI
          zoomControl
          mapId="money-map-view"
        >
          {mapLocations.map((loc) => (
            <AdvancedMarker
              key={loc.location}
              position={{ lat: loc.latitude!, lng: loc.longitude! }}
              onClick={() => setSelectedLocation(loc)}
            >
              <Pin
                background={getMarkerColor(loc.totalSpent)}
                borderColor="#fff"
                glyphColor="#fff"
                scale={getMarkerScale(loc.totalSpent)}
              />
            </AdvancedMarker>
          ))}

          {selectedLocation && selectedLocation.latitude && selectedLocation.longitude && (
            <InfoWindow
              position={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
              onCloseClick={() => setSelectedLocation(null)}
            >
              <div style={{ padding: 4, minWidth: 140 }}>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  {selectedLocation.location}
                </p>
                <p style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>
                  {formatCurrency(selectedLocation.totalSpent)}
                </p>
                <p style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                  {selectedLocation.count} transaction{selectedLocation.count !== 1 ? "s" : ""} · {selectedLocation.topCategory}
                </p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}

export function MoneyMapContent() {
  const [stats, setStats] = useState<LocationStat[]>([]);
  const [timeline, setTimeline] = useState<
    {
      location: string;
      transactions: {
        id: string;
        date: string;
        amount: number | null;
        merchant: string | null;
        description: string | null;
        category: string | null;
      }[];
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(
    new Set(),
  );
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [s, t] = await Promise.all([
        getLocationStats(),
        getLocationTimeline(),
      ]);
      setStats(s);
      setTimeline(t);
      setLoading(false);
    }
    load();
  }, []);

  const maxSpend = stats.length > 0 ? stats[0].totalSpent : 1;

  function toggleLocation(loc: string) {
    setExpandedLocations((prev) => {
      const next = new Set(prev);
      if (next.has(loc)) next.delete(loc);
      else next.add(loc);
      return next;
    });
  }

  function getSpendColor(amount: number): string {
    const ratio = amount / maxSpend;
    if (ratio > 0.6) return "bg-red-500";
    if (ratio > 0.3) return "bg-yellow-500";
    return "bg-emerald-500";
  }

  function getSpendTextColor(amount: number): string {
    const ratio = amount / maxSpend;
    if (ratio > 0.6) return "text-red-600 dark:text-red-400";
    if (ratio > 0.3) return "text-yellow-600 dark:text-yellow-400";
    return "text-emerald-600 dark:text-emerald-400";
  }

  function getBubbleSize(amount: number): number {
    const minSize = 48;
    const maxSize = 140;
    if (maxSpend === 0) return minSize;
    const ratio = amount / maxSpend;
    return Math.round(minSize + ratio * (maxSize - minSize));
  }

  const bubbleColors = [
    "bg-emerald-500/80 hover:bg-emerald-500",
    "bg-blue-500/80 hover:bg-blue-500",
    "bg-purple-500/80 hover:bg-purple-500",
    "bg-orange-500/80 hover:bg-orange-500",
    "bg-pink-500/80 hover:bg-pink-500",
    "bg-cyan-500/80 hover:bg-cyan-500",
    "bg-amber-500/80 hover:bg-amber-500",
    "bg-indigo-500/80 hover:bg-indigo-500",
    "bg-rose-500/80 hover:bg-rose-500",
    "bg-teal-500/80 hover:bg-teal-500",
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          Money Map
        </h2>
        <Skeleton className="h-[350px] rounded-lg" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          Money Map
        </h2>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No location data yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Add locations to your transactions to see spending by place.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <MapPin className="h-6 w-6" />
        Money Map
      </h2>

      {/* Google Map */}
      <GoogleMapView locations={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Locations — Ranked List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <TrendingUp className="h-4 w-4" />
              Top Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.slice(0, 15).map((loc, idx) => (
              <div key={loc.location} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-muted-foreground w-5 shrink-0">
                      #{idx + 1}
                    </span>
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="font-medium truncate">{loc.location}</span>
                    {loc.latitude && (
                      <span className="text-[10px] text-emerald-500">📍</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {loc.count} txn{loc.count !== 1 ? "s" : ""}
                    </span>
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        getSpendTextColor(loc.totalSpent),
                      )}
                    >
                      {formatCurrency(loc.totalSpent)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        getSpendColor(loc.totalSpent),
                      )}
                      style={{
                        width: `${Math.max((loc.totalSpent / maxSpend) * 100, 2)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-20 text-right truncate">
                    {loc.topCategory}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Location Bubble Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <MapPin className="h-4 w-4" />
              Spending Bubbles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-center gap-3 min-h-[300px] py-4">
              {stats.slice(0, 10).map((loc, idx) => {
                const size = getBubbleSize(loc.totalSpent);
                return (
                  <div
                    key={loc.location}
                    className="group relative"
                    title={`${loc.location}: ${formatCurrency(loc.totalSpent)} (${loc.count} transactions)`}
                  >
                    <div
                      className={cn(
                        "rounded-full flex items-center justify-center text-white cursor-default transition-all shadow-md",
                        bubbleColors[idx % bubbleColors.length],
                      )}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                      }}
                    >
                      <div className="text-center px-1">
                        <div
                          className={cn(
                            "font-semibold leading-tight",
                            size < 70 ? "text-[10px]" : "text-xs",
                          )}
                        >
                          {loc.location.length > 12
                            ? loc.location.slice(0, 10) + "..."
                            : loc.location}
                        </div>
                        <div
                          className={cn(
                            "opacity-90",
                            size < 70 ? "text-[8px]" : "text-[10px]",
                          )}
                        >
                          {formatCurrency(loc.totalSpent)}
                        </div>
                      </div>
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-popover text-popover-foreground rounded-lg shadow-lg border px-3 py-2 text-xs whitespace-nowrap">
                        <div className="font-semibold">{loc.location}</div>
                        <div>{formatCurrency(loc.totalSpent)}</div>
                        <div className="text-muted-foreground">
                          {loc.count} transaction{loc.count !== 1 ? "s" : ""} &middot; {loc.topCategory}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <MapPin className="h-4 w-4" />
            Recent by Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {timeline.map((group) => {
            const isExpanded = expandedLocations.has(group.location);
            const totalSpent = group.transactions.reduce(
              (sum, tx) => sum + (tx.amount ?? 0),
              0,
            );

            return (
              <div key={group.location} className="border-b last:border-b-0">
                <button
                  type="button"
                  onClick={() => toggleLocation(group.location)}
                  className="flex w-full items-center justify-between py-3 px-1 text-sm hover:bg-muted/50 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{group.location}</span>
                    <span className="text-xs text-muted-foreground">
                      ({group.transactions.length})
                    </span>
                  </div>
                  <span className="font-semibold text-sm">
                    {formatCurrency(totalSpent)}
                  </span>
                </button>

                {isExpanded && (
                  <div className="pl-10 pb-3 space-y-2">
                    {group.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {tx.merchant || tx.description || "Transaction"}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{formatDate(tx.date)}</span>
                            {tx.category && (
                              <>
                                <span>&middot;</span>
                                <span>{tx.category}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="font-medium shrink-0 ml-3">
                          {tx.amount != null
                            ? formatCurrency(tx.amount)
                            : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {timeline.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No location-tagged transactions yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
