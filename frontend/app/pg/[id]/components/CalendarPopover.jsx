"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPopover({ 
  checkIn, 
  checkOut, 
  setCheckIn, 
  setCheckOut, 
  onClose 
}) {
  const [viewDate, setViewDate] = useState(new Date());
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

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const monthName = date.toLocaleString("default", { month: "long", year: "numeric" });
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const current = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isSelected = dateStr === checkIn || dateStr === checkOut;
      const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;
      const isPast = current < new Date().setHours(0, 0, 0, 0);

      days.push(
        <div
          key={d}
          onClick={() => {
            if (isPast) return;
            if (!checkIn || (checkIn && checkOut)) {
              setCheckIn(dateStr);
              setCheckOut("");
            } else if (dateStr < checkIn) {
              setCheckIn(dateStr);
            } else {
              setCheckOut(dateStr);
              onClose();
            }
          }}
          className="relative h-9 w-9 flex items-center justify-center group"
        >
          {/* Range Background (Square) */}
          {isInRange && <div className="absolute inset-0 bg-[#F7F7F7] z-0" />}
          
          {/* Day Circle/Ring */}
          <div
            className={`
              h-9 w-9 flex items-center justify-center text-[14px] cursor-pointer transition-all relative z-10 font-semibold rounded-full
              ${isSelected ? "bg-[#222222] text-white !font-bold" : ""}
              ${isPast ? "text-[#DDDDDD] cursor-not-allowed font-normal" : "hover:border hover:border-[#222222]"}
              ${!isSelected && !isPast ? "text-[#222222]" : ""}
            `}
          >
            {d}
          </div>
        </div>
      );
    }

    return (
      <div className="w-[260px]">
        <h4 className="text-center text-[15px] font-semibold text-[#222222] mb-5">{monthName}</h4>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
            <div key={day} className="text-[10px] font-bold uppercase text-[#717171] mb-2">{day}</div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);

  return (
    <div 
      ref={popoverRef}
      className="absolute top-[calc(100%+8px)] right-[-10px] lg:right-0 bg-white border border-[#DDDDDD] rounded-2xl shadow-[0_8px_28px_rgba(0,0,0,0.15)] p-6 z-[100] min-w-[580px]"
    >
      <div className="flex justify-between items-center absolute w-full left-0 px-6 pointer-events-none" style={{ top: '22px' }}>
        <button 
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="p-2 hover:bg-gray-50 rounded-full transition-colors pointer-events-auto"
        >
          <ChevronLeft size={16} className="text-[#222222]" />
        </button>
        <button 
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="p-2 hover:bg-gray-50 rounded-full transition-colors pointer-events-auto"
        >
          <ChevronRight size={16} className="text-[#222222]" />
        </button>
      </div>

      <div className="flex gap-8 justify-center">
        {renderMonth(viewDate)}
        {renderMonth(nextMonth)}
      </div>

      <div className="mt-6 pt-4 border-t border-[#F7F7F7] flex justify-end items-center gap-4">
        <button 
          onClick={() => { setCheckIn(""); setCheckOut(""); }}
          className="text-[10px] font-bold uppercase underline text-[#222222] px-2 py-1 rounded hover:bg-gray-50 transition-colors"
        >
          Clear dates
        </button>
        <button 
          onClick={onClose}
          className="bg-[#222222] text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase hover:opacity-90 transition-opacity"
        >
          Close
        </button>
      </div>
    </div>
  );
}
