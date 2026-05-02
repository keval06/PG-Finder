"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSearch } from "../context/SearchContext";
import { useAuth } from "../context/AuthContext";
import BackButton from "../../components/BackButton";
import StatusBadge from "../../components/StatusBadge";
import ConfirmModal from "../../components/ConfirmModal";
import PaginationWrapper from "../../components/PaginationWrapper";
import { bookingApi } from "../../lib/api/booking";
import CustomSelect from "../../components/CustomSelect";
import EmptyState from "../atoms/EmptyState";

import {
  MapPin,
  Calendar,
  Users,
  Bed,
  IndianRupee,
  X,
  Search,
  ChevronRight,
  XCircle,
  CheckCircle2,
} from "lucide-react";

// ──────────────── helpers ───────────────────────────────────
function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFullDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  const day = date.getDate();
  const month = date.toLocaleDateString("en-IN", { month: "short" });
  const year = date.getFullYear();

  const suffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return `${day}${suffix(day)} ${month} ${year}`;
}

// ─── main component ───────────────────────────────────────────
export default function MyBookingsPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [popupError, setPopupError] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const { query, setQuery } = useSearch();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 5;



  // ─── fetch bookings
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const params = new URLSearchParams();
      if (statusTab !== "all") params.append("status", statusTab);
      if (dateRange !== "all") params.append("dateRange", dateRange);
      if (query.trim()) params.append("q", query.trim());
      params.append("page", page);
      params.append("limit", ITEMS_PER_PAGE);

      const response = await bookingApi.getUserBookings(token, params.toString());
      setBookings(Array.isArray(response.data) ? response.data : []);
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
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [statusTab, dateRange, query, page]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    setLoading(true);
    const timeoutId = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [ready, user, router, fetchBookings]);

  // ─── cancel booking
  const handleCancel = async () => {
    if (!cancelTarget) return;
    setProcessing(true);
    setPopupError("");
    try {
      const token = localStorage.getItem("token");
      await bookingApi.updateStatus(cancelTarget._id, "cancelled", token);
      setCancelTarget(null);
      fetchBookings();
    } catch {
      setPopupError("Failed to cancel booking. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── local filtering removed (now remote) ───

  const TABS = [
    { key: "all", label: "All" },
    { key: "confirmed", label: "Confirmed" },
    { key: "pending", label: "Pending" },
    { key: "cancelled", label: "Cancelled" },
    { key: "completed", label: "Completed" },
  ];

  const RANGES = [
    { value: "all", label: "All Time" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "6m", label: "6 Months" },
    { value: "1y", label: "1 Year" },
  ];

  return (
    <div className="bg-white min-h-screen pb-20 selection:bg-rose-100">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-20 py-6">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-col gap-2">
              <BackButton />
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#222222]">
                My Bookings
              </h1>
              <p className="text-base text-[#717171]">
                {loading
                  ? "Updating..."
                  : query.trim()
                  ? `${totalCount} matching "${query}"`
                  : `${totalCount} booking${totalCount !== 1 ? "s" : ""} placed`}
              </p>
            </div>
            <button
              onClick={() => router.push("/home")}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#DDDDDD] rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all hover:shadow-sm"
            >
              Browse PGs <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Status tabs + Search + Date */}
          <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-50/50 p-2 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-1 bg-white shadow-sm border border-[#DDDDDD] rounded-xl p-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setStatusTab(t.key);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    statusTab === t.key
                      ? "bg-[#FF385C] text-white shadow-md shadow-rose-200"
                      : "text-[#717171] hover:text-[#222222] hover:bg-slate-50"
                  }`}
                >
                  {t.label}
                  {statusTab === t.key && totalCount > 0 && !loading && (
                    <span className="ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                      {totalCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717171]" />
                <input
                  type="text"
                  placeholder="Search PG name or city…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#DDDDDD] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-50 focus:border-rose-400 transition-all shadow-sm"
                />
              </div>
              
              <CustomSelect
                value={dateRange}
                onChange={(val) => {
                  setDateRange(val);
                  setPage(1);
                }}
                options={RANGES}
                className="sm:w-40 h-[42px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : bookings.length === 0 && statusTab === "all" && dateRange === "all" && !query.trim() ? (
              <EmptyState
                icon={Bed}
                title="No bookings yet"
                description="Your upcoming stays will appear here after booking a property."
                action={
                  <button
                    onClick={() => router.push("/home")}
                    className="inline-flex items-center gap-2 bg-rose-500 text-white text-sm font-semibold px-8 py-3 rounded-xl hover:bg-rose-600 transition-all shadow-md shadow-rose-100"
                  >
                    Start Searching <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                }
              />
            ) : bookings.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No matches found"
                description="We couldn't find any bookings matching your current search or filters."
                action={
                  <button
                    onClick={() => {
                      setQuery("");
                      setStatusTab("all");
                      setDateRange("all");
                      setPage(1);
                    }}
                    className="text-rose-500 font-semibold hover:underline"
                  >
                    Clear all filters
                  </button>
                }
              />
            ) : (
              <div className="flex flex-col gap-6">
                <PaginationWrapper
                  data={bookings}
                  itemsPerPage={ITEMS_PER_PAGE}
                  renderItem={(b) => (
                    <BookingCard key={b._id} b={b} onCancel={() => setCancelTarget(b)} />
                  )}
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
        isOpen={!!cancelTarget}
        title="Cancel Booking?"
        description="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Yes, Cancel"
        processing={processing}
        error={popupError}
        onConfirm={handleCancel}
        onClose={() => setCancelTarget(null)}
        variant="danger"
      />
    </div>
  );
}

function BookingCard({ b, onCancel }) {
  const isCancelled = b.status === "cancelled";
  const router = useRouter();

  return (
    <div 
      className={`bg-white border rounded-2xl overflow-hidden transition-all cursor-pointer ${
        isCancelled 
          ? "opacity-50 border-[#DDDDDD]" 
          : "border-[#DDDDDD] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] hover:border-gray-300"
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* PG Info Header */}
        <div className="flex items-start justify-between gap-3 mb-5 ">
          <div className="min-w-0 cursor-pointer group" onClick={() => router.push(`/pg/${b.pg?._id}`)}>
            <h2 className="text-[17px] font-semibold text-[#222222] truncate leading-tight group-hover:text-rose-500 transition-colors">
              {b.pg?.name || "PG Listing"}
            </h2>
            <div className="flex items-center gap-1.5 text-[15px] text-[#484848] mt-1">
              <MapPin size={14} className="text-gray-400 shrink-0" />
              <span className="truncate capitalize">{b.pg?.city || "Location not specified"}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge type="booking" status={b.status} />
            <span className="text-[12px] font-medium text-[#717171] whitespace-nowrap">
              {formatFullDate(b.createdAt)}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-[#DDDDDD] rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase text-[#717171] mb-1">Room Type</p>
            <p className="text-sm font-semibold text-[#222222] capitalize flex items-center gap-2">
              <Bed size={14} className="text-rose-500" />
              {b.roomType?.name || "Standard"}
            </p>
          </div>
          <div className="bg-white border border-[#DDDDDD] rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase text-[#717171] mb-1">Capacity</p>
            <p className="text-sm font-semibold text-[#222222] flex items-center gap-2">
              <Users size={14} className="text-rose-500" />
              {b.roomType?.sharingCount || "1"}-sharing
            </p>
          </div>
          <div className="bg-white border border-[#DDDDDD] rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase text-[#717171] mb-1">Stay Period</p>
            <p className="text-sm font-semibold text-[#222222] flex items-center gap-2">
              <Calendar size={14} className="text-rose-500" />
              {formatDate(b.checkInDate).replace(/ \d{4}$/, "")} → {formatDate(b.checkOutDate).replace(/ \d{4}$/, "")}
            </p>
          </div>
          <div className="bg-white border border-[#DDDDDD] rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase text-[#717171] mb-1 tracking-wider">Payment</p>
            <StatusBadge type="payment" status={b.paymentStatus} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-5 border-t border-[#DDDDDD]">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-[#717171] tracking-widest">Total Amount</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-[#222222] flex items-center gap-0.5">
                <IndianRupee size={16} strokeWidth={2.5} />
                {(b.totalPrice || b.amount)?.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] font-bold uppercase text-[#717171]">all inclusive</span>
            </div>
          </div>

          {!isCancelled && (
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/pg/${b.pg?._id}`)}
                className="hidden sm:flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl border border-[#DDDDDD] text-[#717171] bg-white hover:bg-slate-50 transition-all"
              >
                View PG
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl border border-rose-100 text-rose-500 bg-white hover:bg-rose-50 transition-all shadow-sm"
              >
                <XCircle size={14} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
