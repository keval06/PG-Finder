"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSearch } from "./context/SearchContext";
import PGCard from "../components/PGCard";
import FilterPanel from "../components/FilterPanel";
import { usePGFilters } from "./hooks/usePGFilters";
import PaginationWrapper from "../components/PaginationWrapper";
import HomeHeader from "./home/components/HomeHeader";
import EmptyState from "./atoms/EmptyState";
import Button from "./atoms/Button";
import { Home as HomeIcon, AlertCircle, X, Map as MapIcon } from "lucide-react";
import dynamic from "next/dynamic";
const HomeMap = dynamic(() => import("./home/components/HomeMap"), {
  ssr: false,
});

// Helper for initial map center — handles BOTH GeoJSON and flat array
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

  const [userLocation, setUserLocation] = useState(
    latParam && lngParam
      ? { lat: Number(latParam), lng: Number(lngParam) }
      : null,
  );
  const [radius, setRadius] = useState(radiusParam ? Number(radiusParam) : 5);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

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

    if (active.minRating > 0) {
      params.append("minRating", active.minRating);
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
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
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
    // Toggle off if already active
    if (userLocation) {
      setUserLocation(null);
      setLocationError(null);
      return;
    }

    // No pre-flight guards — just let the browser handle it.
    // getCurrentPosition will trigger the native permission prompt automatically.
    if (!("geolocation" in navigator)) {
      setLocationError(
        "Your browser doesn't support location. Try Chrome, Firefox, or Edge.",
      );
      return;
    }

    setIsLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocationLoading(false);
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        setIsLocationLoading(false);
        const errorMessages = {
          1: "Location permission denied. Click the 🔒 icon in your address bar → Allow location → try again.",
          2: "Location unavailable. Check your device's location settings or move to an open area.",
          3: "Location request timed out. Please try again.",
        };
        setLocationError(
          errorMessages[err.code] ||
            "Could not get your location. Please try again.",
        );
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false },
    );
  };

  const displayCount =
    pagination.totalCount > 0 ? pagination.totalCount : sorted.length;

  const firstPGWithCoord = sorted.find((p) => getLatLng(p.coordinate));
  const defaultMapCenter = firstPGWithCoord
    ? getLatLng(firstPGWithCoord.coordinate)
    : null;

  return (
    <>
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-full max-w-sm max-h-[90vh] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-[fadeIn_0.15s_ease-out]">
            <FilterPanel {...fp} onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* ── MOBILE / TABLET LAYOUT (below xl) ── */}
      <div className="xl:hidden block min-h-screen bg-[#f8fafc]">
        {/* Map — stays fixed at the top */}
        <div
          className={
            isMapFullscreen
              ? "fixed inset-0 z-[150] bg-white pt-14"
              : "sticky top-14 z-0 h-[35vh] px-3 pt-3 pb-1"
          }
        >
          <div
            className={
              isMapFullscreen
                ? "w-full h-full"
                : "w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
            }
          >
            <HomeMap
              pgs={sorted}
              userLocation={userLocation}
              defaultMapCenter={defaultMapCenter}
              activePin={activePin}
              setActivePin={setActivePin}
              isFullscreen={isMapFullscreen}
              setIsFullscreen={setIsMapFullscreen}
            />
          </div>
        </div>

        {/* PG listings — scrolls over the map because of z-index and background */}
        <div
          className={`relative z-10 bg-[#f8fafc] flex-1 px-4 sm:px-5 py-4 min-h-[65vh] ${isMapFullscreen ? "hidden" : "block"}`}
        >
          {locationError && (
            <div className="mb-3 flex items-start gap-2.5 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span className="flex-1">{locationError}</span>
              <button
                onClick={() => setLocationError(null)}
                className="flex-shrink-0 text-amber-600 hover:text-amber-900 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          )}

          <HomeHeader
            setDrawerOpen={setDrawerOpen}
            filterCount={filterCount}
            displayCount={displayCount}
            handleNearMe={handleNearMe}
            userLocation={userLocation}
            isLocationLoading={isLocationLoading}
            radius={radius}
            setRadius={setRadius}
            sortField={sortField}
            sortOrder={sortOrder}
            toggleSort={toggleSort}
          />

          {sorted.length === 0 ? (
            <EmptyState
              icon={HomeIcon}
              title="No PGs found"
              description="Try adjusting your filters or search term to find what you're looking for."
              action={
                hasFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                )
              }
            />
          ) : (
            <PaginationWrapper
              data={sorted}
              renderItem={(pg) => <PGCard key={pg._id} pg={pg} />}
              page={pagination.currentPage}
              onPageChange={handlePageChange}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalCount}
            />
          )}
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (xl and above) ── */}
      <div className="hidden xl:flex min-h-screen relative p-6 gap-6">
        <div
          className={`w-1/2 flex flex-col min-w-0 ${isMapFullscreen ? "hidden" : "block"}`}
        >
          {locationError && (
            <div className="mb-3 flex items-start gap-2.5 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span className="flex-1">{locationError}</span>
              <button
                onClick={() => setLocationError(null)}
                className="flex-shrink-0 text-amber-600 hover:text-amber-900 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          )}

          <HomeHeader
            setDrawerOpen={setDrawerOpen}
            filterCount={filterCount}
            displayCount={displayCount}
            handleNearMe={handleNearMe}
            userLocation={userLocation}
            isLocationLoading={isLocationLoading}
            radius={radius}
            setRadius={setRadius}
            sortField={sortField}
            sortOrder={sortOrder}
            toggleSort={toggleSort}
            showFilterIcon={true}
          />

          {sorted.length === 0 ? (
            <EmptyState
              icon={HomeIcon}
              title="No PGs found"
              description="Try adjusting your filters or search term to find what you're looking for."
              action={
                hasFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                )
              }
            />
          ) : (
            <PaginationWrapper
              data={sorted}
              renderItem={(pg) => <PGCard key={pg._id} pg={pg} />}
              page={pagination.currentPage}
              onPageChange={handlePageChange}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalCount}
            />
          )}
        </div>

        {/* Desktop Map - Sticky on right side */}
        <div
          className={
            isMapFullscreen
              ? "fixed inset-0 z-[150] bg-white"
              : "w-1/2 flex-shrink-0 flex flex-col sticky top-24 h-[calc(100vh-120px)] rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
          }
        >
          <HomeMap
            pgs={sorted}
            userLocation={userLocation}
            defaultMapCenter={defaultMapCenter}
            activePin={activePin}
            setActivePin={setActivePin}
            isFullscreen={isMapFullscreen}
            setIsFullscreen={setIsMapFullscreen}
          />
        </div>
      </div>

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
