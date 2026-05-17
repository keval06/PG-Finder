"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, Plus, Home as HomeIcon, Bed, Eye, EyeOff, LayoutList, Search } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";
import ListingCard from "./components/ListingCard";
import FilterPanel from "@/components/FilterPanel";
import SortBtn from "@/components/SortBtn";
import ConfirmModal from "@/components/ConfirmModal";
import PaginationWrapper from "@/components/PaginationWrapper";
import { usePGFilters, buildFilterParams } from "@/hooks/usePGFilters";
import { pgApi } from "@/lib/api/pg";
import { reviewApi } from "@/lib/api/review";
import { roomTypeApi } from "@/lib/api/roomType";
import { imageApi } from "@/lib/api/image";
import Button from "@/atoms/Button";
import EmptyState from "@/atoms/EmptyState";
import Badge from "@/atoms/Badge";
import { useSearch } from "@/context/SearchContext";
import dynamic from "next/dynamic";
import BackButton from "@/components/BackButton";
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

  const { query, setQuery } = useSearch();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "inactive"
  const ITEMS_PER_PAGE = 5;

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
    active,
  } = usePGFilters(pgs, query, "remote");

  const { setFilterCount: setGlobalFilterCount } = useSearch();

  useEffect(() => {
    setGlobalFilterCount(filterCount);
  }, [filterCount, setGlobalFilterCount]);

  // Reset pagination to page 1 when any filter changes
  useEffect(() => {
    setPage(1);
  }, [active, sortField, sortOrder, query, statusFilter]);

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

  // Now, if the user clicks "Page 2" or applies a "Price Filter", React automatically detects the state change, waits 300ms (debounce to prevent spamming the server while typing), and fires the request.

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    
    const timeoutId = setTimeout(() => {
      fetchMyPGs();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [ready, user, page, active, sortField, sortOrder, query, statusFilter]);

  const fetchMyPGs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      
      const params = buildFilterParams({
        active, query, sortField, sortOrder, page, limit: ITEMS_PER_PAGE
      });
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await pgApi.getOwnerPgs(token, params.toString());
      const pgsData = response.data || [];

      const formattedPgs = await Promise.all(
        pgsData.map(async (pg) => {
          try {
            const images = await imageApi.getByPgId(pg._id).catch(() => []);
            return {
              ...pg,
              images: Array.isArray(images) ? images : [],
              image: images?.[0]?.url || null,
              // Now we just map the data the server handed us natively:
              ratingData: {
                avg: pg.avgRating?.toFixed(1) || "0.0",
                count: pg.reviewCount || 0
              }
            };
          } catch {
            return { ...pg, ratingData: null, image: null };
          }
        })
      );
      
      setPgs(formattedPgs);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (err) {
      if (
        err?.message?.includes("invalid signature") ||
        err?.message?.includes("jwt expired") ||
        err?.status === 401 ||
        err?.status === 403
      ) {
        localStorage.removeItem("token");
        router.replace("/auth/login");
      }
      setPgs([]);
      setTotalPages(1);
      setTotalCount(0);
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

  if (!ready)
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
          <div className="flex flex-col gap-4 py-4">
            {/* Row 1: Title + Add button */}
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <BackButton />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#222222]">
                  My Listings
                </h1>
                <p className="text-sm text-[#717171]">
                  Manage your {totalCount} {totalCount === 1 ? "property" : "properties"}
                </p>
              </div>
              <Button
                variant={createOpen ? "primary" : "outline"}
                onClick={() => setCreateOpen(!createOpen)}
                icon={Plus}
                className="!rounded-xl h-10 text-sm font-semibold border-[#DDDDDD] hover:shadow-sm flex-shrink-0"
              >
                <span className="hidden sm:inline">Add New PG</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            {/* Row 2: Search + Status toggle + Sort buttons */}
            <div className="flex flex-col lg:flex-row flex-wrap items-start lg:items-center justify-between gap-3 bg-slate-50/50 p-2 rounded-2xl border border-gray-100 mt-2">
              {/* Search - Top on mobile, Middle on desktop */}
              <div className="order-1 lg:order-2 flex items-center gap-2 w-full lg:w-auto">
                <div className="relative w-full lg:w-64">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717171]"
                  />
                  <input
                    type="text"
                    placeholder="Search your listings…"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#DDDDDD] rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-50 focus:border-rose-400 transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Filter Section - Status */}
              <div className="order-2 lg:order-1 flex flex-row items-center gap-2 w-full lg:w-auto">
                {/* Status Selector */}
                <div className="flex-[1] sm:flex-none min-w-0">
                  {/* Mobile View Dropdown */}
                  <div className="flex sm:hidden w-full">
                    <CustomSelect
                      value={statusFilter}
                      onChange={(val) => {
                        setStatusFilter(val);
                        setPage(1);
                      }}
                      options={[
                        { value: "all", label: "All" },
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                      ]}
                      className="w-full h-[44px]"
                    />
                  </div>

                  {/* Desktop View Tabs */}
                  <div className="hidden sm:flex items-center bg-white border border-[#DDDDDD] shadow-sm rounded-xl p-1 gap-1 overflow-x-auto scrollbar-hide">
                    {[
                      { key: "all", label: "All", icon: LayoutList },
                      { key: "active", label: "Active", icon: Eye },
                      { key: "inactive", label: "Inactive", icon: EyeOff },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => {
                          setStatusFilter(key);
                          setPage(1);
                        }}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-base sm:text-sm font-semibold transition-all flex-shrink-0 ${
                          statusFilter === key
                            ? "bg-[#FF385C] text-white shadow-md shadow-rose-200"
                            : "text-[#717171] hover:text-[#222222] hover:bg-slate-50"
                        }`}
                      >
                        <Icon size={14} className={statusFilter === key ? "text-white" : "text-[#717171]"} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sort Section */}
              <div className="order-3 flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0 px-1 sm:px-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:hidden">
                  Sort
                </span>
                <div className="flex items-center gap-2 flex-nowrap">
                  <SortBtn label="Price" field="price" {...{ sortField, sortOrder, onToggle: toggleSort }} />
                  <SortBtn label="Rating" field="rating" {...{ sortField, sortOrder, onToggle: toggleSort }} />
                  <SortBtn label="Bookings" field="bookings" {...{ sortField, sortOrder, onToggle: toggleSort }} />
                </div>
              </div>
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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={HomeIcon}
            title="No listings yet"
            description='Click "Add New PG" to begin.'
          />
        ) : (
          <div className="flex flex-col gap-6">
            <PaginationWrapper
              data={sorted}
              itemsPerPage={ITEMS_PER_PAGE}
              renderItem={(pg) => <ListingCard key={pg._id} pg={pg} />}
              page={page}
              onPageChange={setPage}
              totalPages={totalPages}
              totalItems={totalCount}
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
