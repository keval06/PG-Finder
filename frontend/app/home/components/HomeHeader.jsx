"use client";

import { SlidersHorizontal, MapPin, X } from "lucide-react";
import SortBtn from "../../../components/SortBtn";
import Button from "../../atoms/Button";
import CustomSelect from "../../../components/CustomSelect";

export default function HomeHeader({
  setDrawerOpen,
  filterCount,
  displayCount,
  handleNearMe,
  userLocation,
  isLocationLoading,
  radius,
  setRadius,
  sortField,
  sortOrder,
  toggleSort,
}) {
  const radiusOptions = [
    { value: 5, label: "5 km" },
    { value: 10, label: "10 km" },
    { value: 20, label: "20 km" },
    { value: 30, label: "30 km" },
  ];

  return (
    <div className="flex flex-col gap-3 mb-5">
      {/* Single row: Filters + Count + Near Me + Radius + Sort (wraps on mobile) */}
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm text-[#717171]">
          <span className="font-semibold text-[#222222]">{displayCount}</span>{" "}
          PGs found
        </p>

        <Button
          onClick={handleNearMe}
          variant={userLocation ? "danger" : "outline"}
          icon={userLocation ? X : MapPin}
          loading={isLocationLoading}
          disabled={isLocationLoading}
          className="h-[42px] px-5"
        >
          {isLocationLoading ? "Locating…" : userLocation ? "Clear Map" : "Near Me"}
        </Button>

        {userLocation && (
          <CustomSelect
            value={radius}
            onChange={setRadius}
            options={radiusOptions}
            className="h-[42px] min-w-[110px]"
          />
        )}

        {/* Separator pushes sort to right on desktop */}
        <div className="hidden sm:block flex-1" />

        {/* Sort buttons — inline on desktop, wraps below on mobile */}
        <div className="flex items-center gap-2">
          <SortBtn
            label="Price"
            field="price"
            {...{ sortField, sortOrder, onToggle: toggleSort }}
          />
          <SortBtn
            label="Rating"
            field="rating"
            {...{ sortField, sortOrder, onToggle: toggleSort }}
          />
          <SortBtn
            label="Reviews"
            field="reviews"
            {...{ sortField, sortOrder, onToggle: toggleSort }}
          />
        </div>
      </div>
    </div>
  );
}
