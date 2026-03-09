"use client";

import { useState } from "react";
import { useSearch } from "./context/SearchContext";
import PGCard from "./components/PGCard";
import { ArrowUp, ArrowDown } from "lucide-react";

const PRICE_RANGES = [
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000 - ₹15,000", min: 10000, max: 15000 },
  { label: "Above ₹15,000", min: 15000, max: Infinity },
];

const AMENITIES = [
  "AC",
  "WiFi",
  "Parking",
  "Laundry",
  "Gym",
  "CCTV",
  "RO",
  "TV",
  "Lift",
  "Refrigerator",
  "Garden",
  "Library",
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

  const toggleAmenity = (a) =>
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );

  const toggleGender = (g) =>
    setGenderFilter((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );

  const toggleFood = (f) =>
    setFoodFilter((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filtered = data.filter((pg) => {
    if (query.trim()) {
      const q = query.toLowerCase();
      if (
        !(pg.name || "").toLowerCase().includes(q) &&
        !(pg.city || "").toLowerCase().includes(q)
      )
        return false;
    }

    if (selectedPrice) {
      if (pg.price < selectedPrice.min || pg.price > selectedPrice.max)
        return false;
    }

    if (selectedAmenities.length > 0) {
      if (!selectedAmenities.every((a) => pg.amenities?.includes(a)))
        return false;
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

    if (sortField === "price") {
      valA = a.price;
      valB = b.price;
    }

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

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-md p-5 sticky top-24 h-fit flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Filters</h2>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Price */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-2">
              Price Range
            </h3>

            <div className="flex flex-col gap-2">
              {PRICE_RANGES.map((range) => (
                <label
                  key={range.label}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <input
                    type="radio"
                    checked={selectedPrice?.label === range.label}
                    onChange={() =>
                      setSelectedPrice(
                        selectedPrice?.label === range.label ? null : range,
                      )
                    }
                    className="accent-blue-600"
                  />

                  {range.label}
                </label>
              ))}
            </div>
          </div>

          {/* Food */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-2">Food</h3>
            <div className="flex flex-col gap-2">
              {["with food", "without food", "flexible"].map((f) => (
                <label
                  key={f}
                  className="capitalize flex items-center gap-2 cursor-pointer text-sm text-gray-600"
                >
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

          {/* Rating */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-2">
              Minimum Rating
            </h3>

            <div className="flex flex-col gap-2">
              {[4, 3, 2].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <input
                    type="radio"
                    checked={minRating === r}
                    onChange={() => setMinRating(minRating === r ? 0 : r)}
                    className="accent-blue-600"
                  />
                  {"★".repeat(r)} & up
                </label>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="font-medium text-sm text-gray-700 mb-2">
              Amenities
            </h3>
            <div className="flex flex-col gap-2">
              {AMENITIES.map((a) => (
                <label
                  key={a}
                  className="flex items-center gap-2 cursor-pointer text-sm text-gray-600"
                >
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
      </aside>

      {/* PG List */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Sorting Bar */}
        <div className="flex justify-end items-center gap-6 text-sm text-gray-600">
          <button
            onClick={() => toggleSort("price")}
            className="flex items-center gap-1"
          >
            Price
            {sortField === "price" &&
              (sortOrder === "asc" ? (
                <ArrowUp size={14} />
              ) : (
                <ArrowDown size={14} />
              ))}
          </button>

          <button
            onClick={() => toggleSort("rating")}
            className="flex items-center gap-1"
          >
            Avg Rating
            {sortField === "rating" &&
              (sortOrder === "asc" ? (
                <ArrowUp size={14} />
              ) : (
                <ArrowDown size={14} />
              ))}
          </button>

          <button
            onClick={() => toggleSort("reviews")}
            className="flex items-center gap-1"
          >
            Reviews
            {sortField === "reviews" &&
              (sortOrder === "asc" ? (
                <ArrowUp size={14} />
              ) : (
                <ArrowDown size={14} />
              ))}
          </button>
        </div>

        {sorted.length === 0 ? (
          <p className="text-gray-400 mt-10 text-center">
            No PGs match your filters.
          </p>
        ) : (
          sorted.map((pg) => <PGCard key={pg._id} pg={pg} />)
        )}
      </div>
    </div>
  );
}
