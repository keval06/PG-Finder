"use client";

import { useRouter } from "next/navigation";
import { MapPin, ChevronRight } from "lucide-react";
import Image from "next/image";

const genderLabel = { male: "Male", female: "Female", mix: "Co-ed" };

export default function ListingCard({ pg }) {
  const router = useRouter();
  const inactive = pg.isActive === false;
  const avg   = pg.ratingData?.avg ? `★ ${pg.ratingData.avg}/5` : "★ No reviews";
  const count = pg.ratingData?.count || 0;

  return (
    <div
      onClick={() => router.push(`/my-listings/${pg._id}`)}
      className={`bg-white border rounded-2xl overflow-hidden transition-all cursor-pointer flex flex-col sm:flex-row hover:border-blue-300 hover:shadow-md hover:shadow-blue-50/50 ${
        inactive ? "border-slate-200 opacity-60" : "border-slate-200"
      }`}
    >
      {/* image placeholder */}
      <div className="relative w-full sm:w-44 h-36 sm:h-auto flex-shrink-0 bg-slate-100 flex items-center justify-center">
        {pg.image ? (
          <Image src={pg.image} alt={pg.name} fill className="object-cover" sizes="176px" />
        ) : (
          <span className="text-3xl">🏠</span>
        )}
        {inactive && (
          <span className="absolute top-2 left-2 text-[10px] bg-slate-700/80 text-white font-semibold px-2 py-0.5 rounded-full">
            Inactive
          </span>
        )}
      </div>

      {/* content */}
      <div className="flex-1 p-4 sm:p-5 min-w-0 flex flex-col justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 truncate mb-0.5">{pg.name}</h2>
          <p className="text-xs text-yellow-500 mb-1">
            {avg}
            {count > 0 && <span className="text-slate-400 font-normal ml-1">({count} reviews)</span>}
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
            <MapPin size={10} />
            <span className="truncate">{pg.address}, {pg.city}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600">
              {genderLabel[pg.gender]}
            </span>
            <span className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 capitalize">
              {pg.food}
            </span>
            {(pg.amenities || []).slice(0, 3).map(a => (
              <span key={a} className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600">{a}</span>
            ))}
            {(pg.amenities?.length || 0) > 3 && (
              <span className="text-xs text-slate-400">+{pg.amenities.length - 3} more</span>
            )}
          </div>
        </div>
      </div>

      {/* price + arrow */}
      <div className="flex sm:flex-col items-center sm:items-stretch justify-between sm:justify-center gap-2 px-4 sm:px-5 pb-4 sm:py-5 sm:border-l border-slate-100 sm:w-36 flex-shrink-0">
        <div className="sm:text-center">
          <p className="text-xl font-bold text-slate-900 leading-none">₹{pg.price?.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">/month</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold sm:justify-center">
          Manage <ChevronRight size={13} />
        </div>
      </div>
    </div>
  );
}