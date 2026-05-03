"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_OPTIONS = [
  { value: 1, label: "1 month" },
  { value: 2, label: "2 months" },
  { value: 3, label: "3 months" },
];

// Add N × 30-day cycles. Check-in is day 1, so checkout = checkIn + (N*30 - 1) days
const addMonths = (dateStr, months) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + (months * 30 - 1));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};
export default function CalendarPopover({
  checkIn,
  checkOut,
  setCheckIn,
  setCheckOut,
  onClose,
}) {
  const [viewDate, setViewDate] = useState(new Date());
  const [months, setMonths] = useState(() => {
    // Initialize months from existing checkIn/checkOut if present
    if (checkIn && checkOut) {
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      const diff =
        (outDate.getFullYear() - inDate.getFullYear()) * 12 +
        (outDate.getMonth() - inDate.getMonth());
      return [1, 2, 3, 6, 12].includes(diff) ? diff : 1;
    }
    return 1;
  });
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Auto-update checkOut whenever checkIn or months change
  useEffect(() => {
    if (checkIn) {
      setCheckOut(addMonths(checkIn, months));
    }
  }, [checkIn, months, setCheckOut]);

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthName = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const current = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      const isCheckIn = dateStr === checkIn;
      const isCheckOut = dateStr === checkOut;
      const isInRange =
        checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;
      const isPast = current < new Date().setHours(0, 0, 0, 0);

      days.push(
        <div
          key={d}
          onClick={() => {
            if (isPast) return;
            setCheckIn(dateStr);
            // checkOut updates via useEffect
          }}
          className="relative h-9 w-9 flex items-center justify-center group"
        >
          {isInRange && <div className="absolute inset-0 bg-rose-50 z-0" />}
          {isCheckOut && (
            <div className="absolute inset-0 bg-rose-50 z-0 rounded-r-full" />
          )}

          <div
            className={`
              h-9 w-9 flex items-center justify-center text-[14px] cursor-pointer transition-all relative z-10 font-semibold rounded-full
              ${isCheckIn ? "bg-[#222222] text-white !font-bold" : ""}
              ${isCheckOut ? "border-2 border-[#222222] text-[#222222]" : ""}
              ${isPast ? "text-[#DDDDDD] cursor-not-allowed font-normal" : ""}
              ${
                !isCheckIn && !isCheckOut && !isPast
                  ? "text-[#222222] hover:border hover:border-[#222222]"
                  : ""
              }
            `}
          >
            {d}
          </div>
        </div>
      );
    }

    return (
      <div className="w-[260px]">
        <h4 className="text-center text-[15px] font-semibold text-[#222222] mb-5">
          {monthName}
        </h4>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="text-[10px] font-bold uppercase text-[#717171] mb-2"
            >
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  const nextMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    1
  );

  return (
    <div
      ref={popoverRef}
      className="absolute top-[calc(100%+8px)] right-[-10px] lg:right-0 bg-white border border-[#DDDDDD] rounded-2xl shadow-[0_8px_28px_rgba(0,0,0,0.15)] p-6 z-[100] min-w-[580px]"
    >
      {/* Stay duration selector — KEY UX */}
      <div className="mb-5 pb-4 border-b border-[#F7F7F7]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#717171]">
            Stay duration
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {MONTH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMonths(opt.value)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all
                  ${
                    months === opt.value
                      ? "bg-[#222222] text-white"
                      : "bg-white border border-[#DDDDDD] text-[#222222] hover:border-[#222222]"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div
        className="flex justify-between items-center absolute w-full left-0 px-6 pointer-events-none"
        style={{ top: "94px" }}
      >
        <button
          onClick={() =>
            setViewDate(
              new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
            )
          }
          className="p-2 hover:bg-gray-50 rounded-full transition-colors pointer-events-auto"
        >
          <ChevronLeft size={16} className="text-[#222222]" />
        </button>
        <button
          onClick={() =>
            setViewDate(
              new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
            )
          }
          className="p-2 hover:bg-gray-50 rounded-full transition-colors pointer-events-auto"
        >
          <ChevronRight size={16} className="text-[#222222]" />
        </button>
      </div>

      <div className="flex gap-8 justify-center">
        {renderMonth(viewDate)}
        {renderMonth(nextMonth)}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-[#F7F7F7] flex justify-between items-center gap-4">
        <div className="text-[13px] text-[#717171]">
          {checkIn && checkOut ? (
            <>
              <span className="font-semibold text-[#222222]">
                {checkIn &&
                  new Date(checkIn).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
              </span>
              {" → "}
              <span className="font-semibold text-[#222222]">
                {checkOut &&
                  new Date(checkOut).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
              </span>
              <span className="ml-2 text-[#FF385C] font-semibold">
                ({months} {months === 1 ? "month" : "months"})
              </span>
            </>
          ) : (
            <span>Pick a check-in date</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCheckIn("");
              setCheckOut("");
              setMonths(1);
            }}
            className="text-[10px] font-bold uppercase underline text-[#222222] px-2 py-1 rounded hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            disabled={!checkIn}
            className="bg-[#222222] text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
