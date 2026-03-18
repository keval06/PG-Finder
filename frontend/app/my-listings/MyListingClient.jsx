"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, SlidersHorizontal, X, Plus } from "lucide-react";
import ListingCard from "./ListingCard";
import PGForm from "./PGForm";
import FilterPanel from "../components/FilterPanel";

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

export default function MyListingsClient() {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [active, setActive] = useState(EMPTY_DRAFT);
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

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

  useEffect(() => {
    if (!ready) 
      return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetchMyPGs();
  }, [ready, user]);


  const fetchMyPGs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const ownerRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pg/owner`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      let mine = [];
      if (ownerRes.ok) {
        mine = await ownerRes.json();
      } else {
        const all = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pg`, {
          cache: "no-store",
        }).then((r) => r.json());
        mine = Array.isArray(all)
          ? all.filter(
              (pg) =>
                (pg.owner?._id || pg.owner)?.toString() === user._id?.toString()
            )
          : [];
      }
      const withRatings = await Promise.all(
        mine.map(async (pg) => {
          try {
            const r = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/review?pg=${pg._id}`,
              { cache: "no-store" }
            );
            const reviews = await r.json();
            if (!Array.isArray(reviews) || reviews.length === 0)
              return { ...pg, ratingData: null };
            const avg =
              reviews.reduce((s, rv) => s + rv.star, 0) / reviews.length;
            return {
              ...pg,
              ratingData: { avg: avg.toFixed(1), count: reviews.length },
            };
          } catch {
            return { ...pg, ratingData: null };
          }
        })
      );
      setPgs(withRatings);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    setCreating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...formData, coordinate: [0, 0] }),
      });
      if (res.ok) {
        setCreateOpen(false);
        await fetchMyPGs();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleUpdated = (updated) =>
    setPgs((p) =>
      p.map((pg) => (pg._id === updated._id ? { ...pg, ...updated } : pg))
    );

  const filtered = pgs.filter((pg) => {
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

  if (!ready || loading)
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <>
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
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
            <FilterPanel {...fp} />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
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
            <div className="flex items-center gap-2 flex-wrap">
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
              <button
                onClick={() => setCreateOpen((o) => !o)}
                className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-xl border transition-colors ${
                  createOpen
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                }`}
              >
                <Plus size={14} /> Add PG
              </button>
            </div>
          </div>

          {createOpen && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
              <h3 className="font-semibold text-slate-900 mb-0.5">
                New PG Listing
              </h3>
              <p className="text-xs text-slate-400 mb-1">
                Fill in the details to list your PG
              </p>
              <PGForm
                onSubmit={handleCreate}
                onCancel={() => setCreateOpen(false)}
                saving={creating}
              />
            </div>
          )}

          {sorted.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-3">🏠</p>
              <p className="font-semibold text-slate-900 mb-1">
                {pgs.length === 0 ? "No listings yet" : "No PGs match filters"}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                {pgs.length === 0
                  ? 'Click "Add PG" to post your first listing'
                  : "Try adjusting your filters"}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Clear All filters
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {sorted.map((pg) => (
                <ListingCard key={pg._id} pg={pg} onUpdated={handleUpdated} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
