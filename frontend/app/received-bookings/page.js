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
  Phone,
  CheckCircle2,
  XCircle,
  ChevronRight,
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
    if (!user) router.push("/auth/login");
  }, [ready, user]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const data = await bookingApi.getOwnerBookings(token);

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
        token
      );

      if (data.message === "Booking status updated successfully") {
        setBookings((prev) =>
          prev.map((b) =>
            b._id === actionTarget.booking._id
              ? { ...b, status: actionTarget.newStatus }
              : b
          )
        );
        setActionTarget(null);
        showToast("success", `Booking ${actionTarget.newStatus}.`);
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
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pending = bookings.filter((b) => b.status === "pending");
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Received Bookings
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} across
              your PGs
            </p>
          </div>
          <button
            onClick={() => router.push("/my-listings")}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors"
          >
            My Listings <ChevronRight size={13} />
          </button>
        </div>

        {/* toast */}
        {toast && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium mb-5 border ${
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

        {/* empty */}
        {bookings.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bed size={28} className="text-blue-500" />
            </div>
            <p className="font-semibold text-slate-900 text-lg mb-1">
              No bookings yet
            </p>
            <p className="text-sm text-slate-400">
              Bookings for your PGs will appear here
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {pending.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">
                  Pending ({pending.length})
                </p>
                <PaginationWrapper
                  data={pending}
                  itemsPerPage={5}
                  renderItem={(b) => (
                    <ReceivedCard
                      key={b._id}
                      booking={b}
                      onConfirm={() =>
                        setActionTarget({ booking: b, newStatus: "confirmed" })
                      }
                      onCancel={() =>
                        setActionTarget({ booking: b, newStatus: "cancelled" })
                      }
                    />
                  )}
                />
              </section>
            )}

            {confirmed.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3">
                  Confirmed ({confirmed.length})
                </p>
                <PaginationWrapper
                  data={confirmed}
                  itemsPerPage={5}
                  renderItem={(b) => (
                    <ReceivedCard
                      key={b._id}
                      booking={b}
                      onCancel={() =>
                        setActionTarget({ booking: b, newStatus: "cancelled" })
                      }
                    />
                  )}
                />
              </section>
            )}

            {cancelled.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Cancelled ({cancelled.length})
                </p>
                <PaginationWrapper
                  data={cancelled}
                  itemsPerPage={5}
                  renderItem={(b) => <ReceivedCard key={b._id} booking={b} />}
                />
              </section>
            )}
          </div>
        )}
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
    </div>
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
          ? "opacity-50 border-slate-200"
          : "border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50/60"
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* row 1: pg name + status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-slate-900 truncate">
              {b.pg?.name || "PG"}
            </h2>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <MapPin size={10} />
              <span className="truncate capitalize">{b.pg?.city || "—"}</span>
            </div>
          </div>
          <StatusBadge type="booking" status={b.status} />
        </div>

        {/* row 2: guest info */}
        <div className="flex items-center gap-2 mb-3 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
            {b.user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {b.user?.name || "—"}
            </p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Phone size={9} /> {b.user?.mobile || "—"}
            </p>
          </div>
        </div>

        {/* row 3: details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-slate-400 mb-0.5">Room</p>
            <p className="text-xs font-semibold text-slate-800 capitalize flex items-center gap-1">
              <Bed size={11} className="text-blue-500" />
              {b.roomType?.name || "—"}
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-slate-400 mb-0.5">Sharing</p>
            <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
              <Users size={11} className="text-blue-500" />
              {b.roomType?.sharingCount || "—"}-sharing
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-slate-400 mb-0.5">Dates</p>
            <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
              <Calendar size={11} className="text-blue-500" />
              {formatDate(b.checkInDate).replace(/ \d{4}$/, "")} →{" "}
              {formatDate(b.checkOutDate).replace(/ \d{4}$/, "")}
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-slate-400 mb-0.5">Payment</p>
            <StatusBadge type="payment" status={b.paymentStatus} />
          </div>
        </div>

        {/* row 4: amount + actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-slate-900 flex items-center gap-0.5">
              <IndianRupee size={14} />
              {b.amount?.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-slate-400">total</span>
          </div>

          {!isCancelled && (
            <div className="flex gap-2">
              {isPending && onConfirm && (
                <button
                  onClick={onConfirm}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-emerald-200 text-emerald-600 bg-white hover:bg-emerald-50 transition-colors"
                >
                  <CheckCircle2 size={12} /> Confirm
                </button>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl border border-red-200 text-red-500 bg-white hover:bg-red-50 transition-colors"
                >
                  <XCircle size={12} /> Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
