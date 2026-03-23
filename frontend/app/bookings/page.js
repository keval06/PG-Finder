"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../../components/StatusBadge";
import ConfirmModal from "../../components/ConfirmModal";
import PaginationWrapper from "../../components/PaginationWrapper";
import { bookingApi } from "../../lib/api/booking";

import {
  MapPin,
  Calendar,
  Users,
  Bed,
  IndianRupee,
  X,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
// ────────────────helpers───────────────────────────────────
function daysLeft(checkOutDate) {
  return Math.ceil(
    (new Date(checkOutDate) - new Date()) / (1000 * 60 * 60 * 24),
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DaysLeftBadge({ days }) {
  if (days > 7)
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
        <Clock size={10} />
        {days}d left
      </span>
    );
  if (days > 0)
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse">
        <Clock size={10} />
        {days}d left
      </span>
    );
  if (days === 0)
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse">
        <Clock size={10} />
        Today
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
      <AlertCircle size={10} />
      Overdue {Math.abs(days)}d
    </span>
  );
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
  const [toast, setToast] = useState(null);

  // ─── auth guard
  useEffect(() => {
    if (!ready) return;
    if (!user) router.push("/auth/login");
  }, [ready, user]);

  // ─── fetch
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const data = await bookingApi.getUserBookings(token);

      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready && user) fetchBookings();
  }, [ready, user, fetchBookings]);

  // ─── toast
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── cancel booking
  const handleCancel = async () => {
    if (!cancelTarget) return;
    setProcessing(true);
    setPopupError("");

    try {
      const token = localStorage.getItem("token");

      const data = await bookingApi.updateStatus(
        cancelTarget._id,
        "cancelled",
        token,
      );

      if (data.message === "Booking status updated successfully") {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === cancelTarget._id ? { ...b, status: "cancelled" } : b,
          ),
        );
        setCancelTarget(null);
        showToast("success", "Booking cancelled successfully.");
      } else {
        setPopupError(data.message || "Something went wrong. Try again.");
      }
    } catch {
      setPopupError("Network error. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  // ─── loading
  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── separate bookings
  const active = bookings.filter((b) => b.status !== "cancelled");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* ── header ── */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => router.push("/home")}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Browse PGs <ChevronRight size={13} />
          </button>
        </div>

        {/* ── toast ── */}
        {toast && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium mb-5 border transition-all animate-[fadeIn_0.2s] ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-600 border-red-100"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={15} />
            ) : (
              <XCircle size={15} />
            )}
            {toast.text}
          </div>
        )}

        {/* ── empty state ── */}
        {bookings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bed size={28} className="text-blue-500" />
            </div>
            <p className="font-semibold text-slate-900 text-lg mb-1">
              No bookings yet
            </p>
            <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
              Find a PG that suits you and book your first room
            </p>
            <button
              onClick={() => router.push("/home")}
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
            >
              Browse PGs <ChevronRight size={15} />
            </button>
          </div>
        ) : (
          <>
            {/* ── active bookings ── */}
            {active.length > 0 && (
              <div className="mb-8">
                <PaginationWrapper
                  data={active}
                  itemsPerPage={5}
                  renderItem={(b) => (
                    <BookingCard
                      key={b._id}
                      booking={b}
                      onCancel={() => {
                        setCancelTarget(b);
                        setPopupError("");
                      }}
                    />
                  )}
                />
              </div>
            )}

            {/* ── cancelled bookings ── */}
            {cancelled.length > 0 && (
              <>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Cancelled ({cancelled.length})
                </p>
                <PaginationWrapper
                  data={cancelled}
                  itemsPerPage={5}
                  renderItem={(b) => <BookingCard key={b._id} booking={b} />}
                />
              </>
            )}
          </>
        )}
      </div>

      {/* ── CANCEL CONFIRMATION POPUP ── */}
      <ConfirmModal
        isOpen={!!cancelTarget}
        title="Cancel Booking?"
        description="This action cannot be undone. Are you sure you want to cancel your booking?"
        confirmText="Yes, Cancel"
        cancelText="Keep Booking"
        processing={processing}
        error={popupError}
        onConfirm={handleCancel}
        onClose={() => {
          setCancelTarget(null);
          setPopupError("");
        }}
        variant="danger"
      />
    </div>
  );
}

// ─── BOOKING CARD ──────────────────────────────────────────────
function BookingCard({ booking: b, onCancel }) {
  const days = daysLeft(b.checkOutDate);

  const isCancelled = b.status === "cancelled";

  return (
    <div
      className={`bg-white border rounded-2xl overflow-hidden transition-all ${
        isCancelled
          ? "opacity-50 border-slate-200"
          : "border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50/60"
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* ── row 1: name + status ── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-slate-900 truncate leading-tight">
              {b.pg?.name || "PG"}
            </h2>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <MapPin size={10} className="flex-shrink-0" />
              <span className="truncate capitalize">{b.pg?.city || "—"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
            {!isCancelled && <DaysLeftBadge days={days} />}
            <StatusBadge type="booking" status={b.status} />
          </div>
        </div>

        {/* ── row 2: details grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          {/* room */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-slate-400 mb-0.5">Room</p>
            <p className="text-xs font-semibold text-slate-800 capitalize flex items-center gap-1">
              <Bed size={11} className="text-blue-500" />
              {b.roomType?.name || "—"}
            </p>
          </div>

          {/* sharing */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-slate-400 mb-0.5">Sharing</p>
            <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
              <Users size={11} className="text-blue-500" />
              {b.roomType?.sharingCount || "—"}-sharing
            </p>
          </div>

          {/* dates */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-slate-400 mb-0.5">Dates</p>
            <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
              <Calendar size={11} className="text-blue-500" />
              {formatDate(b.checkInDate).replace(/ \d{4}$/, "")} →{" "}
              {formatDate(b.checkOutDate).replace(/ \d{4}$/, "")}
            </p>
          </div>

          {/* payment */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-slate-400 mb-0.5">Payment</p>
            <StatusBadge
              type="payment"
              status={b.paymentStatus}
              className="!text-[10px] px-2 py-0.5"
            />
          </div>
        </div>

        {/* ── row 3: price + cancel ── */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-slate-900 flex items-center gap-0.5">
              <IndianRupee size={14} />
              {b.amount?.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-slate-400">total</span>
          </div>

          {!isCancelled && onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-red-200 text-red-500 bg-white hover:bg-red-50 transition-colors"
            >
              <X size={12} /> Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
