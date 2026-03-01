"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon - kept for reference
const _defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const statusColors: Record<string, string> = {
  ACTIVE: "#22c55e",
  EXPIRED: "#ef4444",
  PENDING: "#eab308",
  SUSPENDED: "#6b7280",
};

interface MapEquipment {
  id: string;
  name: string;
  type: string;
  barcode: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  teraExpiryDate: string | null;
}

function createColorIcon(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color:${color};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  });
}

export function EquipmentMap({ equipment }: { equipment: MapEquipment[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  const withCoords = equipment.filter((e) => e.latitude && e.longitude);
  const filtered = filter === "ALL" ? withCoords : withCoords.filter((e) => e.status === filter);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([-6.2088, 106.8456], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    // Add filtered markers (with offset for same coordinates)
    const markers: L.Marker[] = [];

    // Group by coordinates to detect overlaps
    const coordGroups: Record<string, typeof filtered> = {};
    filtered.forEach((eq) => {
      if (!eq.latitude || !eq.longitude) return;
      const key = `${eq.latitude.toFixed(6)},${eq.longitude.toFixed(6)}`;
      if (!coordGroups[key]) coordGroups[key] = [];
      coordGroups[key].push(eq);
    });

    Object.values(coordGroups).forEach((group) => {
      group.forEach((eq, index) => {
        if (!eq.latitude || !eq.longitude) return;
        let lat = eq.latitude;
        let lng = eq.longitude;

        // Apply spiral offset if multiple markers at same location
        if (group.length > 1 && index > 0) {
          const angle = (index * 137.5 * Math.PI) / 180; // golden angle spiral
          const radius = 0.00015 * Math.sqrt(index); // ~15m radius increments
          lat += radius * Math.cos(angle);
          lng += radius * Math.sin(angle);
        }

        const icon = createColorIcon(statusColors[eq.status] || statusColors.ACTIVE);
        const marker = L.marker([lat, lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="min-width:200px">
            <strong>${eq.name}</strong><br/>
            <small style="color:#666">${eq.type}</small><br/>
            <small>Status: <strong>${eq.status}</strong></small><br/>
            <small>Barcode: <code>${eq.barcode}</code></small><br/>
            ${eq.teraExpiryDate ? `<small>Exp: ${new Date(eq.teraExpiryDate).toLocaleDateString("id-ID")}</small><br/>` : ""}
            ${eq.address ? `<small style="color:#666">${eq.address}</small><br/>` : ""}
            <div style="margin-top:8px">
              <a href="/dashboard/equipment/${eq.id}" style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:600;">
                Lihat Detail →
              </a>
            </div>
          </div>
        `);
        markers.push(marker);
      });
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [filtered]);

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "ALL", label: "Semua", count: withCoords.length },
          { value: "ACTIVE", label: "Aktif", count: withCoords.filter((e) => e.status === "ACTIVE").length },
          { value: "EXPIRED", label: "Expired", count: withCoords.filter((e) => e.status === "EXPIRED").length },
          { value: "PENDING", label: "Bersyarat", count: withCoords.filter((e) => e.status === "PENDING").length },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              filter === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Map */}
      <div ref={mapRef} className="h-[500px] rounded-lg border overflow-hidden" />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {Object.entries(statusColors).map(([key, color]) => (
          <div key={key} className="flex items-center gap-2">
            <div style={{ backgroundColor: color }} className="w-3 h-3 rounded-full" />
            <span>{key === "ACTIVE" ? "Aktif" : key === "EXPIRED" ? "Expired" : key === "PENDING" ? "Bersyarat" : "Ditangguhkan"}</span>
          </div>
        ))}
      </div>

      {withCoords.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Belum ada alat dengan koordinat lokasi. Tambahkan latitude & longitude saat mendaftarkan alat.
        </div>
      )}
    </div>
  );
}
