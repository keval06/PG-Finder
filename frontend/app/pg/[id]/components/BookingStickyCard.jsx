"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import CalendarPopover from "./CalendarPopover";

export default function BookingStickyCard({ pg, avgRating, reviewCount }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const handleBooking = () => {
    if (!ready) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: "1", // Always 1 for PG booking
    });
    router.push(`/pg/${pg._id}/book?${params.toString()}`);
  };

  return (
    <div className="bg-white border border-[#DDDDDD] rounded-2xl p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)] relative">
      {/* Price and Rating Header */}
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <span className="text-[22px] font-semibold text-[#222222]">₹{pg.price?.toLocaleString("en-IN")}</span>
          <span className="text-base text-[#484848] ml-1 font-normal">/month</span>
        </div>
        <div className="flex items-center gap-1 text-[14px] font-semibold text-[#222222]">
          <Star className="w-3 h-3 text-[#FF385C] fill-[#FF385C]" />
          <span>{avgRating || "New"}</span>
          <span className="text-[#717171] font-normal">· {reviewCount} reviews</span>
        </div>
      </div>

      {/* Selectors Container */}
      <div className="mb-4 relative">
        <div className="border border-[#DDDDDD] rounded-xl cursor-pointer">
          <div className="grid grid-cols-2 border-b border-[#DDDDDD]">
            {/* Check-In Trigger */}
            <div 
              onClick={() => setShowCalendar(true)}
              className="p-3 border-r border-[#DDDDDD] cursor-pointer hover:bg-gray-50 transition-colors rounded-tl-xl"
            >
              <label className="block text-[10px] font-bold uppercase text-[#222222]">Check-In</label>
              <div className="text-sm text-[#484848] mt-0.5 min-h-[20px]">
                {checkIn || <span className="text-[#717171]">Add date</span>}
              </div>
            </div>

            {/* Check-Out Trigger */}
            <div 
              onClick={() => setShowCalendar(true)}
              className="p-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-tr-xl"
            >
              <label className="block text-[10px] font-bold uppercase text-[#222222]">Checkout</label>
              <div className="text-sm text-[#484848] mt-0.5 min-h-[20px]">
                {checkOut || <span className="text-[#717171]">Add date</span>}
              </div>
            </div>
          </div>

          {/* Guests - STATIC */}
          <div className="p-3 bg-white rounded-b-xl border-none">
            <label className="block text-[10px] font-bold uppercase text-[#222222]">Guests</label>
            <div className="text-sm text-[#484848] mt-0.5">
              1 guest
            </div>
          </div>
        </div>

        {/* Premium Calendar Popover */}
        {showCalendar && (
          <CalendarPopover 
            checkIn={checkIn}
            checkOut={checkOut}
            setCheckIn={setCheckIn}
            setCheckOut={setCheckOut}
            onClose={() => setShowCalendar(false)}
          />
        )}
      </div>

      {/* Reserve Button */}
      <button
        onClick={handleBooking}
        className="w-full py-3 rounded-xl text-[18px] font-semibold text-white bg-[#FF385C] hover:bg-[#E31C5F] transition-colors shadow-sm mb-4 active:scale-[0.98]"
      >
        Reserve
      </button>

      <p className="text-center text-sm text-[#717171] mb-6">You won't be charged yet</p>

      {/* Pricing Breakdown */}
      <div className="space-y-4 text-base text-[#222222]">
        <div className="flex justify-between items-center underline decoration-gray-300">
          <span>₹{pg.price?.toLocaleString("en-IN")} x 1 month</span>
          <span>₹{pg.price?.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between items-center underline decoration-gray-300">
          <span>Service fee</span>
          <span>₹0</span>
        </div>
      </div>

      {/* Total Display */}
      <div className="mt-6 pt-6 border-t border-[#DDDDDD] flex justify-between items-center text-[18px] font-bold text-[#222222]">
        <span>Total</span>
        <span>₹{pg.price?.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}
