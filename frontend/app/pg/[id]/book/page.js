"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
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
import StepperBar from "./components/StepperBar";
import RoomCard from "./components/RoomCard";
import BackButton from "../../../../components/BackButton";
import CalendarPopover from "../components/CalendarPopover";
import { roomTypeApi } from "../../../../lib/api/roomType";
import { bookingApi } from "../../../../lib/api/booking";

const STEPS = ["Room", "Dates", "Confirm"];

export default function BookingPage() {
  const { id: pgId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, ready } = useAuth();

  const [step, setStep] = useState(0);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
  const [showCalendar, setShowCalendar] = useState(false);
  const [guests, setGuests] = useState(Number(searchParams.get("guests")) || 1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // auth guard
  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/auth/login");
  }, [ready, user]);

  // fetch room types
  useEffect(() => {
    if (!pgId) return;
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const data = await roomTypeApi.getByPgId(pgId);
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
    if(b <= a) return 0;

    const days = Math.ceil((b - a) / (1000 * 60 * 60 * 24)) +1;
    if (days <= 0) return 0;
    // round up — any partial month = full month charged
    return Math.ceil(days / 30);
  })();

  const totalAmount = selectedRoom ? selectedRoom.price * months : 0;

  // validation
  const step1Valid = !!selectedRoom;
  const step2Valid =
    checkIn && checkOut && checkIn >= today && checkOut > checkIn && months > 0;

  // new
  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    let bookingId = null;

    try {
      const token = localStorage.getItem("token");

      // Step 1: Create booking record (status: pending)
      const booking = await bookingApi.create({
        pg: pgId,
        roomType: selectedRoom._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        amount: totalAmount,
      }, token);

      if (!booking._id) {
        setError(booking.message || "Booking failed. Please try again.");
        setSubmitting(false);
        return;
      }
      bookingId = booking._id;

      // Step 2: Create Razorpay order
      const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
      });
      const order = await orderRes.json();

      if (!orderRes.ok) {
        setError(order.message || "Payment initiation failed.");
        setSubmitting(false);
        return;
      }

      // Step 3: Open Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: "QuickPG",
        description: `Booking for ${selectedRoom.name}`,

        // new
        handler: async function (response) {
          setSubmitting(true);
          try {
            const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setSuccess(true);
            } else {
              // Payment went through but verify failed — booking likely confirmed by webhook
              // Redirect to bookings page instead of showing error
              router.push("/bookings");
            }
          } catch {
            router.push("/bookings");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: async function () {
            // User cancelled — mark booking as cancelled
            await bookingApi.updateStatus(bookingId, "cancelled", token);
            setError("Payment cancelled. Your booking has been cancelled.");
            setSubmitting(false);
          },
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#FF385C" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setSubmitting(false);

    } catch (err) {
      // If booking was created but payment failed, cancel it
      if (bookingId) {
        const token = localStorage.getItem("token");
        await bookingApi.updateStatus(bookingId, "cancelled", token);
      }
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  // loading state
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
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
            className="w-full bg-[#FF385C] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E31C5F] transition-colors"
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
    <div className="min-h-screen bg-white px-4 pt-20 sm:pt-24 pb-24 sm:pb-8">
      <div className="max-w-lg mx-auto">
        {/* back */}
        <BackButton className="mb-4 sm:mb-6" />

        {/* stepper */}
        <StepperBar steps={STEPS} currentStep={step} />

        {/* card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {/* STEP 1 — Room Selection */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                Select Room Type
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Choose the room that suits you
              </p>

              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                {loadingRooms ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-slate-100 animate-pulse rounded-xl"
                      />
                    ))}
                  </div>
                ) : roomTypes.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                    No active rooms available in this PG.
                  </div>
                ) : (
                  roomTypes.map((rt) => (
                    <RoomCard
                      key={rt._id}
                      room={rt}
                      selected={selectedRoom?._id === rt._id}
                      onSelect={setSelectedRoom}
                    />
                  ))
                )}
              </div>
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

              <div className="flex flex-col gap-4 relative">
                {/* Premium Date Selector */}
                <div 
                  onClick={() => setShowCalendar(true)}
                  className="border border-[#DDDDDD] rounded-xl cursor-pointer overflow-hidden shadow-sm transition-colors"
                >
                  <div className="grid grid-cols-2 divide-x divide-[#DDDDDD]">
                    <div className="p-3 hover:bg-gray-50 transition-colors">
                      <label className="block text-[10px] font-bold uppercase text-[#222222]">Check-In</label>
                      <div className="text-sm text-[#484848] mt-0.5 min-h-[20px]">
                        {checkIn || <span className="text-[#717171]">Add date</span>}
                      </div>
                    </div>
                    <div className="p-3 hover:bg-gray-50 transition-colors">
                      <label className="block text-[10px] font-bold uppercase text-[#222222]">Checkout</label>
                      <div className="text-sm text-[#484848] mt-0.5 min-h-[20px]">
                        {checkOut || <span className="text-[#717171]">Add date</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calendar Popover */}
                {showCalendar && (
                  <div className="absolute top-0 left-0 w-full z-[100]">
                    <CalendarPopover 
                      checkIn={checkIn}
                      checkOut={checkOut}
                      setCheckIn={setCheckIn}
                      setCheckOut={setCheckOut}
                      onClose={() => setShowCalendar(false)}
                    />
                  </div>
                )}

                {/* summary */}
                {months > 0 && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex flex-col gap-2 text-sm">
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

          {/* nav buttons — inside card on desktop, sticky on mobile */}
          <div className="hidden sm:flex gap-3 mt-6">
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
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FF385C] text-white text-sm font-semibold hover:bg-[#E31C5F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={15} />
              </button>
            ) : (
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl bg-[#FF385C] text-white text-sm font-semibold hover:bg-[#E31C5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Booking…" : "Confirm Booking"}
              </button>
            )}
          </div>
        </div>

        {/* mobile sticky bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 z-40 flex gap-3">
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
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FF385C] text-white text-sm font-semibold hover:bg-[#E31C5F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-rose-500/20"
            >
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button
              disabled={submitting}
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-xl bg-[#FF385C] text-white text-sm font-semibold hover:bg-[#E31C5F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-rose-500/20"
            >
              {submitting ? "Booking…" : "Confirm Booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
