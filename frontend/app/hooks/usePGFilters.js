import { useState } from "react";

const EMPTY_DRAFT = {
  selectedPrice: null,
  selectedAmenities: [],
  genderFilter: [],
  foodFilter: [],
  minRating: 0,
};

export function usePGFilters(data = [], query = "") {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [active, setActive] = useState(EMPTY_DRAFT);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const applyFilters = () => {
    setActive({ ...draft });
    setDrawerOpen(false);
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

  const filtered = data.filter((pg) => {
    if (query && query.trim()) {
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

  return {
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
  };
}
