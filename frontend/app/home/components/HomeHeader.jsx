"use client";

import { SlidersHorizontal, MapPin, X } from "lucide-react";
import SortBtn from "../../../components/SortBtn";
import Button from "../../atoms/Button";

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
  return (
    <div className="flex flex-col gap-3 mb-5">
      {/* Row 1: Filters + Count + Near Me */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={() => setDrawerOpen(true)}
          variant="outline"
          className="lg:hidden"
          icon={SlidersHorizontal}
        >
          Filters
          {filterCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {filterCount}
            </span>
          )}
        </Button>

        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-900">{displayCount}</span>{" "}
          PGs found
        </p>

        <Button
          onClick={handleNearMe}
          variant={userLocation ? "danger" : "outline"}
          icon={userLocation ? X : MapPin}
          loading={isLocationLoading}
          disabled={isLocationLoading}
        >
          {isLocationLoading ? "Locating…" : userLocation ? "Clear Map" : "Near Me"}
        </Button>

        {userLocation && (
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-xl px-2 py-1.5 outline-none shadow-sm cursor-pointer"
          >
            <option value={2}>2 km</option>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={30}>30 km</option>
          </select>
        )}
      </div>

      {/* Row 2: Sort buttons */}
      <div className="flex gap-2 flex-wrap">
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
  );
}
