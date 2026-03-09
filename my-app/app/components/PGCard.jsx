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
    <Link href={`/pg/${pg._id}`} className="w-full max-w-5xl">
      <div className="bg-white rounded-xl shadow-md overflow-hidden flex h-44 hover:shadow-lg transition-shadow">
        {/* IMAGE */}
        <div className="relative w-56 h-full flex-shrink-0">
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

        {/* MAIN CONTENT */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          {/* TITLE + RATING */}
          <div>
            <h2 className="text-xl font-semibold truncate">{pg.name}</h2>

            <span className="text-yellow-500 text-sm">
              {pg.ratingData
                ? `★ ${pg.ratingData.avg}/5 (${pg.ratingData.count} reviews)`
                : "★ No reviews yet"}
            </span>

            <p className="text-gray-700 text-sm mt-1">{pg.city}</p>
            <p className="text-gray-500 text-xs truncate">{pg.address}</p>
          </div>

          {/* ICON ROW */}
          <div className="flex items-center gap-1 capitalize text-base mt-2 text-gray-600">
            <User size={16} />
            {pg.gender}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
            <div className="flex items-center gap-2 capitalize mt-2">
              <Utensils size={16} />
              {pg.food}
            </div>

            {pg.amenities?.map((a) => {
              const Icon = amenityIcons[a];
              return (
                <div key={a} className="flex items-center gap-1">
                  {Icon && <Icon size={16} />}
                  {a}
                </div>
              );
            })}
          </div>
        </div>

        {/* PRICE */}
        <div className="p-4 flex flex-col justify-center items-center gap-2 flex-shrink-0 w-36">
          <p className="text-xl font-bold">
            ₹{pg.price}
            <span className="text-xs font-normal text-gray-500"> /month</span>
          </p>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold w-full">
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
}
