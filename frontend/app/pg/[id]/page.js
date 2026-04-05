import PGGallery from "../../components/PGGallery";
import { pgApi } from "../../../lib/api/pg";
import { imageApi } from "../../../lib/api/image";
import { reviewApi } from "../../../lib/api/review";
import { roomTypeApi } from "../../../lib/api/roomType";
//new map
import PGLocationMapWrapper from "./components/PGLocationMapWrapper";
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
  Bed,
  User,
  Utensils,
  Clock,
  Ban,
  PartyPopper,
  PawPrint,
  Users,
  Toilet,
  CreditCard,
  MapPin,
  Bath,
  BedDouble,
  BedSingle,
} from "lucide-react";
import ReviewsSection from "./components/ReviewsSection";
import BookNowButton from "./components/BookNowButton";
import OwnerEditButton from "./OwnerEditButton";
import BackButton from "./components/BackButton";

// async function getPG(id) {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pg/${id}`, {
//     cache: "no-store",
//   });
//   return await res.json();
// }
async function getPG(id) {
  return await pgApi.getById(id);
}

async function getImages(pgId) {
  return await imageApi.getByPgId(pgId);
}

async function getReviews(pgId) {
  const result = await reviewApi.getByPgId(pgId);
  // reviewApi.getByPgId now returns paginated shape: { reviews, total, ... }
  // unwrap to plain array so avgRating calculation and reviews.length work correctly
  return Array.isArray(result) ? result : result?.reviews ?? [];
}

async function getRoomTypes(pgId) {
  return await roomTypeApi.getByPgId(pgId);
}

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

export default async function PGDetails({ params }) {
  const { id } = await params;

  const [pg, images, reviews, roomTypes] = await Promise.all([
    getPG(id),
    getImages(id),
    getReviews(id),
    getRoomTypes(id),
  ]);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.star, 0) / reviews.length).toFixed(1)
    : null;

  // const bathroomRatio =
  //   pg.bathroom && pg.room
  //     ? pg.bathroom >= pg.room
  //       ? "Attached"
  //       : `Shared (1:${Math.round(pg.room / pg.bathroom)})`
  //     : "—";

  // const toiletRatio =
  //   pg.toilet && pg.room
  //     ? pg.toilet >= pg.room
  //       ? "Attached"
  //       : `Shared (1:${Math.round(pg.room / pg.toilet)})`
  //     : "—";

  const bathroomRatio =
    pg.bathroom && pg.room
      ? `${pg.bathroom} (${
          pg.bathroom >= pg.room
            ? "Attached"
            : `1:${Math.round(pg.room / pg.bathroom)}`
        })`
      : "—";

  const toiletRatio =
    pg.toilet && pg.room
      ? `${pg.toilet} (${
          pg.toilet >= pg.room
            ? "Attached"
            : `1:${Math.round(pg.room / pg.toilet)}`
        })`
      : "—";

  const totalBeds = roomTypes.reduce(
    (s, rt) => s + rt.availableRooms * rt.sharingCount,
    0
  );
  const freeBeds = roomTypes.reduce(
    (s, rt) =>
      s +
      (rt.remainingBeds ??
        rt.availableRooms * rt.sharingCount - (rt.occupiedBeds || 0)),
    0
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* BACK BUTTON */}
        <div className="mb-4">
          <BackButton />
        </div>

        {/* GALLERY */}
        <PGGallery images={images} />

        {/* MAIN GRID — 1 col mobile, 3 col desktop */}
        <div className="mt-6 flex flex-col lg:grid lg:grid-cols-3 lg:gap-10">
          {/* ── LEFT / MAIN CONTENT ── */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Name + location + rating */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h1 className="text-2xl sm:text-3xl font-semibold capitalize">
                {pg.name}
              </h1>
              <div className="flex items-start gap-1.5 mt-1.5 text-gray-500 text-sm">
                <MapPin size={15} className="mt-0.5 flex-shrink-0" />
                <span className="capitalize">
                  {pg.address}, {pg.city}
                </span>
              </div>
              {avgRating && (
                <p className="text-yellow-500 mt-2 font-medium text-sm">
                  ★ {avgRating}/5
                  <span className="text-gray-400 font-normal ml-1">
                    ({reviews.length} reviews)
                  </span>
                </p>
              )}
              <OwnerEditButton pgOwnerId={pg.owner} pgId={id} />
            </div>

            {/* Room details */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Room Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[
                  { icon: Bed, label: "Rooms", value: pg.room },
                  { icon: User, label: "Gender", value: pg.gender },
                  { icon: Utensils, label: "Food", value: pg.food },
                  { icon: Bath, label: "Bathroom", value: bathroomRatio },
                  { icon: Toilet, label: "Toilet", value: toiletRatio },
                  { icon: BedDouble, label: "Total Beds", value: totalBeds },
                  { icon: BedSingle, label: "Free Beds", value: freeBeds },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-4 gap-2 border border-gray-100"
                  >
                    <Icon size={20} className="text-blue-500" />
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-sm font-medium capitalize text-gray-700">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(pg.amenities || []).map((item) => {
                  const Icon = amenityIcons[item];
                  return (
                    <div
                      key={item}
                      className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-3 py-2 text-sm text-gray-600"
                    >
                      {Icon && (
                        <Icon
                          size={15}
                          className="text-blue-500 flex-shrink-0"
                        />
                      )}
                      {item}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Policies */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Policies</h2>
              <ul className="flex flex-col gap-3">
                {[
                  {
                    icon: Clock,
                    text: "Check-in: 10:00 AM — Check-out: 9:00 AM",
                  },
                  { icon: Ban, text: "No smoking inside the premises" },
                  {
                    icon: PartyPopper,
                    text: "No parties or loud music after 10 PM",
                  },
                  { icon: PawPrint, text: "Pets not allowed" },
                  {
                    icon: CreditCard,
                    text: "1 month security deposit required at check-in",
                  },
                ].map(({ icon: Icon, text }) => (
                  <li
                    key={text}
                    className="flex items-start gap-3 text-sm text-gray-600"
                  >
                    <Icon
                      size={16}
                      className="text-gray-600 mt-0.5 flex-shrink-0"
                    />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* // ✅ After — receives pgId + total count only */}
            <ReviewsSection
              pgId={id}
              initialTotal={reviews.length}
              avgRating={avgRating}
            />

            {/* Location Map */}
            <PGLocationMapWrapper
              coordinate={pg.coordinate}
              address={pg.address}
              city={pg.city}
            />
          </div>

          {/* ── RIGHT / BOOKING CARD ──
              mobile: shows at top (order-first), desktop: sticky right column */}
          <div className="order-first lg:order-none mb-6 lg:mb-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 lg:sticky lg:top-24">
              <p className="text-3xl font-bold text-gray-900">
                ₹{pg.price?.toLocaleString()}
              </p>
              <p className="text-gray-400 text-sm mt-0.5">per month</p>

              <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span>Gender</span>
                  <span className="font-medium capitalize">{pg.gender}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span>Food</span>
                  <span className="font-medium capitalize">{pg.food}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Rooms</span>
                  <span className="font-medium">{pg.room}</span>
                </div>
              </div>

              <BookNowButton pgId={id} />
              <p className="text-center text-xs text-gray-400 mt-2">
                No charges yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
