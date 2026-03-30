"use client";

import { useRouter } from "next/navigation";
import { MapPin, ChevronRight } from "lucide-react";
import Image from "next/image";
import Badge from "../../atoms/Badge";
  
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
      <div className="relative w-full sm:w-44 h-36 sm:h-auto flex-shrink-0 bg-slate-100 flex items-center justify-center font-bold">
        {pg.image ? (
          <Image src={pg.image} alt={pg.name} fill className="object-cover" sizes="176px" />
        ) : (
          <span className="text-3xl">🏠</span>
        )}
        {inactive && (
          <Badge variant="red" className="absolute top-2 left-2 shadow-sm">
            Inactive
          </Badge>
        )}
      </div>

      {/* content */}
      <div className="flex-1 p-4 sm:p-5 min-w-0 flex flex-col justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 truncate mb-0.5">{pg.name}</h2>
          <p className="text-xs text-yellow-600 font-medium mb-1">
            {avg}
            {count > 0 && <span className="text-slate-400 font-normal ml-1">({count} reviews)</span>}
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
            <MapPin size={10} />
            <span className="truncate">{pg.address}, {pg.city}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="blue" className="normal-case">
              {genderLabel[pg.gender]}
            </Badge>
            <Badge variant="slate" className="normal-case font-medium">
              {pg.food}
            </Badge>
            {(pg.amenities || []).slice(0, 3).map(a => (
              <Badge key={a} variant="slate" className="normal-case font-normal border-slate-100">
                {a}
              </Badge>
            ))}
            {(pg.amenities?.length || 0) > 3 && (
              <span className="text-[10px] text-slate-400 font-medium">+{pg.amenities.length - 3} more</span>
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