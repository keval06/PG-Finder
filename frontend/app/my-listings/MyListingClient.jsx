"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, Plus, Home as HomeIcon, Bed } from "lucide-react";
import ListingCard from "./components/ListingCard";
import FilterPanel from "../../components/FilterPanel";
import SortBtn from "../../components/SortBtn";
import ConfirmModal from "../../components/ConfirmModal";
import PaginationWrapper from "../../components/PaginationWrapper";
import { usePGFilters } from "../hooks/usePGFilters";
import { pgApi } from "../../lib/api/pg";
import { reviewApi } from "../../lib/api/review";
import { roomTypeApi } from "../../lib/api/roomType";
import { imageApi } from "../../lib/api/image";
import Button from "../atoms/Button";
import EmptyState from "../atoms/EmptyState";
import Badge from "../atoms/Badge";
import { useSearch } from "../context/SearchContext";
import dynamic from "next/dynamic";
import BackButton from "../../components/BackButton";
const PGForm = dynamic(() => import("./components/PGForm"), { ssr: false });


export default function MyListingsClient() {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const { query } = useSearch();

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
  } = usePGFilters(pgs, query);

  const { setFilterCount: setGlobalFilterCount } = useSearch();

  useEffect(() => {
    setGlobalFilterCount(filterCount);
  }, [filterCount, setGlobalFilterCount]);

  // Lock body scroll when filter drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

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
      if (!token) {
        setLoading(false);
        return;
      }
      // Get owner PGs directly
      const ownerResponse = await pgApi.getOwnerPgs(token);

      //Extract .data from response
      let mine = Array.isArray(ownerResponse.data) ? ownerResponse.data : [];

      const withRatings = await Promise.all(
        mine.map(async (pg) => {
          try {
            const [reviewRes, images] = await Promise.all([
              reviewApi.getByPgId(pg._id).catch(() => []),
              imageApi.getByPgId(pg._id).catch(() => []),
            ]);

            // Extract array from paginated response
            const reviews = Array.isArray(reviewRes)
              ? reviewRes
              : reviewRes?.reviews ?? [];
            const total = Array.isArray(reviewRes)
              ? reviews.length
              : reviewRes?.total ?? 0;
            let ratingData = null;
            if (reviews.length > 0) {
              const avg =
                reviews.reduce((s, rv) => s + rv.star, 0) / reviews.length;
              ratingData = { avg: avg.toFixed(1), count: total };
            }

            return {
              ...pg,
              images: Array.isArray(images) ? images : [],
              image: images?.[0]?.url || null,
              ratingData,
            };
          } catch {
            return { ...pg, ratingData: null, image: null };
          }
        })
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

      const pgPayload = {
        ...pgData,
        coordinate: Array.isArray(pgData.coordinate)
          ? { type: "Point", coordinates: pgData.coordinate }
          : pgData.coordinate,
      };

      // step 1 — create PG
      const newPg = await pgApi.create(pgPayload, token);
      if (!newPg._id) return;

      // step 2 — create each room type sequentially
      for (const rt of roomTypes) {
        await roomTypeApi.create({ ...rt, pg: newPg._id }, token);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <>
      {drawerOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-full max-w-sm max-h-[90vh] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-[fadeIn_0.15s_ease-out]">
            <FilterPanel {...fp} onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

    <div className="bg-white min-h-screen pb-20 selection:bg-rose-100">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-20 py-6">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-col gap-2">
              <BackButton />
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#222222]">
                My Listings
              </h1>
              <p className="text-base text-[#717171]">
                Manage your {sorted.length} properties
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <SortBtn label="Price" field="price" {...{ sortField, sortOrder, onToggle: toggleSort }} />
                <SortBtn label="Rating" field="rating" {...{ sortField, sortOrder, onToggle: toggleSort }} />
                <SortBtn label="Reviews" field="reviews" {...{ sortField, sortOrder, onToggle: toggleSort }} />
              </div>
              <Button
                variant={createOpen ? "primary" : "outline"}
                onClick={() => setCreateOpen(!createOpen)}
                icon={Plus}
                className="!rounded-xl h-11 text-sm font-semibold border-[#DDDDDD] hover:shadow-sm"
              >
                Add New PG
              </Button>
            </div>
          </div>

        {createOpen && (
          <div className="bg-white border border-[#DDDDDD] rounded-3xl p-8 mb-10 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
            <div className="mb-6">
              <h3 className="text-[22px] font-semibold text-[#222222]">New PG Listing</h3>
              <p className="text-[#717171] text-sm">List your property with clear details.</p>
            </div>
            <PGForm
              onSubmit={handleCreate}
              onCancel={() => setCreateOpen(false)}
              saving={creating}
            />
          </div>
        )}

        {sorted.length === 0 ? (
          <EmptyState
            icon={HomeIcon}
            title="No listings yet"
            description='Click "Add New PG" to begin.'
          />
        ) : (
          <div className="flex flex-col gap-6">
            <PaginationWrapper
              data={sorted}
              itemsPerPage={5}
              renderItem={(pg) => <ListingCard key={pg._id} pg={pg} />}
            />
          </div>
        )}
      </div>
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
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              PG Details
            </p>
            <div className="flex flex-col gap-1.5 text-left">
              <p className="text-sm text-slate-700 leading-tight flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span>
                  Name:{" "}
                  <span className="font-semibold text-slate-900">
                    {pendingData?.pgData?.name || ""}
                  </span>
                </span>
              </p>
              <p className="text-sm text-slate-700 leading-tight flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                <span>
                  City:{" "}
                  <span className="font-semibold text-slate-900">
                    {pendingData?.pgData?.city || ""}
                  </span>
                </span>
              </p>
            </div>
          </div>

          {pendingData?.roomTypes?.length > 0 && (
            <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-100/50">
              <p className="text-xs font-semibold text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Bed size={12} /> Room Types
              </p>
              <div className="flex flex-col gap-2">
                {pendingData.roomTypes.map((rt, i) => (
                  <div
                    key={i}
                    className="bg-white/80 rounded-lg p-2.5 border border-rose-100 flex justify-between items-center text-xs"
                  >
                    <div className="text-left">
                      <p className="font-bold text-slate-900 capitalize">
                        {rt.name}
                      </p>
                      <p className="text-slate-500">
                        {rt.availableRooms} rooms
                      </p>
                    </div>
                    <p className="font-bold text-rose-500">₹{rt.price}</p>
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
