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
          ? "relative h-full w-full rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-white "
          : "relative h-full rounded-2xl md:rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white"
      }
    >
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className={`absolute ${isFullscreen ? 'top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center' : 'top-4 right-4 px-4 py-2 rounded-xl flex items-center gap-2 text-[12px] md:text-sm'} z-[500] bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 font-bold shadow-xl hover:bg-white active:scale-95 transition-all`}
      >
        {isFullscreen ? <X size={20} /> : <Maximize size={18} />}
        {!isFullscreen && "Expand Map"}
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
