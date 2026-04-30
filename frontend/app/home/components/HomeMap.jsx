"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Maximize, X } from "lucide-react";
import InfoCard from "../../components/InfoCard";
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

// Rose dot icon for user's current location
const userDotIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#FF385C;border:3px solid white;box-shadow:0 0 0 2px #FF385C;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Custom home icon for PG markers
const pgPinIcon = L.divIcon({
  className: "",
  html: `<div style="width:36px;height:36px;border-radius:50%;background:#FF385C;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
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

// Handles map view changes ONLY for explicit user actions (location, fullscreen)
// Does NOT auto-zoom/pan when data changes (sort, filter, page)
function MapEffect({ userLocation, defaultMapCenter, isFullscreen, shouldFitBounds }) {
  const map = useMap();

  // Handle fullscreen container resize
  useEffect(() => {
    if (!map) return;
    setTimeout(() => map.invalidateSize(), 200);
  }, [map, isFullscreen]);

  // Only pan when userLocation toggles on/off
  useEffect(() => {
    if (!map) return;
    if (userLocation) {
      map.setView(userLocation, 13, { animate: true });
    }
  }, [map, userLocation]);

  // Fit bounds when shouldFitBounds flag is set (initial load only)
  useEffect(() => {
    if (!map || !shouldFitBounds || !defaultMapCenter) return;
    map.setView(defaultMapCenter, 11, { animate: false });
  }, [map, shouldFitBounds, defaultMapCenter]);

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
  const isInitialMount = useRef(true);
  useEffect(() => setMounted(true), []);

  // Only fit bounds on first load, not on sort/filter/page changes
  const [shouldFitBounds] = useState(true);

  const center = userLocation ??
    defaultMapCenter ?? { lat: 20.5937, lng: 78.9629 };
  const zoom = userLocation ? 13 : 11;

  // Track if this is the initial mount → prevent auto-zoom on data change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [pgs]);

  return (
    <div
      className={
        isFullscreen
          ? "relative h-full w-full rounded-3xl overflow-hidden border border-gray-200 shadow-2xl bg-white "
          : "relative h-full rounded-2xl md:rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-white"
      }
    >
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className={`absolute z-[500] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-all duration-300 flex items-center justify-center font-sans tracking-tight ${
          isFullscreen 
            ? 'top-6 right-6 px-5 py-2.5 rounded-xl gap-2 text-sm font-bold text-slate-900' 
            : 'top-4 right-4 px-5 py-2.5 rounded-xl gap-2 text-sm font-bold text-slate-800'
        }`}
      >
        {isFullscreen ? (
          <>
            <X size={22} strokeWidth={2.5} />
            <span>Close Map</span>
          </>
        ) : (
          <>
            <Maximize size={18} strokeWidth={2.5} />
            <span>Expand Map</span>
          </>
        )}
      </button>

      {mounted && (
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <MapEffect
            userLocation={userLocation}
            defaultMapCenter={defaultMapCenter}
            isFullscreen={isFullscreen}
            shouldFitBounds={isInitialMount.current}
          />

          {userLocation && (
            <Marker
              position={userLocation}
              icon={userDotIcon}
              zIndexOffset={100}
            />
          )}

          {/* Clustered PG markers */}
          <MarkerClusterGroup chunkedLoading>
            {pgs.map((pg) => {
              const pos = getLatLng(pg.coordinate);
              if (!pos) return null;
              return (
                <Marker
                  key={pg._id}
                  position={pos}
                  icon={pgPinIcon}
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
