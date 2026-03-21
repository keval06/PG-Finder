"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X, Plus } from "lucide-react";
import ListingCard from "./ListingCard";
import PGForm from "./PGForm";
import FilterPanel from "../components/FilterPanel";
import SortBtn from "../components/SortBtn";
import ConfirmModal from "../components/ConfirmModal";
import PaginationWrapper from "../components/PaginationWrapper";
import { usePGFilters } from "../hooks/usePGFilters";
import { Bed } from "lucide-react";

export default function MyListingsClient() {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState(null);

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
  } = usePGFilters(pgs);

  useEffect(() => {
    if (!ready) return;
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
      if (!token) { setLoading(false); return; }
      const ownerRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pg/owner`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        },
      );
      let mine = [];
      if (ownerRes.ok) {
        const ownerData = await ownerRes.json();
        mine = Array.isArray(ownerData) ? ownerData : [];
      } else {
        const all = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pg`, {
          cache: "no-store",
        }).then((r) => r.json());
        // /api/pg now returns { data: [...], totalCount, ... } — unwrap it
        const list = Array.isArray(all) ? all : (Array.isArray(all?.data) ? all.data : []);
        mine = list.filter(
          (pg) =>
            (pg.owner?._id || pg.owner)?.toString() ===
            user._id?.toString(),
        );
      }
      const withRatings = await Promise.all(
        mine.map(async (pg) => {
          try {
            const r = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/review?pg=${pg._id}`,
              { cache: "no-store" },
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
        }),
      );
      setPgs(withRatings);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = ({ pgData, roomTypes }) => {
    setPendingData({ pgData, roomTypes });
    setConfirmOpen(true);
  };

  const confirmCreate = async () => {
    if (!pendingData) return;
    const { pgData, roomTypes } = pendingData;
    
    setCreating(true);
    try {
      const token = localStorage.getItem("token");

      // step 1 — create PG
      const pgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pg`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...pgData, coordinate: [0, 0] }),
      });

      if (!pgRes.ok) return;
      const newPg = await pgRes.json();

      // step 2 — create each room type sequentially
      for (const rt of roomTypes) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roomtype`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...rt, pg: newPg._id }),
        });
      }

      setConfirmOpen(false);
      setPendingData(null);
      setCreateOpen(false);
      await fetchMyPGs();
    } finally {
      setCreating(false);
    }
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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-80 bg-white h-full shadow-2xl flex flex-col">
            <FilterPanel {...fp} onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col sticky top-24 h-[calc(100vh-120px)]">
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
            <PaginationWrapper
              data={sorted}
              itemsPerPage={5}
              renderItem={(pg) => (
                <ListingCard key={pg._id} pg={pg} />
              )}
            />
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmCreate}
        title="Confirm New Listing"
        description="Are you sure you want to list this PG with the following details?"
        confirmText="Confirm"
        variant="primary"
        processing={creating}
      >
        <div className="overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-3 max-h-60 mt-2">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">PG Details</p>
            <div className="flex flex-col gap-1.5 text-left">
              <p className="text-sm text-slate-700 leading-tight flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span>Name: <span className="font-semibold text-slate-900">{pendingData?.pgData?.name || ""}</span></span>
              </p>
              <p className="text-sm text-slate-700 leading-tight flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <span>City: <span className="font-semibold text-slate-900">{pendingData?.pgData?.city || ""}</span></span>
              </p>
            </div>
          </div>

          {(pendingData?.roomTypes?.length > 0) && (
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bed size={12} /> Room Types
              </p>
              <div className="flex flex-col gap-2">
                {pendingData.roomTypes.map((rt, i) => (
                  <div key={i} className="bg-white/80 rounded-lg p-2.5 border border-blue-100 flex justify-between items-center text-xs">
                    <div className="text-left">
                      <p className="font-bold text-slate-900 capitalize">{rt.name}</p>
                      <p className="text-slate-500">{rt.availableRooms} rooms</p>
                    </div>
                    <p className="font-bold text-blue-600">₹{rt.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ConfirmModal>
    </>
  );
}