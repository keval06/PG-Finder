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
  mapPgs = [],
  pagination = { currentPage: 1, totalPages: 1, totalCount: 0 },
}) {
  const { query, setFilterCount } = useSearch();
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

  // Sync global filter count
  useEffect(() => {
    setFilterCount(filterCount);
  }, [filterCount, setFilterCount]);

  // Lock body scroll when filter drawer is open (mobile fix)
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const [userLocation, setUserLocation] = useState(
    latParam && lngParam
      ? { lat: Number(latParam), lng: Number(lngParam) }
      : null
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
    const cityParam = searchParamsUrl.get("city");

    if (cityParam) {
      params.append("city", cityParam);
    }
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

  // IP-based fallback removed — user will handle location manually
  const handleNearMeFallback = async () => false;

  const handleNearMe = () => {
    // Toggle off if already active
    if (userLocation) {
      setUserLocation(null);
      setLocationError(null);
      return;
    }

    if (!("geolocation" in navigator)) {
      handleNearMeFallback().then((success) => {
        if (!success) {
          setIsLocationLoading(false);
          setLocationError(
            "Your browser doesn't support location. IP fallback failed."
          );
        }
      });
      return;
    }

    setIsLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (pos.coords.latitude === 0 && pos.coords.longitude === 0) {
          handleNearMeFallback().then((success) => {
            if (!success) {
              setIsLocationLoading(false);
              setLocationError(
                "Your device returned (0, 0) and IP location failed."
              );
            }
          });
          return;
        }

        const accuracyMeters = pos.coords.accuracy;
        setIsLocationLoading(false);
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });

        // Accuracy > 50km → WiFi/cell triangulation pointing at ISP hub city
        // This is the "sitting in Bhavnagar, showing Ahmedabad" problem
        if (accuracyMeters > 50000) {
          setLocationError(
            `Location accuracy is ~${Math.round(
              accuracyMeters / 1000
            )}km (WiFi/network-based). ` +
              `This may point to your ISP's city, not your actual location. ` +
              `Use the search bar to find PGs in your city instead.`
          );
          // Auto-widen radius to cover the inaccuracy
          setRadius((prev) =>
            Math.max(prev, Math.round(accuracyMeters / 1000))
          );
        } else if (accuracyMeters > 10000) {
          // 10-50km → moderately imprecise, still usable with wider radius
          setLocationError(
            `Location is approximate (~${Math.round(
              accuracyMeters / 1000
            )}km accuracy). ` + `Search radius has been widened automatically.`
          );
          setRadius((prev) =>
            Math.max(prev, Math.round(accuracyMeters / 1000))
          );
        }
        // accuracyMeters <= 10km → good enough, no warning needed
      },
      (err) => {
        handleNearMeFallback().then((success) => {
          if (!success) {
            setIsLocationLoading(false);
            const errorMessages = {
              1: "Location permission denied. Click the 🔒 icon in your browser's address bar.",
              2: "Location unavailable. Check your device's location settings (Windows Settings → Privacy → Location).",
              3: "Location request timed out. Please try again.",
            };
            setLocationError(
              errorMessages[err.code] || "Could not get your location."
            );
          }
        });
      },
      { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
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
      <div className="xl:hidden block min-h-screen bg-white">
        {/* Map — sticky at top, taller when InfoCard is showing */}
        <div
          className={
            isMapFullscreen
              ? "fixed inset-0 z-[100] bg-white p-4 pt-24"
              : `sticky top-[80px] z-0 ${
                  activePin ? "h-[55vh]" : "h-[40vh]"
                } px-3 pt-3 pb-1 transition-all duration-300`
          }
        >
          <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative">
            <HomeMap
              pgs={mapPgs}
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
          className={`relative z-10 bg-white flex-1 px-4 sm:px-5 py-4 min-h-[65vh] ${
            isMapFullscreen ? "hidden" : "block"
          }`}
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

        {/* Footer — mobile only, after listings, above sticky map */}
        <footer className="relative z-20 bg-slate-900 py-10 px-5 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="PGVista Logo"
                className="h-10 sm:h-11 w-auto object-contain bg-white px-2.5 py-1.5 rounded-xl shadow-sm"
              />
            </div>
            <p className="text-slate-500 text-xs">
              © 2026 QuickPG. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Contact"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-slate-500 hover:text-rose-400 text-xs uppercase tracking-wider transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>

      {/* ── DESKTOP LAYOUT (xl and above) ── */}
      <div className="hidden xl:grid grid-cols-12 h-[calc(100vh-80px)] sticky top-[80px] bg-white">
        {/* Left Margin */}
        <div className="col-span-1" />

        {/* Listings - 6 Columns */}
        <div
          className={`col-span-6 flex flex-col min-w-0 overflow-y-auto no-scrollbar px-6 py-8 ${
            isMapFullscreen ? "hidden" : "block"
          }`}
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

        {/* Desktop Map - 4 Columns or Fullscreen overlay within grid */}
        <div
          className={
            isMapFullscreen
              ? "col-span-10 h-full py-10 px-4"
              : "col-span-4 h-full py-8 pl-4 pr-6"
          }
        >
          <div className="h-full rounded-3xl overflow-hidden border border-gray-200 shadow-sm relative group">
            <HomeMap
              pgs={mapPgs}
              userLocation={userLocation}
              defaultMapCenter={defaultMapCenter}
              activePin={activePin}
              setActivePin={setActivePin}
              isFullscreen={isMapFullscreen}
              setIsFullscreen={setIsMapFullscreen}
            />
          </div>
        </div>

        {/* Right Margin */}
        <div className="col-span-1" />
      </div>

      {/* No footer on desktop — map+list layout fills viewport (Airbnb pattern) */}
    </>
  );
}
