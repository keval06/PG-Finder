import Link from "next/link";
import Image from "next/image";

export default function PGCard({ pg }) {
  return (
    <Link href={`/pg/${pg._id}`} className="w-full max-w-4xl">
      <div className="bg-white rounded-xl shadow-md overflow-hidden w-full flex h-44 hover:shadow-lg transition-shadow">
        <div className="relative w-48 h-full flex-shrink-0">
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

        <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
          <h2 className="text-xl font-semibold truncate">{pg.name}</h2>
          <span className="text-yellow-500 text-sm mt-1">
            {pg.ratingData
              ? `★ ${pg.ratingData.avg}/5 (${pg.ratingData.count} reviews)`
              : "★ No reviews yet"}
          </span>
          <p className="text-gray-700 text-sm mt-1">{pg.city}</p>
          <p className="text-gray-500 text-xs truncate">{pg.address}</p>
        </div>

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
