import Link from "next/link";
import Image from "next/image";
import {
  Wifi,
  Car,
  Snowflake,
  Tv,
  Camera,
  Dumbbell,
  Book,
  Trees,
  Refrigerator,
  WashingMachine,
  ArrowUpDown,
  User,
  Utensils,
} from "lucide-react";

const amenityIcons = {
  Parking: Car,
  WiFi: Wifi,
  AC: Snowflake,
  Laundry: WashingMachine,
  Lift: ArrowUpDown,
  CCTV: Camera,
  RO: Refrigerator,
  TV: Tv,
  Refrigerator: Refrigerator,
  Gym: Dumbbell,
  Garden: Trees,
  Library: Book,
};

export default function PGCard({ pg }) {
  return (
    <Link href={`/pg/${pg._id}`} className="w-full block">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row">
        {/* IMAGE — full width + fixed height on mobile, sidebar on sm+ */}
        <div className="relative w-full h-48 sm:h-auto sm:w-48 md:w-52 flex-shrink-0">
          <Image
            src={
              pg.image ||
              "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
            }
            alt={pg.name}
            fill
            className="object-cover"
          />
        </div>

        {/* BODY — stacks vertically on mobile, row on sm+ */}
        <div className="flex-1 flex flex-col sm:flex-row min-w-0">
          {/* MAIN CONTENT */}
          <div className="flex-1 px-4 py-3 sm:px-5 sm:py-4 flex flex-col justify-between min-w-0 gap-3">
            {/* Name + rating + location */}
            <div className="flex flex-col gap-1">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {pg.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-sm font-medium">
                  {pg.ratingData ? `★ ${pg.ratingData.avg}/5` : "★ No reviews"}
                </span>
                {pg.ratingData?.count > 0 && (
                  <span className="text-gray-400 text-xs">
                    ({pg.ratingData.count} reviews)
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">{pg.city}</p>
              <p className="text-gray-400 text-xs truncate">{pg.address}</p>
            </div>

            {/* Gender + food */}
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-sm text-gray-600 capitalize">
                <User size={14} className="text-gray-400" />
                {pg.gender}
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1.5 text-sm text-gray-600 capitalize">
                <Utensils size={14} className="text-gray-400" />
                {pg.food}
              </span>
            </div>

            {/* Amenities */}
            {pg.amenities?.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {pg.amenities.map((a) => {
                  const Icon = amenityIcons[a];
                  return (
                    <span
                      key={a}
                      className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1"
                    >
                      {Icon && <Icon size={12} />}
                      {a}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* PRICE + BUTTON
              mobile  → horizontal row at bottom (price left, button right)
              sm+     → vertical column on the right with divider */}
          <div
            className="flex flex-row sm:flex-col justify-between sm:justify-center items-center
            px-4 py-3 sm:px-5 sm:py-4
            border-t border-gray-100 sm:border-t-0 sm:border-l
            sm:w-36 sm:flex-shrink-0 gap-3"
          >
            <div className="text-left sm:text-center">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                ₹{pg.price?.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">/month</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium sm:w-full whitespace-nowrap">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
