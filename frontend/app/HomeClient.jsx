"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useSearch } from "./context/SearchContext";
import PGCard from "../components/PGCard";
import FilterPanel from "../components/FilterPanel";
import { usePGFilters } from "./hooks/usePGFilters";
import PaginationWrapper from "../components/PaginationWrapper";
import HomeMap from "./home/components/HomeMap";
import HomeHeader from "./home/components/HomeHeader";
import EmptyState from "./atoms/EmptyState";
import Button from "./atoms/Button";
import { Home as HomeIcon } from "lucide-react";

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
        () => alert("Location permission denied."),
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
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

      <div className="flex py-6 min-h-screen">
        <aside
          className={`${
            isMapFullscreen ? "hidden lg:hidden" : "hidden lg:flex"
          } flex-col flex-shrink-0 w-60 pl-4 sm:pl-6`}
        >
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col sticky top-24 h-[calc(100vh-120px)]">
            <FilterPanel {...fp} />
          </div>
        </aside>

        <div
          className={`flex-1 min-w-0 px-4 sm:px-5 ${isMapFullscreen ? "hidden" : "block"}`}
        >
          <HomeHeader
            setDrawerOpen={setDrawerOpen}
            filterCount={filterCount}
            displayCount={displayCount}
            handleNearMe={handleNearMe}
            userLocation={userLocation}
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

        <div
          className={
            isMapFullscreen
              ? "flex-1 w-full px-4 sm:px-6 z-[100]"
              : "hidden xl:block w-[40%] flex-shrink-0 pl-3 pr-4 sticky top-24 h-[calc(100vh-120px)]"
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
