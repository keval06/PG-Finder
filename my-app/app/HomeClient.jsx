"use client";

import { useState } from "react";
import { useSearch } from "./context/SearchContext";
import PGCard from "./components/PGCard";
import { ArrowUp, ArrowDown, SlidersHorizontal, X } from "lucide-react";

const PRICE_RANGES = [
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000 - ₹15,000", min: 10000, max: 15000 },
  { label: "Above ₹15,000", min: 15000, max: Infinity },
];

const AMENITIES = [
  "AC", "WiFi", "Parking", "Laundry", "Gym",
  "CCTV", "RO", "TV", "Lift", "Refrigerator", "Garden", "Library",
];

export default function HomeClient({ data }) {
  const { query } = useSearch();

  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [genderFilter, setGenderFilter] = useState([]);
  const [foodFilter, setFoodFilter] = useState([]);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  // mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleAmenity = (a) =>
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  const toggleGender = (g) =>
    setGenderFilter((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  const toggleFood = (f) =>
    setFoodFilter((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const clearFilters = () => {
    setSelectedPrice(null);
    setSelectedAmenities([]);
    setMinRating(0);
    setGenderFilter([]);
    setFoodFilter([]);
  };

  const hasFilters =
    selectedPrice ||
    selectedAmenities.length > 0 ||
    minRating > 0 ||
    genderFilter.length > 0 ||
    foodFilter.length > 0;

  const filtered = data.filter((pg) => {
    if (query.trim()) {
      const q = query.toLowerCase();
      if (
        !(pg.name || "").toLowerCase().includes(q) &&
        !(pg.city || "").toLowerCase().includes(q)
      ) return false;
    }
    if (selectedPrice) {
      if (pg.price < selectedPrice.min || pg.price > selectedPrice.max) return false;
    }
    if (selectedAmenities.length > 0) {
      if (!selectedAmenities.every((a) => pg.amenities?.includes(a))) return false;
    }
    if (minRating > 0) {
      const avg = pg.ratingData?.avg ? parseFloat(pg.ratingData.avg) : 0;
      if (avg < minRating) return false;
    }
    if (genderFilter.length > 0) {
      if (!genderFilter.includes(pg.gender)) return false;
    }
    if (foodFilter.length > 0) {
      if (!foodFilter.includes(pg.food)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let valA, valB;
    if (sortField === "price") { valA = a.price; valB = b.price; }
    if (sortField === "rating") {
      valA = parseFloat(a.ratingData?.avg || 0);
      valB = parseFloat(b.ratingData?.avg || 0);
    }
    if (sortField === "reviews") {
      valA = a.ratingData?.count || 0;
      valB = b.ratingData?.count || 0;
    }
    if (valA === undefined) return 0;
    return sortOrder === "asc" ? valA - valB : valB - valA;
  });

  const SortBtn = ({ field, label }) => (
    <button
      onClick={() => toggleSort(field)}
      className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition ${
        sortField === field
          ? "bg-blue-50 text-blue-600 font-medium"
          : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      {label}
      {sortField === field
        ? sortOrder === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />
        : <span className="w-3" />}
    </button>
  );

  // Reusable filter panel — used in both sidebar and mobile drawer
  const FilterPanel = () => (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Filters</h2>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-blue-500 hover:underline">
            Clear all
          </button>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* Price */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Price Range</p>
        <div className="flex flex-col gap-2.5">
          {PRICE_RANGES.map((range) => (
            <label key={range.label} className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
              <input
                type="radio"
                checked={selectedPrice?.label === range.label}
                onChange={() => setSelectedPrice(selectedPrice?.label === range.label ? null : range)}
                className="accent-blue-600"
              />
              {range.label}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Gender */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Gender</p>
        <div className="flex flex-col gap-2.5">
          {["male", "female", "mix"].map((g) => (
            <label key={g} className="flex items-center gap-2.5 text-sm text-gray-600 capitalize cursor-pointer">
              <input
                type="checkbox"
                checked={genderFilter.includes(g)}
                onChange={() => toggleGender(g)}
                className="accent-blue-600"
              />
              {g}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Food */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Food</p>
        <div className="flex flex-col gap-2.5">
          {["with food", "without food", "flexible"].map((f) => (
            <label key={f} className="flex items-center gap-2.5 text-sm text-gray-600 capitalize cursor-pointer">
              <input
                type="checkbox"
                checked={foodFilter.includes(f)}
                onChange={() => toggleFood(f)}
                className="accent-blue-600"
              />
              {f}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Rating */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Min Rating</p>
        <div className="flex flex-col gap-2.5">
          {[4, 3, 2].map((r) => (
            <label key={r} className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
              <input
                type="radio"
                checked={minRating === r}
                onChange={() => setMinRating(minRating === r ? 0 : r)}
                className="accent-blue-600"
              />
              {"★".repeat(r)}&nbsp;&amp; up
            </label>
          ))}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Amenities */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Amenities</p>
        <div className="flex flex-col gap-2.5">
          {AMENITIES.map((a) => (
            <label key={a} className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedAmenities.includes(a)}
                onChange={() => toggleAmenity(a)}
                className="accent-blue-600"
              />
              {a}
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">

      {/* ── MOBILE: Filter button + sort bar ── */}
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm"
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {[selectedPrice, ...selectedAmenities, minRating > 0 ? 1 : null, ...genderFilter, ...foodFilter].filter(Boolean).length}
            </span>
          )}
        </button>

        <div className="flex items-center gap-1">
          <SortBtn field="price" label="Price" />
          <SortBtn field="rating" label="Rating" />
          <SortBtn field="reviews" label="Reviews" />
        </div>
      </div>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setDrawerOpen(false)}
          />
          {/* drawer */}
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-800">Filters</span>
              <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setDrawerOpen(false)}
              className="mt-6 w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm"
            >
              Show {sorted.length} PGs
            </button>
          </div>
        </div>
      )}

      {/* ── DESKTOP LAYOUT ── */}
      <div className="flex gap-6">

        {/* Sidebar — hidden on mobile, visible lg+ */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-20 overflow-y-auto max-h-[calc(100vh-6rem)]">
            <FilterPanel />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* Sort bar — desktop only */}
          <div className="hidden lg:flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {sorted.length} PG{sorted.length !== 1 ? "s" : ""} found
            </p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 mr-1">Sort:</span>
              <SortBtn field="price" label="Price" />
              <SortBtn field="rating" label="Rating" />
              <SortBtn field="reviews" label="Reviews" />
            </div>
          </div>

          {/* Mobile result count */}
          <p className="text-sm text-gray-400 lg:hidden">
            {sorted.length} PG{sorted.length !== 1 ? "s" : ""} found
          </p>

          {/* Cards */}
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-4xl mb-3">🏠</p>
              <p className="text-gray-500 font-medium">No PGs match your filters</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting or clearing your filters</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {sorted.map((pg) => <PGCard key={pg._id} pg={pg} />)}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}