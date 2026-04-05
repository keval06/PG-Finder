"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pgPinIcon = L.divIcon({
  className: "",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:42px;">
    <svg width="32" height="42" viewBox="-30 -32 60 74">
      <path d="M 0,-30 C -16,-30 -28,-18 -28,-4 C -28,14 0,40 0,40 C 0,40 28,14 28,-4 C 28,-18 16,-30 0,-30 Z"
        fill="#0f172a" stroke="#fffeee" stroke-width="3"/>
      <text x="0" y="2" text-anchor="middle" fill="white" font-size="22" font-weight="bold">⌂</text>
    </svg>
  </div>`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
});

export default function PGLocationMap({ coordinate, address, city }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  let pos = null;
  if (coordinate?.coordinates?.length === 2) {
    pos = [coordinate.coordinates[1], coordinate.coordinates[0]];
  } else if (Array.isArray(coordinate) && coordinate.length === 2) {
    pos = [coordinate[1], coordinate[0]];
  }

  if (!pos) return null;

  // Get Directions: grab user's GPS, then open Google Maps with real origin
  const handleGetDirections = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          const url = `https://www.google.com/maps/dir/?api=1&origin=${p.coords.latitude},${p.coords.longitude}&destination=${pos[0]},${pos[1]}&travelmode=driving`;
          window.open(url, "_blank");
        },
        () => {
          // Fallback: let Google auto-detect
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${pos[0]},${pos[1]}`, "_blank");
        },
        { timeout: 5000 }
      );
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${pos[0]},${pos[1]}`, "_blank");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
        <h2 className="text-lg font-semibold">Where you'll be</h2>
        <div className="flex items-center gap-2">
          <a
            href={`https://www.google.com/maps?q=${pos[0]},${pos[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-100 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            View on Map
          </a>
          <button
            onClick={handleGetDirections}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-100 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            Get Directions
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {address}, {city}
      </p>

      <div className="w-full h-[340px] rounded-2xl overflow-hidden border border-gray-100">
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
