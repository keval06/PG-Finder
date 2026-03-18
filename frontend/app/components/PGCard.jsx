import Link from "next/link";

// function BookBtn({ id }) {
//   const router = useRouter();
//   return (
//     <button
//       onClick={e => { e.preventDefault(); e.stopPropagation(); router.push(`/pg/${id}#booking`); }}
//       className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors"
//     >
//       Book Now
//     </button>
//   );
// }

import Image from "next/image";
import {
  Wifi, Car, Snowflake, Tv, Camera, Dumbbell,
  Book, Trees, Refrigerator, WashingMachine,
  ArrowUpDown, Utensils, User, Star, MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import BookNowButton from "./BookNowButton";

const amenityIcons = {
  WiFi: Wifi, Parking: Car, AC: Snowflake, Laundry: WashingMachine,
  Lift: ArrowUpDown, CCTV: Camera, RO: Refrigerator, TV: Tv,
  Refrigerator: Refrigerator, Gym: Dumbbell, Garden: Trees, Library: Book,
};

// const genderBadge = {
//   male:   "bg-blue-50 text-blue-700 border-blue-100",
//   female: "bg-pink-50 text-pink-700 border-pink-100",
//   mix:    "bg-violet-50 text-violet-700 border-violet-100",
// };
const genderLabel = { male: "Male",      female: "Female",    mix: "Co-ed"    };
const foodLabel   = { "with food": "Food incl.", "without food": "No food", flexible: "Flexible" };

export default function PGCard({ pg }) {
  const avg   = pg.ratingData?.avg ? parseFloat(pg.ratingData.avg).toFixed(1) : null;
  const count = pg.ratingData?.count || 0;
  const shown = (pg.amenities || []).slice(0, 5);
  const extra = (pg.amenities?.length || 0) - 5;

  return (
    <Link href={`/pg/${pg._id}`} className="block group">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row transition-all duration-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-50/50">

        {/* ── IMAGE ── */}
        <div className="relative w-full sm:w-52 h-48 sm:h-auto flex-shrink-0">
          <Image
            src={pg.image || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=75"}
            alt={pg.name} fill className="object-cover"
            sizes="(max-width: 640px) 100vw, 208px"
          />
          {/* gender badge */}
          {/* <div className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-sm ${genderBadge[pg.gender] || "bg-white/80 text-slate-600 border-slate-200"}`}>
            {genderLabel[pg.gender] || pg.gender}
          </div> */}
        </div>

        {/* ── CONTENT ── */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
          <div>

            {/* title */}
            <h2 className="text-xl font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors mb-1">
              {pg.name}
            </h2>

            {/* RATING — always shown, fix 1 */}
            <div className="flex items-center gap-1.5 mb-2">
              {avg ? (
                <span className="text-yellow-500">★ {avg}/5
                  <span className="text-slate-400 font-normal ml-1">({count} {count === 1 ? "review" : "reviews"})</span>
                </span>
              ) : (
                <span className="text-slate-400 text-xs">★ No reviews yet</span>
              )}
            </div>

            {/* location */}
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
              <MapPin size={11} className="flex-shrink-0" />
              <span className="truncate">{pg.address ? `${pg.address}, ` : ""}{pg.city}</span>
            </div>

            {/* gender + food chips */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
                <User size={10} /> {genderLabel[pg.gender] || pg.gender}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
                <Utensils size={10} /> {foodLabel[pg.food] || pg.food}
              </span>
            </div>

            {/* AMENITY CHIPS — fix 4: chip style, no blue icon color */}
            <div className="flex items-center gap-2 flex-wrap">
              {shown.map(a => {
                const Icon = amenityIcons[a];// Look up the icon for this amenity name
                return (
                  <div key={a} className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
                    {Icon && <Icon size={11} className="text-slate-400" />}
                    {a}
                  </div>
                );
              })}
              {extra > 0 && (
                <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
                  +{extra} more
                </span>
              )}
            </div>

          </div>
        </div>

        {/* ── PRICE + BOOK ── */}
        <div className="flex sm:flex-col items-center sm:items-stretch justify-between sm:justify-center gap-3 px-4 sm:px-5 pb-4 sm:py-5 sm:border-l border-slate-100 sm:w-36 flex-shrink-0">
          <div className="sm:text-center">
            <p className="text-xl font-bold text-slate-900 leading-none">
              ₹{pg.price?.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">/month</p>
          </div>
           {/* <BookBtn id={pg._id} /> */}
           <BookNowButton pgId={pg._id} />
        </div>

      </div>
    </Link>
  );
}