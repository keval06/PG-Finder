"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import {
  Check,
  ChevronRight,
  Users,
  Bed,
  IndianRupee,
  Calendar,
  ArrowLeft,
} from "lucide-react";

const STEPS = ["Room", "Dates", "Confirm"];

export default function BookingPage() {
  const { id: pgId } = useParams();
  const router = useRouter();
  const { user, ready } = useAuth();

  const [step, setStep] = useState(0);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // auth guard
  useEffect(() => {
    if (!ready) return;
    if (!user) router.push("/auth/login");
  }, [ready, user]);

  // fetch room types
  useEffect(() => {
    if (!pgId) return;
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/roomtype?pgId=${pgId}`,
        );
        const data = await res.json();
        setRoomTypes(Array.isArray(data) ? data : []);
      } catch {
        setRoomTypes([]);
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, [pgId]);

  // computed
  const today = new Date().toISOString().split("T")[0];

  const months = (() => {
    if (!checkIn || !checkOut) return 0;
    const a = new Date(checkIn);
    const b = new Date(checkOut);
    const days = Math.ceil((b - a) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 0;
    // round up — any partial month = full month charged
    return Math.ceil(days / 30);
  })();

  const totalAmount = selectedRoom ? selectedRoom.price * months : 0;

  // validation
  const step1Valid = !!selectedRoom;
  const step2Valid =
    checkIn && checkOut && checkIn >= today && checkOut > checkIn && months > 0;

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/booking`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pg: pgId,
            roomType: selectedRoom._id,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            amount: totalAmount,
          }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Booking failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // loading state
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // success screen
  if (success) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-sm w-full text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-full flex items-center justify-center">
            <Check size={28} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Booking Confirmed!
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Your bed has been reserved successfully.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 w-full text-left flex flex-col gap-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Room</span>
              <span className="font-medium capitalize text-slate-900">
                {selectedRoom.name} · {selectedRoom.sharingCount}-sharing
              </span>
            </div>
            <div className="flex justify-between">
              <span>Check-in</span>
              <span className="font-medium text-slate-900">{checkIn}</span>
            </div>
            <div className="flex justify-between">
              <span>Check-out</span>
              <span className="font-medium text-slate-900">{checkOut}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 mt-1">
              <span className="font-medium">Total</span>
              <span className="font-bold text-slate-900">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <button
            onClick={() => router.push("/bookings")}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            View My Bookings
          </button>
          <button
            onClick={() => router.push(`/pg/${pgId}`)}
            className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Back to PG
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* back */}
        <button
          onClick={() => router.push(`/pg/${pgId}`)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to PG
        </button>

        {/* stepper */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step
                      ? "bg-green-500 text-white"
                      : i === step
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i < step ? <Check size={13} /> : i + 1}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    i === step ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px bg-slate-200 mx-2" />
              )}
            </div>
          ))}
        </div>

        {/* card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {/* STEP 1 — Room Selection */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                Select Room Type
              </h2>
              <p className="text-sm text-slate-400 mb-5">
                Choose the room that suits you
              </p>

              {loadingRooms ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : roomTypes.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No room types available for this PG.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {roomTypes.map((rt) => {
                    const full = rt.remainingBeds === 0;
                    const selected = selectedRoom?._id === rt._id;
                    return (
                      <button
                        key={rt._id}
                        disabled={full}
                        onClick={() => setSelectedRoom(rt)}
                        className={`w-full text-left border rounded-xl p-4 transition-all ${
                          full
                            ? "opacity-40 cursor-not-allowed border-slate-100 bg-slate-50"
                            : selected
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                              : "border-slate-200 hover:border-blue-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold capitalize text-slate-900">
                            {rt.name}
                          </span>
                          {full ? (
                            <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full">
                              Full
                            </span>
                          ) : (
                            selected && (
                              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                <Check size={11} className="text-white" />
                              </div>
                            )
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users size={11} /> {rt.sharingCount}-sharing
                          </span>
                          <span className="flex items-center gap-1">
                            <Bed size={11} /> {rt.remainingBeds} beds left
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-900 ml-auto">
                            <IndianRupee size={11} />
                            {rt.price?.toLocaleString("en-IN")}/mo
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — Dates */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                Select Dates
              </h2>
              <p className="text-sm text-slate-400 mb-5">
                Pick your check-in and check-out
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                    Check-in Date
                  </label>
                  <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                    <Calendar
                      size={15}
                      className="absolute left-3 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="date"
                      min={today}
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        if (checkOut && e.target.value >= checkOut)
                          setCheckOut("");
                      }}
                      className="w-full bg-transparent pl-9 pr-4 py-2.5 text-sm outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                    Check-out Date
                  </label>
                  <div className="relative flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                    <Calendar
                      size={15}
                      className="absolute left-3 text-slate-400 pointer-events-none"
                    />
                    <input
                      type="date"
                      min={checkIn || today}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-transparent pl-9 pr-4 py-2.5 text-sm outline-none text-slate-900"
                    />
                  </div>
                </div>

                {/* summary */}
                {months > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col gap-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Duration</span>
                      <span className="font-medium text-slate-900">
                        {months} month{months > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>
                        ₹{selectedRoom?.price?.toLocaleString("en-IN")} ×{" "}
                        {months}
                      </span>
                      <span className="font-bold text-slate-900">
                        ₹{totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 — Confirm */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                Confirm Booking
              </h2>
              <p className="text-sm text-slate-400 mb-5">
                Review your details before submitting
              </p>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-3 text-sm text-slate-600 mb-5">
                <div className="flex justify-between">
                  <span>Room type</span>
                  <span className="font-medium capitalize text-slate-900">
                    {selectedRoom?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sharing</span>
                  <span className="font-medium text-slate-900">
                    {selectedRoom?.sharingCount}-sharing
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Check-in</span>
                  <span className="font-medium text-slate-900">{checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out</span>
                  <span className="font-medium text-slate-900">{checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="font-medium text-slate-900">
                    {months} months
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 mt-1">
                  <span className="font-semibold text-slate-900">
                    Total Amount
                  </span>
                  <span className="font-bold text-lg text-slate-900">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* nav buttons */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button
                onClick={() => {
                  setStep((s) => s - 1);
                  setError("");
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
            )}
            {step < 2 ? (
              <button
                disabled={step === 0 ? !step1Valid : !step2Valid}
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Booking…" : "Confirm Booking"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
