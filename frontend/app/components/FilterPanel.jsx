// app/components/FilterPanel.jsx

const PRICE_RANGES = [
  { 
    label: "Under ₹5,000", 
    min: 0, 
    max: 5000 
  },
  { 
    label: 
    "₹5,000 – ₹10,000", 
    min: 5000, 
    max: 10000 
  },
  { 
    label: "₹10,000 – ₹15,000", 
    min: 10000, 
    max: 15000 
  },
  { 
    label: "Above ₹15,000", 
    min: 15000, 
    max: Infinity 
  },
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
import { X } from "lucide-react";

export default function FilterPanel({
  draft,       //? current work-in-progress selections
  setDraft,    // ?function to update draft
  onApply,     //? function: copy draft → active (from hook)
  onClear,     // ?function: reset everything
  hasFilters,  // ?boolean: any active filters? (show "Clear all"?)
  onClose,     // ?function: close mobile drawer (undefined on desktop!)
}) {

  //? CSS Variables — Reused Class Strings
  const sl =
    "text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-3 block";
  const row =
    "flex items-center gap-2.5 cursor-pointer text-sm text-slate-600 hover:text-slate-900 transition-colors py-0.5";

    // ?This one function handles ALL checkbox toggles (gender, food, amenities).
  const toggleArr = (key, val) =>
    //variable key
    setDraft(
      (p) => ({
      ...p,    //* keep ALL other draft fields unchanged

      [key] : p[key].includes(val)

        ?     p[key].filter( (x) => x !== val )
        :     [...p[key], val],
    })
  );

  return (
    <div className="flex flex-col h-full bg-white w-full flex-1 min-h-0">
      
      {/* scrollable area */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col gap-6 min-h-0">
      
        {/* header */}
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-900">Filters</p>

          <div className="flex items-center gap-3">
            {/* Clear All */}
            {hasFilters && (
              <button
                onClick={onClear}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear all
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 -mr-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* price */}
        <div>
          <span className={sl}>Price Range</span>
          <div className="flex flex-col gap-1.5">
            {PRICE_RANGES.map( (r) => (
              <label key={r.label} 
                     className={row}
              >
                <input
                  type="radio"
                  className="w-3.5 h-3.5 flex-shrink-0 accent-blue-600"
                  checked={draft.selectedPrice?.label === r.label}
                  onChange={() =>
                    setDraft((p) => ({
                      ...p,
                      selectedPrice:
                        p.selectedPrice?.label === r.label 
                        ? null 
                        : r,
                    }))
                  }
                />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        {/* gender */}
        <div>
          <span className={sl}>Gender</span>
          <div className="flex flex-col gap-1.5">
            {[
              ["male", "Male"],
              ["female", "Female"],
              ["mix", "Co-ed"],
            ].map( ([v, d]) => (
              <label key={v} className={row}>
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 flex-shrink-0 accent-blue-600"
                  checked={draft.genderFilter.includes(v)}
                  onChange={() => toggleArr("genderFilter", v)}
                />
                {d}
              </label>
            ))}
          </div>
        </div>

        {/* food */}
        <div>
          <span className={sl}>Food</span>
          <div className="flex flex-col gap-1.5">
            {[
              ["with food", "With Food"],
              ["without food", "Without Food"],
              ["flexible", "Flexible"],
            ].map( ([v, d]) => (
              <label 
                key={v} 
                className={row}
              >
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 flex-shrink-0 accent-blue-600"
                  checked={draft.foodFilter.includes(v)}
                  onChange={() => toggleArr("foodFilter", v)}
                />
                {d}
              </label>
            ))}
          </div>
        </div>

        {/* rating */}
        <div>
          <span className={sl}>Min Rating</span>
          <div className="flex flex-col gap-1.5">
            {[4, 3, 2].map((r) => (
              <label 
                key={r} 
                className={row}
              >
                <input
                  type="radio"
                  className="w-3.5 h-3.5 flex-shrink-0 accent-blue-600"
                  checked={draft.minRating === r}
                  onChange={ () =>
                    setDraft((p) => ({
                      ...p,
                      minRating: p.minRating === r ? 0 : r,
                    }))
                  }
                />
                <span className="text-yellow-500">{"★".repeat(r)}</span>
                <span className="text-slate-400">& up</span>
              </label>
            ))}
          </div>
        </div>

        {/* amenities */}
        <div>
          <span className={sl}>Amenities</span>
          <div className="flex flex-col gap-1.5">
            { AMENITIES.map((a) => (
              <label key={a} className={row}>
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 flex-shrink-0 accent-blue-600"
                  checked={draft.selectedAmenities.includes(a)}
                  onChange={() => toggleArr("selectedAmenities", a)}
                />
                {a}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* fixed apply button */}
      <div className="p-5 border-t border-slate-100 bg-white shrink-0">
        <button
          onClick={() => {
            onApply();
            if (onClose) onClose();
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
