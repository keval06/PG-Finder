import PGGallery from "../../components/PGGallery";

const amenityIcons = {
  Parking: "🚗",
  WiFi: "📶",
  AC: "❄️",
  Laundry: "🧺",
  Lift: "🛗",
  CCTV: "📷",
  RO: "🚰",
  TV: "📺",
  Refrigerator: "🧊",
  Gym: "🏋️",
  Garden: "🌿",
  Library: "📚",
};

async function getPG(id) {
  const res = await fetch(`http://localhost:5000/api/pg/${id}`, {
    cache: "no-store",
  });
  return await res.json();
}

async function getImages(id) {
  try {
    const res = await fetch(`http://localhost:5000/api/image?pgId=${id}`, {
      cache: "no-store",
    });
    if (res.ok) return await res.json();
    return [];
  } catch {
    return [];
  }
}

async function getReviews(id) {
  try {
    const res = await fetch(`http://localhost:5000/api/review?pg=${id}`, {
      cache: "no-store",
    });
    if (res.ok) return await res.json();
    return [];
  } catch {
    return [];
  }
}

export default async function PGDetails({ params }) {
  const { id } = await params;

  const [pg, images, reviews] = await Promise.all([
    getPG(id),
    getImages(id),
    getReviews(id),
  ]);
  console.log(reviews)

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.star, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <PGGallery images={images} />

      <div className="grid grid-cols-3 gap-10 mt-6">
        {/* LEFT SIDE */}
        <div className="col-span-2 flex flex-col gap-8">
          {/* Name + Rating */}
          <div>
            <h1 className="text-3xl font-semibold capitalize">{pg.name}</h1>
            <p className="text-gray-500 text-sm capitalize mt-1">
              {pg.address}, {pg.city}
            </p>
            {avgRating && (
              <p className="text-yellow-500 mt-1 font-medium">
                ★ {avgRating}/5 ({reviews.length} reviews)
              </p>
            )}
          </div>

          {/* Room Info */}
          <div className="flex gap-8 text-gray-700 capitalize">
            <p>🛏 {pg.room} Rooms</p>
            <p>👤 {pg.gender}</p>
            <p>🍽 {pg.food}</p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Amenities</h2>
            <div className="grid grid-cols-3 gap-4 capitalize">
              {pg.amenities.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-gray-700 text-sm"
                >
                  <span className="text-xl">{amenityIcons[item]}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Policies */}
          <div className="bg-gray-50 rounded-xl p-5 border">
            <h2 className="text-xl font-semibold mb-3">Policies</h2>
            <ul className="text-sm text-gray-600 flex flex-col gap-2">
              <li>🕙 Check-in: 10:00 AM — Check-out: 9:00 AM</li>
              <li>🚭 No smoking inside the premises</li>
              <li>🎉 No parties or loud music after 10 PM</li>
              <li>🐾 Pets not allowed</li>
              <li>👥 Guests allowed till 8 PM only</li>
              <li>💳 1 month security deposit required at check-in</li>
            </ul>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-semibold mb-3">
              Reviews{" "}
              {avgRating && (
                <span className="text-yellow-500 text-base">
                  ★ {avgRating}/5
                </span>
              )}
            </h2>

            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map((r) => (
                  <div 
                  key={r._id} 
                  className="border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium capitalize">
                        {r.user?.name || "Anonymous"}
                      </p>
                      <span className="text-yellow-500 text-sm">
                        {"★".repeat(r.star)}
                        {"☆".repeat(5 - r.star)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE BOOKING CARD */}
        <div className="border rounded-xl p-6 shadow-md h-fit sticky top-24">
          <p className="text-3xl font-bold">₹{pg.price}</p>
          <p className="text-gray-500 text-sm">per month</p>
          <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
