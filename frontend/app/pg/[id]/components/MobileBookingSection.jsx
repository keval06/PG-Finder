"use client";

import { useEffect, useState } from "react";
import MobileBookingBar from "./MobileBookingBar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CalendarPopover from "./CalendarPopover";

const MONTH_OPTIONS = [
  { value: 1, label: "1 month" },
  { value: 2, label: "2 months" },
  { value: 3, label: "3 months" },
];

const addMonths = (dateStr, months) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + (months * 30 - 1));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function MobileBookingSection({ pg }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [months, setMonths] = useState(1);


  // Auto-update checkOut whenever checkIn or months change
  useEffect(() => {
    if (checkIn) {
      setCheckOut(addMonths(checkIn, months));
    }
  }, [checkIn, months]);

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  return (
    <>
      <div className="py-8 border-b border-gray-200">
        <h2 className="text-[22px] font-semibold mb-6">Select dates</h2>

        <CalendarPopover
          inline={true} // 👈 KEY FIX
          checkIn={checkIn}
          checkOut={checkOut}
          setCheckIn={setCheckIn}
          setCheckOut={setCheckOut}
          onClose={() => {}}
        />
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <MobileBookingBar pg={pg} checkIn={checkIn} checkOut={checkOut} />
    </>
  );
}
