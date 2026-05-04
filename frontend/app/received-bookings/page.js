"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import BackButton from "../../components/BackButton";
import StatusBadge from "../../components/StatusBadge";
import ConfirmModal from "../../components/ConfirmModal";
import PaginationWrapper from "../../components/PaginationWrapper";
import { bookingApi } from "../../lib/api/booking";
import { useSearch } from "../context/SearchContext";
import CustomSelect from "../../components/CustomSelect";
import EmptyState from "../atoms/EmptyState";

import {
  MapPin,
  Calendar,
  Users,
  Bed,
  IndianRupee,
  Phone,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Search,
} from "lucide-react";

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

export default function ReceivedBookingsPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState(null); // { booking, newStatus }
  const [processing, setProcessing] = useState(false);
  const [popupError, setPopupError] = useState("");
  const [toast, setToast] = useState(null);

  const { query, setQuery } = useSearch();
  const [statusTab, setStatusTab] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 5;

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

      const response = await bookingApi.getOwnerBookings(token, params.toString());
      const bookingList = Array.isArray(response.data) ? response.data : [];

      setBookings(bookingList);
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

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAction = async () => {
    if (!actionTarget) return;
    setProcessing(true);
    setPopupError("");
    try {
      const token = localStorage.getItem("token");
      const data = await bookingApi.updateStatus(
        actionTarget.booking._id,
        actionTarget.newStatus,
        token,
      );

      // Backend returns the updated booking doc (has _id), NOT { message: "..." }
      if (data._id) {
        setActionTarget(null);
        showToast("success", `Booking ${actionTarget.newStatus}.`);
        fetchBookings(); // refetch fresh data from server
      } else {
        setPopupError(data.message || "Something went wrong.");
      }
    } catch {
      setPopupError("Network error. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── local filtering removed (now remote) ───

  const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "confirmed", label: "Confirmed" },
    { key: "pending", label: "Pending" },
    { key: "cancelled", label: "Cancelled" },
    { key: "completed", label: "Completed" },
  ];

  const DATE_OPTIONS = [
    { value: "all", label: "All Time" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "6m", label: "6 Months" },
    { value: "1y", label: "1 Year" },
  ];

  return (
    <>
      <div className="bg-white min-h-screen pb-20 selection:bg-rose-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10 lg:px-20 py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:gap-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex flex-col gap-2">
                <BackButton />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-[#222222]">
                  Received Bookings
                </h1>
                <p className="text-base text-[#717171]">
                  {loading
                    ? "Updating..."
                    : query.trim()
                      ? `${totalCount} matching "${query}"`
                      : `${totalCount} booking${totalCount !== 1 ? "s" : ""} managed`}
                </p>
              </div>
              <button
                onClick={() => router.push("/my-listings")}
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#222222] border border-[#DDDDDD] px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all hover:shadow-sm"
              >
                My Listings <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
            {/* Status tabs + Date range */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 p-2 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-1 bg-white shadow-sm border border-[#DDDDDD] rounded-xl p-1 overflow-x-auto scrollbar-hide w-full sm:w-auto">
                {STATUS_TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => {
                      setStatusTab(t.key);
                      setPage(1);
                    }}
                    className={`px-2.5 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-shrink-0 ${statusTab === t.key ? "bg-[#FF385C] text-white shadow-md shadow-rose-200" : "text-[#717171] hover:text-[#222222] hover:bg-slate-50"}`}
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

              <div className="flex items-center gap-2 w-full sm:flex-initial">
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
                  options={DATE_OPTIONS}
                  className="sm:w-40 h-[42px]"
                />
              </div>
            </div>

            {/* toast */}
            {toast && (
              <div
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold animate-[fadeIn_0.2s_ease-out] border shadow-sm ${toast.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : "bg-red-50 text-red-600 border-red-100"
                  }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <XCircle size={18} className="text-red-500" />
                )}
                {toast.text}
              </div>
            )}

            {/* content */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : bookings.length === 0 && statusTab === "all" && dateRange === "all" && !query.trim() ? (
              <EmptyState
                icon={Bed}
                title="No bookings yet"
                description="Bookings for your properties will appear here automatically."
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
                    <ReceivedCard
                      key={b._id}
                      booking={b}
                      onConfirm={
                        b.status === "pending"
                          ? () => setActionTarget({ booking: b, newStatus: "confirmed" })
                          : undefined
                      }
                      onCancel={
                        b.status !== "cancelled"
                          ? () => setActionTarget({ booking: b, newStatus: "cancelled" })
                          : undefined
                      }
                    />
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
        isOpen={!!actionTarget}
        title={
          actionTarget?.newStatus === "confirmed"
            ? "Confirm Booking?"
            : "Cancel Booking?"
        }
        description={
          actionTarget?.newStatus === "confirmed"
            ? "This will confirm the guest's booking and occupy a bed."
            : "This will cancel the booking and free up the bed."
        }
        confirmText={
          actionTarget?.newStatus === "confirmed"
            ? "Yes, Confirm"
            : "Yes, Cancel"
        }
        cancelText="Go Back"
        processing={processing}
        error={popupError}
        onConfirm={handleAction}
        onClose={() => {
          setActionTarget(null);
          setPopupError("");
        }}
        variant={actionTarget?.newStatus === "confirmed" ? "primary" : "danger"}
      />
    </>
  );
}

// ─── Card ──────────────────────────────────────────────────────
function ReceivedCard({ booking: b, onConfirm, onCancel }) {
  const isCancelled = b.status === "cancelled";
  const isPending = b.status === "pending";
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/pg/${b.pg?._id}`)}
      className={`bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all ${isCancelled
        ? "opacity-50 border-[#DDDDDD]"
        : "border-[#DDDDDD] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] hover:border-gray-300"
        }`}
    >
      <div className="p-5 sm:p-6">
        {/* row 1: pg name + status */}
        <div className="flex items-start justify-between gap-2 mb-3 sm:mb-5">
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold text-[#222222] truncate leading-tight">
              {b.pg?.name || "PG"}
            </h2>
            <div className="flex items-center gap-1.5 text-[15px] text-[#484848] mt-1">
              <MapPin size={14} className="text-gray-400 shrink-0" />
              <span className="truncate capitalize">{b.pg?.city || "—"}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge type="booking" status={b.status} />
            <span className="text-[12px] font-medium text-[#717171] whitespace-nowrap">
              {formatFullDate(b.createdAt)}
            </span>
          </div>
        </div>

        {/* row 2: guest info */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6 bg-[#FFFFFF] border border-[#DDDDDD] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm flex-shrink-0">
            {b.user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#222222] truncate">
              {b.user?.name || "—"}
            </p>
            <p className="text-sm text-[#717171] flex items-center gap-2">
              <Phone size={12} className="opacity-80" /> {b.user?.mobile || "—"}
            </p>
          </div>
        </div>

        {/* row 3: details grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white border border-[#DDDDDD] rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase text-[#717171] mb-1 tracking-wider">Room</p>
            <p className="text-sm font-semibold text-[#222222] capitalize flex items-center gap-2">
              <Bed size={14} className="text-rose-500" />
              {b.roomType?.name || "—"}
            </p>
          </div>
          <div className="bg-white border border-[#DDDDDD] rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase text-[#717171] mb-1 tracking-wider">Sharing</p>
            <p className="text-sm font-semibold text-[#222222] flex items-center gap-2">
              <Users size={14} className="text-rose-500" />
              {b.roomType?.sharingCount || "—"}-sharing
            </p>
          </div>
          <div className="bg-white border border-[#DDDDDD] rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase text-[#717171] mb-1 tracking-wider">Dates</p>
            <p className="text-sm font-semibold text-[#222222] flex items-center gap-2">
              <Calendar size={14} className="text-rose-500" />
              {formatDate(b.checkInDate).replace(/ \d{4}$/, "")} →{" "}
              {formatDate(b.checkOutDate).replace(/ \d{4}$/, "")}
            </p>
          </div>
          <div className="bg-white border border-[#DDDDDD] rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase text-[#717171] mb-1 tracking-wider">Payment</p>
            <StatusBadge type="payment" status={b.paymentStatus} />
          </div>
        </div>

        {/* row 4: amount + actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 sm:pt-5 border-t border-[#DDDDDD]">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-[#222222] flex items-center gap-0.5">
              <IndianRupee size={16} strokeWidth={2.5} />
              {b.amount?.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-bold uppercase text-[#717171]">total</span>
          </div>

          {!isCancelled && (
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              {isPending && onConfirm && (
                <button
                  onClick={onConfirm}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-rose-200 text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <CheckCircle2 size={14} /> Confirm
                </button>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-[#DDDDDD] text-[#717171] bg-white hover:bg-slate-50 transition-colors"
                >
                  <XCircle size={14} /> Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
