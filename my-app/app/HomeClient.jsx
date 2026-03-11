"use client";

import { useState } from "react";
import { useSearch } from "./context/SearchContext";
import PGCard from "./components/PGCard";
import { ArrowUp, ArrowDown, SlidersHorizontal, X } from "lucide-react";

const PRICE_RANGES = [
  { label: "Under ₹5,000",       min: 0,     max: 5000     },
  { label: "₹5,000 – ₹10,000",  min: 5000,  max: 10000    },
  { label: "₹10,000 – ₹15,000", min: 10000, max: 15000    },
  { label: "Above ₹15,000",      min: 15000, max: Infinity },
];

const AMENITIES = ["AC","WiFi","Parking","Laundry","Gym","CCTV","RO","TV","Lift","Refrigerator","Garden","Library"];

function FilterPanel({ selectedPrice, setSelectedPrice, genderFilter, toggleGender, foodFilter, toggleFood, minRating, setMinRating, selectedAmenities, toggleAmenity, hasFilters, clearFilters }) {
  const sectionLabel = "text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3 block";
  const row = "flex items-center gap-2.5 cursor-pointer text-sm text-slate-600 hover:text-slate-900 transition-colors py-0.5";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-900">Filters</p>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Clear all</button>
        )}
      </div>

      <div>
        <span className={sectionLabel}>Price Range</span>
        <div className="flex flex-col gap-1.5">
          {PRICE_RANGES.map(r => (
            <label key={r.label} className={row}>
              <input type="radio" className="w-3.5 h-3.5 flex-shrink-0 accent-blue-600"
                checked={selectedPrice?.label === r.label}
                onChange={() => setSelectedPrice(selectedPrice?.label === r.label ? null : r)} />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className={sectionLabel}>Gender</span>
        <div className="flex flex-col gap-1.5">
          {[["male","Male"],["female","Female"],["mix","Co-ed"]].map(([v, d]) => (
            <label key={v} className={row}>
              <input type="checkbox" className="w-3.5 h-3.5 flex-shrink-0 accent-blue-600"
                checked={genderFilter.includes(v)} onChange={() => toggleGender(v)} />
              {d}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className={sectionLabel}>Food</span>
        <div className="flex flex-col gap-1.5">
          {[["with food","With Food"],["without food","Without Food"],["flexible","Flexible"]].map(([v, d]) => (
            <label key={v} className={row}>
              <input type="checkbox" className="w-3.5 h-3.5 flex-shrink-0 accent-blue-600"
                checked={foodFilter.includes(v)} onChange={() => toggleFood(v)} />
              {d}
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className={sectionLabel}>Min Rating</span>
        <div className="flex flex-col gap-1.5">
          {[4, 3, 2].map(r => (
            <label key={r} className={row}>
              <input type="radio" className="w-3.5 h-3.5 flex-shrink-0 accent-blue-600"
                checked={minRating === r} onChange={() => setMinRating(minRating === r ? 0 : r)} />
              <span className="text-yellow-500">{"★".repeat(r)}</span>
              <span className="text-slate-400">& up</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className={sectionLabel}>Amenities</span>
        <div className="flex flex-col gap-1.5">
          {AMENITIES.map(a => (
            <label key={a} className={row}>
              <input type="checkbox" className="w-3.5 h-3.5 flex-shrink-0 accent-blue-600"
                checked={selectedAmenities.includes(a)} onChange={() => toggleAmenity(a)} />
              {a}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function SortBtn({ label, field, sortField, sortOrder, onToggle }) {
  const active = sortField === field;
  return (
    <button onClick={() => onToggle(field)}
      className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-xl border transition-all font-medium ${
        active
          ? "bg-blue-50 border-blue-200 text-blue-700"
          : "bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-slate-900"
      }`}>
      {label}
      {active && (sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
    </button>
  );
}

export default function HomeClient({ data }) {
  const { query } = useSearch();
  const [selectedPrice,      setSelectedPrice]      = useState(null);
  const [selectedAmenities,  setSelectedAmenities]  = useState([]);
  const [minRating,          setMinRating]          = useState(0);
  const [genderFilter,       setGenderFilter]       = useState([]);
  const [foodFilter,         setFoodFilter]         = useState([]);
  const [sortField,          setSortField]          = useState(null);
  const [sortOrder,          setSortOrder]          = useState("asc");
  const [drawerOpen,         setDrawerOpen]         = useState(false);

  const toggleAmenity = a => setSelectedAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);
  const toggleGender  = g => setGenderFilter(p  => p.includes(g) ? p.filter(x => x !== g) : [...p, g]);
  const toggleFood    = f => setFoodFilter(p    => p.includes(f) ? p.filter(x => x !== f) : [...p, f]);
  const toggleSort    = field => {
    if (sortField === field) setSortOrder(o => o === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder("asc"); }
  };

  //search filter ep
  const filtered = data.filter(pg => {
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!(pg.name||"").toLowerCase().includes(q) && !(pg.city||"").toLowerCase().includes(q)) return false;
    }
    if (selectedPrice && (pg.price < selectedPrice.min || pg.price > selectedPrice.max)) return false;
    if (selectedAmenities.length && !selectedAmenities.every(a => pg.amenities?.includes(a))) return false;
    if (minRating > 0 && (parseFloat(pg.ratingData?.avg)||0) < minRating) return false;
    if (genderFilter.length && !genderFilter.includes(pg.gender)) return false;
    if (foodFilter.length && !foodFilter.includes(pg.food)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    const map = { price: [a.price, b.price], rating: [parseFloat(a.ratingData?.avg||0), parseFloat(b.ratingData?.avg||0)], reviews: [a.ratingData?.count||0, b.ratingData?.count||0] };
    const [va, vb] = map[sortField];
    return sortOrder === "asc" ? va - vb : vb - va;
  });

  const clearFilters = () => { setSelectedPrice(null); setSelectedAmenities([]); setMinRating(0); setGenderFilter([]); setFoodFilter([]); };
  const hasFilters = !!(selectedPrice || selectedAmenities.length || minRating || genderFilter.length || foodFilter.length);
  const filterCount = [selectedPrice?1:0, genderFilter.length, foodFilter.length, minRating>0?1:0, selectedAmenities.length].reduce((a,b)=>a+b,0);

  const fp = { selectedPrice, setSelectedPrice, genderFilter, toggleGender, foodFilter, toggleFood, minRating, setMinRating, selectedAmenities, toggleAmenity, hasFilters, clearFilters };

  return (
    <>
      {/* mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-80 bg-white h-full overflow-y-auto p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <p className="font-semibold text-slate-900">Filters</p>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X size={16} className="text-slate-500" />
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
              <button onClick={() => setDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-300 transition-colors">
                <SlidersHorizontal size={14} className="text-slate-500" />
                Filters
                {filterCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{filterCount}</span>
                )}
              </button>
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">{sorted.length}</span> PGs found
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <SortBtn label="Price"   field="price"   {...{sortField, sortOrder, onToggle: toggleSort}} />
              <SortBtn label="Rating"  field="rating"  {...{sortField, sortOrder, onToggle: toggleSort}} />
              <SortBtn label="Reviews" field="reviews" {...{sortField, sortOrder, onToggle: toggleSort}} />
            </div>
          </div>

          {sorted.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-3">🏠</p>
              <p className="font-semibold text-slate-900 mb-1">No PGs found</p>
              <p className="text-sm text-slate-500">Try adjusting your filters or search term</p>
              {hasFilters && <button onClick={clearFilters} className="mt-4 text-sm text-blue-600 hover:underline font-medium">Clear all filters</button>}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {sorted.map(pg => <PGCard key={pg._id} pg={pg} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}