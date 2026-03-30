"use client";

import { useEffect } from "react";
import { Marker, Map, useMap } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { Maximize, Minimize } from "lucide-react";
import InfoCard from "../../components/InfoCard";
import Button from "../../atoms/Button";

// Helper for GeoJSON or flat array coordinates
const getLatLng = (coordinate) => {
  if (!coordinate) return null;
  if (coordinate.coordinates?.length === 2) {
    return { lat: coordinate.coordinates[1], lng: coordinate.coordinates[0] };
  }
  if (Array.isArray(coordinate) && coordinate.length === 2) {
    return { lat: coordinate[1], lng: coordinate[0] };
  }
  return null;
};

function MapEffect({ userLocation, defaultMapCenter }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (userLocation) {
      map.setZoom(13);
      map.panTo(userLocation);
    } else if (defaultMapCenter) {
      map.setZoom(11);
      map.panTo(defaultMapCenter);
    }
  }, [map, userLocation, defaultMapCenter?.lat, defaultMapCenter?.lng]);
  return null;
}

function ClusteredMarkers({ pgs, setActivePin }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const markers = pgs
      .map((pg) => {
        const pos = getLatLng(pg.coordinate);
        if (!pos) return null;
        const marker = new google.maps.Marker({
          position: pos,
          title: pg.name,
        });
        marker.addListener("click", () => setActivePin(pg));
        return marker;
      })
      .filter(Boolean);

    const clusterer = new MarkerClusterer({ markers, map });
    return () => {
      clusterer.clearMarkers();
      markers.forEach((m) => google.maps.event.clearInstanceListeners(m));
    };
  }, [map, pgs]);
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
  return (
    <div
      className={
        isFullscreen
          ? "relative h-full w-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-white"
          : "relative h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white"
      }
    >
      <Button
        onClick={() => setIsFullscreen(!isFullscreen)}
        variant="outline"
        size="md"
        className="absolute top-4 right-4 z-10 bg-white shadow-lg border-slate-200"
        icon={isFullscreen ? Minimize : Maximize}
      >
        {isFullscreen ? "Collapse" : "Expand"}
      </Button>

      <Map
        mapId={process.env.NEXT_PUBLIC_MAP_ID}
        defaultZoom={userLocation ? 13 : 11}
        defaultCenter={
          userLocation ?? defaultMapCenter ?? { lat: 20.5937, lng: 78.9629 }
        }
        disableDefaultUI={true}
        gestureHandling="cooperative"
        style={{ width: "100%", height: "100%" }}
      >
        <MapEffect
          userLocation={userLocation}
          defaultMapCenter={defaultMapCenter}
        />

        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: "M-10,0a10,10 0 1,0 20,0a10,10 0 1,0 -20,0",
              fillColor: "#2563EB",
              fillOpacity: 1,
              strokeWeight: 3,
              strokeColor: "#ffffff",
              scale: 0.7,
              anchor: { x: 0, y: 0 },
            }}
            zIndex={100}
          />
        )}

        <ClusteredMarkers pgs={pgs} setActivePin={setActivePin} />
      </Map>

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
