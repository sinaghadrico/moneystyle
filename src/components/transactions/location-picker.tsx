"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Crosshair, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLat?: number | null;
  initialLng?: number | null;
  initialLocation?: string;
  onConfirm: (data: {
    location: string;
    latitude: number;
    longitude: number;
  }) => void;
};

const DEFAULT_CENTER = { lat: 25.2048, lng: 55.2708 }; // Dubai

// --- Places Autocomplete Input ---
function PlacesSearch({
  onPlaceSelect,
}: {
  onPlaceSelect: (place: { name: string; lat: number; lng: number }) => void;
}) {
  const map = useMap();
  const places = useMapsLibrary("places");
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
      fields: ["geometry", "name", "formatted_address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const name = place.name || place.formatted_address || "";

        onPlaceSelect({ name, lat, lng });

        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(16);
        }
      }
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [places, map, onPlaceSelect]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search places..."
        className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

// --- Map Content (inside APIProvider) ---
function MapContent({
  position,
  center,
  onMapClick,
  onPlaceSelect,
  onMyLocation,
  locating,
}: {
  position: { lat: number; lng: number } | null;
  center: { lat: number; lng: number };
  onMapClick: (e: { detail: { latLng: { lat: number; lng: number } | null } }) => void;
  onPlaceSelect: (place: { name: string; lat: number; lng: number }) => void;
  onMyLocation: () => void;
  locating: boolean;
}) {
  return (
    <>
      <PlacesSearch onPlaceSelect={onPlaceSelect} />

      <div className="rounded-lg overflow-hidden border h-[300px] relative mt-2">
        <Map
          defaultCenter={center}
          defaultZoom={13}
          gestureHandling="greedy"
          disableDefaultUI
          zoomControl
          onClick={onMapClick}
          mapId="money-map-picker"
        >
          {position && (
            <AdvancedMarker position={position}>
              <Pin
                background="#10b981"
                borderColor="#059669"
                glyphColor="#fff"
              />
            </AdvancedMarker>
          )}
        </Map>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="absolute bottom-3 right-3 shadow-md gap-1.5"
          onClick={onMyLocation}
          disabled={locating}
        >
          {locating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Crosshair className="h-3.5 w-3.5" />
          )}
          My Location
        </Button>
      </div>
    </>
  );
}

// --- Main Component ---
export function LocationPicker({
  open,
  onOpenChange,
  initialLat,
  initialLng,
  initialLocation,
  onConfirm,
}: Props) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null,
  );
  const [locationName, setLocationName] = useState(initialLocation || "");
  const [center, setCenter] = useState(
    initialLat && initialLng
      ? { lat: initialLat, lng: initialLng }
      : DEFAULT_CENTER,
  );
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (open && !position && !initialLat) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => {},
          { enableHighAccuracy: false, timeout: 5000 },
        );
      }
    }
  }, [open, position, initialLat]);

  const handleMapClick = useCallback((e: { detail: { latLng: { lat: number; lng: number } | null } }) => {
    if (e.detail.latLng) {
      setPosition({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
    }
  }, []);

  const handlePlaceSelect = useCallback((place: { name: string; lat: number; lng: number }) => {
    setPosition({ lat: place.lat, lng: place.lng });
    setLocationName(place.name);
  }, []);

  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(loc);
        setCenter(loc);
        setLocating(false);
        toast.success("📍 Current location set");
      },
      () => {
        setLocating(false);
        toast.error("Could not get location");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const handleConfirm = () => {
    if (!position) {
      toast.error("Select a location on the map");
      return;
    }
    onConfirm({
      location: locationName || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`,
      latitude: position.lat,
      longitude: position.lng,
    });
    onOpenChange(false);
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";

  if (!apiKey) {
    return (
      <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Pick Location</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            Google Maps API key not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to your .env file.
          </p>
          <ResponsiveDialogFooter>
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    );
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Pick Location</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="space-y-2">
          <APIProvider apiKey={apiKey} libraries={["places"]}>
            <MapContent
              position={position}
              center={center}
              onMapClick={handleMapClick}
              onPlaceSelect={handlePlaceSelect}
              onMyLocation={handleMyLocation}
              locating={locating}
            />
          </APIProvider>

          {position && (
            <p className="text-xs text-muted-foreground">
              📍 {locationName && <span className="font-medium text-foreground">{locationName} — </span>}
              {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </p>
          )}

          {!position && (
            <p className="text-xs text-muted-foreground">
              Search a place or tap on the map
            </p>
          )}
        </div>

        <ResponsiveDialogFooter>
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirm}
              disabled={!position}
            >
              Confirm
            </Button>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
