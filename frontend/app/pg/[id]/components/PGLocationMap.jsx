"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { Loader2, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pgPinIcon = L.divIcon({
  className: "",
  html: `<div style="width:36px;height:36px;border-radius:50%;background:#FF385C;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

export default function PGLocationMap({ coordinate, address, city }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => setMounted(true), []);

  let pos = null;
  if (coordinate?.coordinates?.length === 2) {
    pos = [coordinate.coordinates[1], coordinate.coordinates[0]];
  } else if (Array.isArray(coordinate) && coordinate.length === 2) {
    pos = [coordinate[1], coordinate[0]];
  }

  if (!pos) return null;

  // Detect mobile for native map app opening
  const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Build map URLs for different platforms
  const getDirectionsUrl = (originLat, originLng) => {
    if (isIOS) {
      return originLat
        ? `https://maps.apple.com/?saddr=${originLat},${originLng}&daddr=${pos[0]},${pos[1]}&dirflg=d`
        : `https://maps.apple.com/?daddr=${pos[0]},${pos[1]}&dirflg=d`;
    }
    // Android + Desktop: Google Maps directions URL
    // On Android, this auto-opens in the Google Maps app if installed
    return originLat
      ? `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${pos[0]},${pos[1]}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${pos[0]},${pos[1]}`;
  };

  // "Open in Maps" — opens the location (not directions) in native app
  const viewOnMapUrl = isIOS
    ? `https://maps.apple.com/?q=${pos[0]},${pos[1]}`
    : `https://www.google.com/maps/search/?api=1&query=${pos[0]},${pos[1]}`;

  // Get Directions: grab user's GPS, then open appropriate map app
  const handleGetDirections = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (p) => {
          setLoading(false);
          const url = getDirectionsUrl(p.coords.latitude, p.coords.longitude);
          window.open(url, "_blank");
        },
        () => {
          setLoading(false);
          window.open(getDirectionsUrl(), "_blank");
        },
        { timeout: 7000, enableHighAccuracy: true }
      );
    } else {
      window.open(getDirectionsUrl(), "_blank");
    }
  };

  return (
    <div className="bg-white">
      {/* Heading + Buttons inline */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-[22px] font-semibold text-[#222222]">
          Where you&apos;ll be
        </h2>
        <div className="flex items-center gap-3">
          <a
            href={viewOnMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#222222] underline hover:text-rose-500 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            {isMobile ? "View location" : "View on Google Maps"}
          </a>
          <button
            onClick={handleGetDirections}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 text-sm font-medium transition-all ${
              loading 
                ? "text-slate-300 cursor-not-allowed"
                : "text-[#222222] underline hover:text-rose-500"
            }`}
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Navigation size={14} />
            )}
            <span>{loading ? "Locating..." : "Get directions"}</span>
          </button>
        </div>
      </div>

      <p className="text-[#717171] text-sm mb-3">
        {address}, {city}
      </p>

      <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
        {mounted && (
          <MapContainer
            center={pos}
            zoom={15}
            style={{ width: "100%", height: "100%" }}
            zoomControl={true}
            scrollWheelZoom={true}
            dragging={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <Marker position={pos} icon={pgPinIcon} />
          </MapContainer>
        )}
      </div>
    </div>
  );
}
