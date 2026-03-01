"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LeafletMapProps {
  lat: number;
  lng: number;
  onMapClick: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapCenterUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function DraggableMarker({ lat, lng, onDragEnd }: { lat: number; lng: number; onDragEnd: (lat: number, lng: number) => void }) {
  const markerRef = useRef<L.Marker>(null);
  const position = useMemo(() => ({ lat, lng }), [lat, lng]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const pos = marker.getLatLng();
          onDragEnd(pos.lat, pos.lng);
        }
      },
    }),
    [onDragEnd],
  );

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

export default function LeafletMap({ lat, lng, onMapClick }: LeafletMapProps) {
  const handleDragEnd = useCallback(
    (newLat: number, newLng: number) => {
      onMapClick(newLat, newLng);
    },
    [onMapClick],
  );

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker lat={lat} lng={lng} onDragEnd={handleDragEnd} />
      <MapClickHandler onMapClick={onMapClick} />
      <MapCenterUpdater lat={lat} lng={lng} />
    </MapContainer>
  );
}
