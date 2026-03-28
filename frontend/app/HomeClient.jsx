"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSearch } from "./context/SearchContext";
import PGCard from "../components/PGCard";
import FilterPanel from "../components/FilterPanel";
import SortBtn from "../components/SortBtn";
import { SlidersHorizontal, Maximize, Minimize, MapPin, X } from "lucide-react";
import { usePGFilters } from "./hooks/usePGFilters";
import PaginationWrapper from "../components/PaginationWrapper";
import { Marker, Map, useMap } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import InfoCard from "./components/InfoCard";

// Helper at top of component — handles BOTH old flat array and new GeoJSON
const getLatLng = (coordinate) => {
  if (!coordinate) return null;
  // New GeoJSON shape: { type: "Point", coordinates: [lng, lat] }

  if (coordinate.coordinates?.length === 2) {
    return { lat: coordinate.coordinates[1], lng: coordinate.coordinates[0] };
  }
  // Old flat array fallback: [lng, lat]
  if (Array.isArray(coordinate) && coordinate.length === 2) {
    return { lat: coordinate[1], lng: coordinate[0] };
  }
  return null;
};

function MapEffect({ userLocation, defaultMapCenter }) {
  const map = useMap();
  // MapEffect — null guard
  useEffect(() => {
    if (!map) return;

    if (userLocation) {
      map.setZoom(13);
      map.panTo(userLocation);
    } 
    else if (defaultMapCenter) {
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

export default function HomeClient({
  data,
  pagination = { currentPage: 1, totalPages: 1, totalCount: 0 },
}) {
  const search = useSearch();
  const query = search?.query || "";
  const router = useRouter();
  const pathname = usePathname();

  const {
    sorted,
    fp,
    filterCount,
    sortField,
    sortOrder,
    toggleSort,
    drawerOpen,
    setDrawerOpen,
    hasFilters,
    clearFilters,
    active,
  } = usePGFilters(data, query, "remote");

  const searchParamsUrl = useSearchParams();
  const latParam = searchParamsUrl.get("lat");
  const lngParam = searchParamsUrl.get("lng");
  const radiusParam = searchParamsUrl.get("radius");

  const [activePin, setActivePin] = useState(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const isFirstRender = useRef(true);
  console.log(process.env.NEXT_PUBLIC_MAP_ID || "HI");

  // Geo state
  const [userLocation, setUserLocation] = useState(
    latParam && lngParam
      ? { lat: Number(latParam), lng: Number(lngParam) }
      : null
  );
  const [radius, setRadius] = useState(radiusParam ? Number(radiusParam) : 5);

  const buildParams = (pageOverride = null) => {
    const params = new URLSearchParams();
    if (userLocation) {
      params.append("lat", userLocation.lat);
      params.append("lng", userLocation.lng);
      params.append("radius", radius);
    }
    if (query) params.append("q", query);
    if (active.selectedPrice) {
      params.append("minprice", active.selectedPrice.min);
      if (isFinite(active.selectedPrice.max)) {
        params.append("maxprice", active.selectedPrice.max);
      }
    }
    if (active.selectedAmenities?.length > 0) {
      params.append("amenities", active.selectedAmenities.join(","));
    }
    if (active.genderFilter?.length > 0) {
      params.append("gender", active.genderFilter.join(","));
    }
    if (active.foodFilter?.length > 0) {
      params.append("food", active.foodFilter.join(","));
    }
    if (sortField) {
      params.append("sortField", sortField);
      params.append("sortOrder", sortOrder);
    }
    if (pageOverride !== null) {
      params.append("page", pageOverride);
    }
    return params;
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    const params = buildParams(newPage);
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  // Add this useEffect after sorted is available
  useEffect(() => {
    setActivePin(null);
  }, [sorted]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const debounceId = setTimeout(() => {
      const params = buildParams(1);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);
    return () => clearTimeout(debounceId);
  }, [
    active,
    query,
    sortField,
    sortOrder,
    pathname,
    router,
    userLocation,
    radius,
  ]);

  const handleNearMe = () => {
    if (userLocation) {
      setUserLocation(null);
      return;
    }
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => alert("Location permission denied.")
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const displayCount =
    pagination.totalCount > 0 ? pagination.totalCount : sorted.length;

  // 1. Read coordinates correctly from GeoJSON
  // defaultMapCenter — fix
  const firstPGWithCoord = sorted.find((p) => getLatLng(p.coordinate));
  const defaultMapCenter = firstPGWithCoord
    ? getLatLng(firstPGWithCoord.coordinate)
    : null;

  return (
    <>
      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-80 bg-white h-full shadow-2xl flex flex-col">
            <FilterPanel {...fp} onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* ── MAIN 3-COLUMN LAYOUT ── */}
      <div className="flex py-6 min-h-screen">
        {/* COL 1: Filter sidebar (hidden if Map is Fullscreen) */}
        <aside
          className={`${
            isMapFullscreen ? "hidden lg:hidden" : "hidden lg:flex"
          } flex-col flex-shrink-0 w-60 pl-4 sm:pl-6`}
        >
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col sticky top-24 h-[calc(100vh-120px)]">
            <FilterPanel {...fp} />
          </div>
        </aside>

        {/* COL 2: Cards (hidden if Map is Fullscreen) */}
        <div
          className={`flex-1 min-w-0 px-4 sm:px-5 ${
            isMapFullscreen ? "hidden" : "block"
          }`}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-300 transition-colors"
              >
                <SlidersHorizontal size={14} className="text-slate-500" />{" "}
                Filters
                {filterCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {filterCount}
                  </span>
                )}
              </button>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">
                  {displayCount}
                </span>{" "}
                PGs found
              </p>

              {/* Geo Filters */}
              <button
                onClick={handleNearMe}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors border ${
                  userLocation
                    ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                }`}
              >
                {userLocation ? (
                  <>
                    <X size={14} /> Clear Map
                  </>
                ) : (
                  <>
                    <MapPin size={14} className="text-blue-600" /> Near Me
                  </>
                )}
              </button>

              {userLocation && (
                <select
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="hidden md:block bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-2 py-1.5 outline-none shadow-sm cursor-pointer"
                >
                  <option value={2}>Within 2 km</option>
                  <option value={5}>Within 5 km</option>
                  <option value={10}>Within 10 km</option>
                  <option value={20}>Within 20 km</option>
                  <option value={100}>Within 100 km</option>
                  <option value={500}>Within 500 km</option>
                </select>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <SortBtn
                label="Price"
                field="price"
                {...{ sortField, sortOrder, onToggle: toggleSort }}
              />
              <SortBtn
                label="Rating"
                field="rating"
                {...{ sortField, sortOrder, onToggle: toggleSort }}
              />
              <SortBtn
                label="Reviews"
                field="reviews"
                {...{ sortField, sortOrder, onToggle: toggleSort }}
              />
            </div>
          </div>

          {/* Empty state / Cards */}
          {sorted.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-3">🏠</p>
              <p className="font-semibold text-slate-900 mb-1">No PGs found</p>
              <p className="text-sm text-slate-500">
                Try adjusting your filters or search term
              </p>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-blue-600 hover:underline font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <PaginationWrapper
              data={sorted}
              renderItem={
                (pg) => <PGCard key={pg._id} pg={pg} />
              }
              page={pagination.currentPage}
              onPageChange={handlePageChange}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalCount}
            />
          )}
        </div>

        {/* COL 3: Map — expands to take full width if others are hidden */}
        <div
          className={
            isMapFullscreen
              ? "flex-1 w-full px-4 sm:px-6"
              : "hidden xl:block w-[40%] flex-shrink-0 pl-3 pr-4"
          }
        >
          <div
            className={
              isMapFullscreen
                ? "relative sticky top-24 h-[calc(100vh-120px)] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-white"
                : "relative sticky top-24 h-[calc(100vh-120px)] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white"
            }
          >
            {/* Expand/collapse button */}
            <button
              onClick={() => setIsMapFullscreen(!isMapFullscreen)}
              className="absolute top-3 right-3 z-10 bg-white px-3 py-2 rounded-xl shadow-md border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 font-medium text-sm"
            >
              {isMapFullscreen ? (
                <>
                  <Minimize size={15} /> Collapse
                </>
              ) : (
                <>
                  <Maximize size={15} /> Expand
                </>
              )}
            </button>

            <Map
              mapId={process.env.NEXT_PUBLIC_MAP_ID}
              defaultZoom={userLocation ? 13 : 11}
              defaultCenter={
                userLocation ??
                defaultMapCenter ?? { lat: 20.5937, lng: 78.9629 }
              } // India center fallback
              disableDefaultUI={true}
              gestureHandling="cooperative"
              style={{ width: "100%", height: "100%" }}
            >
              {/* Native Google Maps 60FPS Camera Controller */}
              <MapEffect
                userLocation={userLocation}
                defaultMapCenter={defaultMapCenter}
              />
              {/* Plot User Location - Custom SVG Blue Circle */}
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
                    anchor: { x: 0, y: 0 }, // FIX: This mathematically aligns the vector to the true center!
                  }}
                  zIndex={100}
                />
              )}

              {/* // Markers — fix */}
              <ClusteredMarkers pgs={sorted} setActivePin={setActivePin} />
            </Map>

            {/* ✅ PIN CARD OVERLAY — outside Map, inside map container */}
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
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 py-10 px-5 sm:px-8 mt-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">PG</span>
            </div>
            <span className="text-white font-semibold text-sm">Finder</span>
          </div>
          <p className="text-slate-500 text-xs">
            © 2026 PGFinder. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-slate-500 hover:text-blue-400 text-xs uppercase tracking-wider transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
