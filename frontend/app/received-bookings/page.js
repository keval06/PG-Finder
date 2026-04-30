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

export default function ReceivedBookingsPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState(null); // { booking, newStatus }
  const [processing, setProcessing] = useState(false);
  const [popupError, setPopupError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/auth/login");
  }, [ready, user]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await bookingApi.getOwnerBookings(token);

      const bookingList = Array.isArray(response.data) ? response.data : [];

      setBookings(bookingList);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready && user) fetchBookings();
  }, [ready, user, fetchBookings]);

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

  // ─── filter hooks (moved to comply with Rules of Hooks)
  const { query, setQuery } = useSearch();
  const [statusTab, setStatusTab] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filterByDate = (list) => {
    if (dateRange === "all") return list;
    const now = new Date();
    const daysMap = { "30d": 30, "90d": 90, "6m": 180, "1y": 365 };
    const cutoff = new Date(now - daysMap[dateRange] * 86400000);
    return list.filter((b) => new Date(b.checkInDate) >= cutoff);
  };

  const filterBySearch = (list) => {
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (b) =>
        (b.pg?.name || "").toLowerCase().includes(q) ||
        (b.pg?.city || "").toLowerCase().includes(q)
    );
  };

  const searched = filterBySearch(filterByDate(bookings));
  const pending = searched.filter((b) => b.status === "pending");
  const confirmed = searched.filter((b) => b.status === "confirmed");
  const cancelled = searched.filter((b) => b.status === "cancelled");

  const tabCounts = {
    all: searched.length,
    pending: pending.length,
    confirmed: confirmed.length,
    cancelled: cancelled.length,
  };

  const displayList =
    statusTab === "all" ? [...pending, ...confirmed, ...cancelled] :
    statusTab === "pending" ? pending :
    statusTab === "confirmed" ? confirmed :
    cancelled;

  const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const DATE_OPTIONS = [
    { key: "all", label: "All Time" },
    { key: "30d", label: "30 Days" },
    { key: "90d", label: "90 Days" },
    { key: "6m", label: "6 Months" },
    { key: "1y", label: "1 Year" },
  ];

  return (
    <>
      <div className="bg-white min-h-screen pb-20 selection:bg-rose-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-20 py-6">
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex flex-col gap-2">
                <BackButton />
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#222222]">
                  Received Bookings
                </h1>
                <p className="text-base text-[#717171]">
                  {query.trim()
                    ? `${searched.length} of ${bookings.length} matching "${query}"`
                    : `${bookings.length} booking${bookings.length !== 1 ? "s" : ""} managed`}
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
              <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-50/50 p-2 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-1 bg-white shadow-sm border border-[#DDDDDD] rounded-xl p-1">
                  {STATUS_TABS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setStatusTab(t.key)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        statusTab === t.key
                          ? "bg-[#FF385C] text-white shadow-md shadow-rose-200"
                          : "text-[#717171] hover:text-[#222222] hover:bg-slate-50"
                      }`}
                    >
                      {t.label}
                      {tabCounts[t.key] > 0 && (
                        <span className={`ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          statusTab === t.key ? "bg-white/20 text-white" : "bg-slate-200 text-[#717171]"
                        }`}>
                          {tabCounts[t.key]}
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
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#DDDDDD] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-50 focus:border-rose-400 transition-all shadow-sm"
                    />
                  </div>
                  
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="bg-white border border-[#DDDDDD] text-[#484848] text-sm font-semibold rounded-xl px-4 py-2.5 outline-none shadow-sm cursor-pointer hover:border-gray-300 transition-all"
                  >
                    {DATE_OPTIONS.map((d) => (
                      <option key={d.key} value={d.key}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* toast */}
              {toast && (
                <div
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold animate-[fadeIn_0.2s_ease-out] border shadow-sm ${
                    toast.type === "success"
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
            {bookings.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-3xl border border-[#DDDDDD] shadow-sm">
                <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Bed size={32} className="text-rose-500" />
                </div>
                <h2 className="text-[22px] font-semibold text-[#222222] mb-2">No bookings yet</h2>
                <p className="text-[#717171] max-w-xs mx-auto">Bookings for your properties will appear here automatically.</p>
              </div>
            ) : displayList.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-[#DDDDDD]">
                <p className="text-[#484848] font-medium">No bookings match your current filters.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <PaginationWrapper
                  data={displayList}
                  itemsPerPage={5}
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

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden transition-all ${
        isCancelled
          ? "opacity-50 border-[#DDDDDD]"
          : "border-[#DDDDDD] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] hover:border-gray-300"
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* row 1: pg name + status */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            <h2 className="text-[17px] font-semibold text-[#222222] truncate leading-tight">
              {b.pg?.name || "PG"}
            </h2>
            <div className="flex items-center gap-1.5 text-[15px] text-[#484848] mt-1">
              <MapPin size={14} className="text-gray-400 shrink-0" />
              <span className="truncate capitalize">{b.pg?.city || "—"}</span>
            </div>
          </div>
          <StatusBadge type="booking" status={b.status} />
        </div>

        {/* row 2: guest info */}
        <div className="flex items-center gap-4 mb-6 bg-[#FFFFFF] border border-[#DDDDDD] rounded-xl px-4 py-3">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
            <StatusBadge type="payment" status={b.paymentStatus} className="!text-[10px]" />
          </div>
        </div>

        {/* row 4: amount + actions */}
        <div className="flex items-center justify-between pt-5 border-t border-[#DDDDDD]">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-[#222222] flex items-center gap-0.5">
              <IndianRupee size={16} strokeWidth={2.5} />
              {b.amount?.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-bold uppercase text-[#717171]">total</span>
          </div>

          {!isCancelled && (
            <div className="flex gap-3">
              {isPending && onConfirm && (
                <button
                  onClick={onConfirm}
                  className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl border border-rose-200 text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors"
                >
                  <CheckCircle2 size={14} /> Confirm
                </button>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl border border-[#DDDDDD] text-[#717171] bg-white hover:bg-slate-50 transition-colors"
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
