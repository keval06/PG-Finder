"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSearch } from "./context/SearchContext";
import PGCard from "./components/PGCard";
import FilterPanel from "./components/FilterPanel";
import SortBtn from "./components/SortBtn";
import { SlidersHorizontal } from "lucide-react";
import { usePGFilters } from "./hooks/usePGFilters";

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

  const isFirstRender = useRef(true);

  const buildParams = (pageOverride = null) => {
    const params = new URLSearchParams();
    if (query) params.append("q", query);

    if (active.selectedPrice) {
      params.append("minprice", active.selectedPrice.min);
      // FIX: don't append maxprice when it's Infinity ("Above ₹15,000" option)
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
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const debounceId = setTimeout(() => {
      const params = buildParams(1);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);
    return () => clearTimeout(debounceId);
  }, [active, query, sortField, sortOrder, pathname, router]);

  // FIX: in remote mode, the real count comes from the backend's totalCount,
  // not sorted.length (which is only the current page slice).
  const displayCount =
    pagination.totalCount > 0 ? pagination.totalCount : sorted.length;

  return (
    <>
      {/* mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-80 bg-white h-full shadow-2xl flex flex-col">
            <FilterPanel {...fp} onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* sidebar */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col sticky top-24 h-[calc(100vh-120px)]">
            <FilterPanel {...fp} />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {/* top bar */}
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

              {/* FIX: show totalCount (all pages) not just current page slice */}
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">
                  {displayCount}
                </span>{" "}
                PGs found
              </p>
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

          {/* empty state */}
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
            <>
              <div className="flex flex-col gap-4">
                {sorted.map((pg) => (
                  <PGCard key={pg._id} pg={pg} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-slate-600 px-4">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* footer */}
      <footer className="bg-slate-900 py-10 px-5 sm:px-8 mt-12">
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
