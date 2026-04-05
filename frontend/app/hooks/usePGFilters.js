//! Custom Hook for filtering
// ?Custom hook returns an **object** (not array like useState). Why?
// ?const { sorted, fp, ... } = usePGFilters()

import { useState } from "react";
import { useSearch } from "../context/SearchContext";

const EMPTY_DRAFT = {
  selectedPrice: null,  // *no price filter
  selectedAmenities: [],
  genderFilter: [],
  foodFilter: [],
  minRating: 0,
};

export function usePGFilters(data = [], query = "", mode = "local") {
  const { drawerOpen, setDrawerOpen } = useSearch();

  const [draft, setDraft] = useState(EMPTY_DRAFT);    //? reset draft
  const [active, setActive] = useState(EMPTY_DRAFT);  //? reset active

  const [sortField, setSortField] = useState(null);  //?"price"|"rating"|"reviews"|null
  const [sortOrder, setSortOrder] = useState("asc");  //? "asc" | "desc"

  const applyFilters = () => {
    setActive({ ...draft });  //?→ Spread creates a COPY — safe and independent ✅
    setDrawerOpen(false);
  };

  const clearFilters = () => {
    setDraft(EMPTY_DRAFT);  //* reset work-in-progress
    setActive(EMPTY_DRAFT); // *reset applied filters
     //* → both point to same EMPTY_DRAFT object (fine, it's never mutated)
  };

  // ?  `!!` — double NOT (converts to boolean):**
  const hasFilters = !!(
    active.selectedPrice ||
    active.selectedAmenities.length ||
    active.minRating ||
    active.genderFilter.length ||
    active.foodFilter.length
  );

  //? The Badge Number
  const filterCount = [
    active.selectedPrice ? 1 : 0,
    active.genderFilter.length,
    active.foodFilter.length,
    active.minRating > 0 ? 1 : 0,
    active.selectedAmenities.length,
  ].reduce(
    (a, b) => a + b, 0
  );

  //? The Sort Toggle
  const toggleSort = (field) => {
    if (sortField === field)
      setSortOrder(
    (o) => (o === "asc" ? "desc" : "asc")
  );
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };


  // ?The Core Filter Logic
  // ?→ returns new array with only PGs that passed ALL conditions
  const filtered = mode === "remote" ? data : data.filter((pg) => {

    //* Each condition — early return pattern

    //* SEARCH FILTER
    if (query && query.trim()) {
      const q = query.toLowerCase();
      if (
        !(pg.name || "").toLowerCase().includes(q) && //* "".toLowerCase()    → ""  → safe ✅
        !(pg.city || "").toLowerCase().includes(q)
      )
        return false;
    }

    //* PRICE FILTER
    if (
      active.selectedPrice &&
      (pg.price < active.selectedPrice.min ||
        pg.price > active.selectedPrice.max)
    )
      return false;
        
    //* AMENITIES FILTER
    if (
      active.selectedAmenities.length 
      &&
      !active.selectedAmenities.every(    //* .every(callback)`** → returns `true` only if ALL items pass:
        (a) => pg.amenities?.includes(a)
      )
    )
      return false;


    //* RATING FILTER
    if (
      active.minRating > 0 &&
      (parseFloat(pg.ratingData?.avg) || 0) < active.minRating
    )
      return false;

    //* GENDER & FOOD FILTERS
    if (active.genderFilter.length && !active.genderFilter.includes(pg.gender))
      return false;

    if (active.foodFilter.length && !active.foodFilter.includes(pg.food))
      return false;


    return true;    //*← passed,survived ALL filters
  });


  //? sorted — Sorting the Filtered Results -> duplicate array same as filtered
  const sorted = mode === "remote" ? filtered : [...filtered].sort((a, b) => {
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

    return (sortOrder === "asc") ? (va - vb) : (vb - va) ;
  });

  // The Filter Panel Props Bundle
  const fp = {
    draft,
    setDraft,
    onApply: applyFilters,
    onClear: clearFilters,
    hasFilters,
  };  


  return {
    sorted,        // final filtered+sorted PG array → render these
    fp,            // filter panel props bundle
    filterCount,   // number for badge
    sortField,     // which field is sorted
    sortOrder,     // asc or desc
    toggleSort,    // function for sort buttons
    drawerOpen,    // mobile drawer state
    setDrawerOpen, // open/close drawer
    hasFilters,    // any filters active?
    clearFilters,  // reset everything
    active,        // EXPORT active filters for remote fetching
  };
}
