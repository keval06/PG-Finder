"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Maximize, Minimize } from "lucide-react";
import InfoCard from "../../components/InfoCard";
import Button from "../../atoms/Button";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";

// Fix broken Leaflet default icons in Next.js/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Blue dot icon for user's current location
const userDotIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563EB;border:3px solid white;box-shadow:0 0 0 2px #2563EB;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Helper: convert GeoJSON {coordinates:[lng,lat]} OR flat [lng,lat] → [lat,lng] for Leaflet
const getLatLng = (coordinate) => {
  if (!coordinate) return null;
  if (coordinate.coordinates?.length === 2) {
    return [coordinate.coordinates[1], coordinate.coordinates[0]];
  }
  if (Array.isArray(coordinate) && coordinate.length === 2) {
    return [coordinate[1], coordinate[0]];
  }
  return null;
};

// Pans the map when userLocation or defaultMapCenter changes
// Also calls invalidateSize when isFullscreen changes (container resize)
function MapEffect({ userLocation, defaultMapCenter, isFullscreen }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    // Give the DOM a moment to apply the new container size
    setTimeout(() => map.invalidateSize(), 200);
  }, [map, isFullscreen]);

  useEffect(() => {
    if (!map) return;
    if (userLocation) {
      map.setZoom(13);
      map.panTo(userLocation);
    } else if (defaultMapCenter) {
      map.setZoom(11);
      map.panTo(defaultMapCenter);
    }
  }, [map, userLocation, defaultMapCenter]);
  return null;
}

export default function HomeMap({
  pgs,
  userLocation,
  defaultMapCenter,
  activePin,
  setActivePin,
  isFullscreen,
  setIsFullscreen,
}) {
  // Leaflet needs window/DOM → only render after client mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const center = userLocation ??
    defaultMapCenter ?? { lat: 20.5937, lng: 78.9629 };
  const zoom = userLocation ? 13 : 11;

  return (
    <div
      className={
        isFullscreen
          ? "relative h-full w-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-white"
          : "relative h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white"
      }
    >
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl text-slate-700 text-[11px] font-semibold shadow-md hover:bg-white active:scale-95 transition-all"
      >
        {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        {isFullscreen ? "Collapse" : "Expand"}
      </button>

      {mounted && (
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <MapEffect
            userLocation={userLocation}
            defaultMapCenter={defaultMapCenter}
            isFullscreen={isFullscreen}
          />

          {userLocation && (
            <Marker
              position={userLocation}
              icon={userDotIcon}
              zIndexOffset={100}
            />
          )}

          {/* After (with clustering): */}
          <MarkerClusterGroup chunkedLoading>
            {pgs.map((pg) => {
              const pos = getLatLng(pg.coordinate);
              if (!pos) return null;
              return (
                <Marker
                  key={pg._id}
                  position={pos}
                  eventHandlers={{ click: () => setActivePin(pg) }}
                />
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      )}

      {activePin && (
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[999] w-[260px]"
          style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.18))" }}
        >
          <InfoCard
            activePin={activePin}
            avg={
              activePin.ratingData?.avg
                ? parseFloat(activePin.ratingData.avg).toFixed(1)
                : null
            }
            count={activePin.ratingData?.count || 0}
            setActivePin={setActivePin}
          />
        </div>
      )}
    </div>
  );
}
