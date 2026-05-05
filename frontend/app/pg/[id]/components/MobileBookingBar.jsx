"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function MobileBookingBar({ pg, checkIn, checkOut }) {
  const { user, ready } = useAuth();
  const router = useRouter();

 const getMonths = () => {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (isNaN(start) || isNaN(end) || end <= start) return 1;

  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // FIX: always round UP (not round)
  return Math.max(1, Math.ceil(diffDays / 30));
};

  const formatDateRange = () => {
    if (!checkIn || !checkOut) return "Add dates";

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = start.toLocaleString("en-US", { month: "short" });
    const endMonth = end.toLocaleString("en-US", { month: "short" });
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    // Same month and year
    if (start.getMonth() === end.getMonth() && startYear === endYear) {
      return `${startDay}-${endDay} ${startMonth}`;
    }

    // Different year
    if (startYear !== endYear) {
      return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
    }

    // Different month, same year
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  };

  const months = getMonths();
  const baseTotal = (pg.price || 0) * months;
  const dateRange = formatDateRange();

  const handleReserve = () => {
    if (!ready) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const params = new URLSearchParams({
      checkIn: checkIn || "",
      checkOut: checkOut || "",
      guests: "1",
    });
    router.push(`/pg/${pg._id}/book?${params.toString()}`);
  };

  // Check if same month
const isSameYear = () => {
  if (!checkIn || !checkOut) return true;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return start.getFullYear() === end.getFullYear();
};

  const sameMonth = isSameYear();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_16px_rgba(0,0,0,0.12)] lg:hidden z-50">
      <div className="px-6 py-3.5">
        {sameMonth ? (
          // Layout 1: Same month - Price + Dates left, Reserve button right (full height)
          <div className="flex items-stretch gap-3">
            {/* Left side: Price and dates */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-baseline gap-1">
                <span className="text-[18px] font-semibold text-[#222222]">
                  ₹{baseTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[14px] text-[#222222] mt-0.5">
                <span>
                  {months}{months === 1 ? " month" : ` months`} · {dateRange}
                </span>
              </div>
            </div>

            {/* Right side: Reserve button (full height) */}
            <div className="flex items-center">
              <button
                onClick={handleReserve}
                className="bg-gradient-to-r from-[#E61E4D] to-[#E31C5F] text-white font-semibold px-10 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap h-full flex items-center justify-center min-h-[56px] text-lg"
              >
                Reserve
              </button>
            </div>
          </div>
        ) : (
          // Layout 2: Different month/year - Full width Reserve button
          <div className="space-y-3">
            {/* Top: Price and dates */}
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[18px] font-semibold text-[#222222]">
                  ₹{baseTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="text-[14px] text-[#222222] mt-0.5">
                {months} {months === 1 ? "month" : "months"} · {dateRange}
              </div>
            </div>

            {/* Bottom: Full width Reserve button */}
            <button
              onClick={handleReserve}
              className="w-full bg-gradient-to-r from-[#E61E4D] to-[#E31C5F] text-white text-lg font-semibold py-3.5 rounded-full hover:opacity-90 transition-opacity"
            >
              Reserve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
