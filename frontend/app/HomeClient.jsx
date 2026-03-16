"use client";

import { useState } from "react";
import { useSearch } from "./context/SearchContext";
import PGCard from "./components/PGCard";
import FilterPanel from "./components/FilterPanel";
import { ArrowUp, ArrowDown, SlidersHorizontal, X } from "lucide-react";

const EMPTY_DRAFT = {
  selectedPrice: null,
  selectedAmenities: [],
  genderFilter: [],
  foodFilter: [],
  minRating: 0,
};

function SortBtn({ label, field, sortField, sortOrder, onToggle }) {
  const active = sortField === field;
  return (
    <button
      onClick={() => onToggle(field)}
      className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-xl border transition-all font-medium ${
        active
          ? "bg-blue-50 border-blue-200 text-blue-700"
          : "bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-slate-900"
      }`}
    >
      {label}
      {active &&
        (sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
    </button>
  );
}

export default function HomeClient({ data }) {
  const { query, setQuery } = useSearch();

  // draft  = what the user is selecting inside the panel (not applied yet)
  // active = what's actually filtering the results (applied)
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [active, setActive] = useState(EMPTY_DRAFT);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const applyFilters = () => {
    setActive({ ...draft });
    setDrawerOpen(false); // close mobile drawer after apply
  };

  const clearFilters = () => {
    setDraft(EMPTY_DRAFT);
    setActive(EMPTY_DRAFT);
  };

  const hasFilters = !!(
    active.selectedPrice ||
    active.selectedAmenities.length ||
    active.minRating ||
    active.genderFilter.length ||
    active.foodFilter.length
  );

  const filterCount = [
    active.selectedPrice ? 1 : 0,
    active.genderFilter.length,
    active.foodFilter.length,
    active.minRating > 0 ? 1 : 0,
    active.selectedAmenities.length,
  ].reduce((a, b) => a + b, 0);

  const toggleSort = (field) => {
    if (sortField === field)
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // filter using ACTIVE (not draft)
  const filtered = data.filter((pg) => {
    if (query.trim()) {
      const q = query.toLowerCase();
      if (
        !(pg.name || "").toLowerCase().includes(q) &&
        !(pg.city || "").toLowerCase().includes(q)
      )
        return false;
    }
    if (
      active.selectedPrice &&
      (pg.price < active.selectedPrice.min ||
        pg.price > active.selectedPrice.max)
    )
      return false;
    if (
      active.selectedAmenities.length &&
      !active.selectedAmenities.every((a) => pg.amenities?.includes(a))
    )
      return false;
    if (
      active.minRating > 0 &&
      (parseFloat(pg.ratingData?.avg) || 0) < active.minRating
    )
      return false;
    if (active.genderFilter.length && !active.genderFilter.includes(pg.gender))
      return false;
    if (active.foodFilter.length && !active.foodFilter.includes(pg.food))
      return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const map = {
      price: [a.price, b.price],
      rating: [
        parseFloat(a.ratingData?.avg || 0),
        parseFloat(b.ratingData?.avg || 0),
      ],
      reviews: [a.ratingData?.count || 0, b.ratingData?.count || 0],
    };
    const [va, vb] = map[sortField];
    return sortOrder === "asc" ? va - vb : vb - va;
  });

  const fp = {
    draft,
    setDraft,
    onApply: applyFilters,
    onClear: clearFilters,
    hasFilters,
  };

  return (
    <>
      {/* mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-80 bg-white h-full overflow-y-auto p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <p className="font-semibold text-slate-900"></p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <FilterPanel {...fp} />
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* sidebar */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
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
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">
                  {sorted.length}
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
            <div className="flex flex-col gap-4">
              {sorted.map((pg) => (
                <PGCard key={pg._id} pg={pg} />
              ))}
            </div>
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
