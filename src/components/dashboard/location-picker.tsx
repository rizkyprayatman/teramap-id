"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Crosshair, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import the entire map component to avoid SSR issues with Leaflet
const LeafletMap = dynamic(
  () => import("@/components/dashboard/leaflet-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] rounded-lg overflow-hidden border flex items-center justify-center bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

interface LocationPickerProps {
  defaultLat?: number | null;
  defaultLng?: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

export function LocationPicker({ defaultLat, defaultLng, onLocationChange }: LocationPickerProps) {
  const [lat, setLat] = useState(defaultLat ?? -6.2088);
  const [lng, setLng] = useState(defaultLng ?? 106.8456);
  const [showMap, setShowMap] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    // Import leaflet CSS via link tag
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
      document.head.appendChild(link);
    }
    import("leaflet").then((L) => {
      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
      setLeafletLoaded(true);
    });
  }, []);

  const handleMapClick = useCallback(
    (newLat: number, newLng: number) => {
      setLat(newLat);
      setLng(newLng);
      onLocationChange(newLat, newLng);
    },
    [onLocationChange]
  );

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setLat(newLat);
        setLng(newLng);
        onLocationChange(newLat, newLng);
        setIsGettingLocation(false);
      },
      () => {
        setIsGettingLocation(false);
        alert("Tidak dapat mendapatkan lokasi. Pastikan izin lokasi telah diberikan.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleLatChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setLat(num);
      onLocationChange(num, lng);
    }
  };

  const handleLngChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setLng(num);
      onLocationChange(lat, num);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Lokasi
        </h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Crosshair className="mr-1 h-3 w-3" />
            )}
            Lokasi Saat Ini
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowMap(!showMap)}
          >
            <MapPin className="mr-1 h-3 w-3" />
            {showMap ? "Tutup Peta" : "Pilih di Peta"}
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            value={lat ?? ""}
            onChange={(e) => handleLatChange(e.target.value)}
            placeholder="-6.2088"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            value={lng ?? ""}
            onChange={(e) => handleLngChange(e.target.value)}
            placeholder="106.8456"
          />
        </div>
      </div>

      {showMap && leafletLoaded && (
        <div className="h-[300px] rounded-lg overflow-hidden border">
          <LeafletMap
            lat={lat ?? -6.2088}
            lng={lng ?? 106.8456}
            onMapClick={handleMapClick}
          />
        </div>
      )}
    </div>
  );
}
