import { notFound } from "next/navigation";
import PGGallery from "../../components/PGGallery";
import { pgApi } from "../../../lib/api/pg";
import { imageApi } from "../../../lib/api/image";
import { reviewApi } from "../../../lib/api/review";
import { roomTypeApi } from "../../../lib/api/roomType";
import PGLocationMapWrapper from "./components/PGLocationMapWrapper";
import {
  AMENITY_ICONS,
  GENDER_LABELS,
  FOOD_LABELS,
  POLICY_ICONS,
  ROOM_DETAIL_ICONS,
} from "../../../lib/constants";
import { MapPin, Star, ShieldCheck, Info, Calendar } from "lucide-react";
import ReviewsSection from "./components/ReviewsSection";
import BookingStickyCard from "./components/BookingStickyCard";
import OwnerEditButton from "./OwnerEditButton";
import BackButton from "../../../components/BackButton";
import MobileBookingSection from "./components/MobileBookingSection";

async function getPG(id) {
  return await pgApi.getById(id);
}

async function getImages(pgId) {
  return await imageApi.getByPgId(pgId);
}

async function getReviews(pgId) {
  const result = await reviewApi.getByPgId(pgId);
  return Array.isArray(result) ? result : (result?.reviews ?? []);
}

async function getRoomTypes(pgId) {
  return await roomTypeApi.getByPgId(pgId);
}

export default async function PGDetails({ params }) {
  const { id } = await params;

  const [pg, images, reviews, roomTypes] = await Promise.all([
    getPG(id).catch(() => null),
    getImages(id).catch(() => []),
    getReviews(id).catch(() => []),
    getRoomTypes(id).catch(() => []),
  ]);

  console.log("DEBUG SSR ROOM TYPES:", roomTypes);

  if (!pg || !pg._id) notFound();

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.star, 0) / reviews.length).toFixed(1)
    : null;

  const bathroomRatio =
    pg.bathroom && pg.room
      ? `${pg.bathroom} (${pg.bathroom >= pg.room
        ? "Attached"
        : `1:${Math.round(pg.room / pg.bathroom)}`
      })`
      : "—";

  const toiletRatio =
    pg.toilet && pg.room
      ? `${pg.toilet} (${pg.toilet >= pg.room
        ? "Attached"
        : `1:${Math.round(pg.room / pg.toilet)}`
      })`
      : "—";

  const totalBeds = roomTypes.reduce(
    (s, rt) => s + rt.availableRooms * rt.sharingCount,
    0,
  );
  const freeBeds = roomTypes.reduce(
    (s, rt) =>
      s +
      (rt.remainingBeds ??
        rt.availableRooms * rt.sharingCount - (rt.occupiedBeds || 0)),
    0,
  );

  return (
    <div className="bg-white min-h-screen text-[#222222] font-sans selection:bg-rose-100">
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-12 py-6">
        {/* TOP NAV/BACK */}
        <div className="mb-4 flex items-center justify-between">
          <BackButton />
        </div>

        {/* TITLE & HEADER */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#222222] capitalize">
                {pg.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px]">
                <div className="flex items-center gap-1 font-semibold underline cursor-pointer">
                  <Star className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>{avgRating || "New"}</span>
                  <span className="text-[#717171] font-normal">
                    · {reviews.length} reviews
                  </span>
                </div>
                <div className="flex items-center gap-1 font-semibold underline cursor-pointer">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="capitalize">{pg.city}</span>
                </div>
              </div>
            </div>
            <OwnerEditButton pgOwnerId={pg.owner} pgId={id} />
          </div>
        </div>

        {/* GALLERY AREA */}
        <div className="rounded-2xl overflow-hidden shadow-sm">
          <PGGallery images={images} />
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT: CONTENT */}
          <div className="lg:col-span-7">
            {/* Quick Info */}
            <div className="pb-6 border-b border-gray-200">
              <p className="text-[#484848] text-base">
                {pg.room} rooms · {totalBeds} beds · {pg.bathroom} bathrooms
              </p>
            </div>

            {/* Special Features */}
            <div className="py-8 border-b border-gray-200 space-y-6">
              <div className="flex gap-4 items-start">
                <ShieldCheck className="w-6 h-6 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-[15px] font-semibold">Verified Stay</h3>
                  <p className="text-[#717171] text-sm mt-0.5">
                    Every room is inspected for quality and safety standards.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Info className="w-6 h-6 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-[15px] font-semibold">Flexible Policies</h3>
                  <p className="text-[#717171] text-sm mt-0.5">
                    Simplified booking and checkout process for modern living.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Calendar className="w-6 h-6 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-[15px] font-semibold">Free cancellation</h3>
                  <p className="text-[#717171] text-sm mt-0.5">
                    Cancel before check-in for a partial refund (terms apply).
                  </p>
                </div>
              </div>
            </div>

            {/* Description / About */}
            <div className="py-8 border-b border-gray-200">
              <p className="text-[#484848] leading-relaxed text-base whitespace-pre-line">
                Welcome to {pg.name}. Experience a blend of comfort and modern
                living in the heart of {pg.city}. Our space is designed for
                individuals seeking a professional and vibrant environment.
                Located at {pg.address}, you'll have easy access to local
                transport and amenities.
              </p>
            </div>

            {/* Room Details Grid */}
            <div className="py-8 border-b border-gray-200">
              <h2 className="text-[22px] font-semibold mb-5">
                Room configurations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    icon: ROOM_DETAIL_ICONS.Rooms,
                    label: "Private & Shared Rooms",
                    value: `${pg.room} rooms`,
                  },
                  {
                    icon: ROOM_DETAIL_ICONS.Gender,
                    label: "Gender Specification",
                    value: GENDER_LABELS[pg.gender] || pg.gender,
                  },
                  {
                    icon: ROOM_DETAIL_ICONS.Food,
                    label: "Food Service",
                    value: FOOD_LABELS[pg.food] || pg.food,
                  },
                  {
                    icon: ROOM_DETAIL_ICONS.Bathroom,
                    label: "Bathroom Ratio",
                    value: bathroomRatio,
                  },
                  {
                    icon: ROOM_DETAIL_ICONS.Toilet,
                    label: "Toilet Facility",
                    value: toiletRatio,
                  },
                  {
                    icon: ROOM_DETAIL_ICONS["Free Beds"],
                    label: "Current Availability",
                    value: `${freeBeds} beds free`,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="p-3 border border-gray-200 rounded-xl flex items-center gap-3"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-[#222222]">
                        {label}
                      </p>
                      <p className="text-sm text-gray-600">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities Section */}
            <div className="py-8 border-b border-gray-200">
              <h2 className="text-[22px] font-semibold mb-5">
                What this place offers
              </h2>
              <div className="grid grid-cols-2 gap-y-5">
                {(pg.amenities || []).slice(0, 10).map((item) => {
                  const Icon = AMENITY_ICONS[item];
                  return (
                    <div
                      key={item}
                      className="flex items-center gap-4 text-gray-700"
                    >
                      {Icon && <Icon className="w-6 h-6 opacity-80" />}
                      <span className="text-[15px] text-[#484848]">{item}</span>
                    </div>
                  );
                })}
              </div>
              {pg.amenities?.length > 10 && (
                <button className="mt-5 px-5 py-2.5 border border-[#222222] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Show all {pg.amenities.length} amenities
                </button>
              )}
            </div>

            {/* Reviews Preview (passed to Section) */}
            <div className="py-8 border-b border-gray-200">
              <ReviewsSection
                pgId={id}
                initialTotal={reviews.length}
                avgRating={avgRating}
              />
            </div>

            {/* Mobile Booking Section - Shows calendar + sticky bar on mobile */}
            <div className="lg:hidden">
              <MobileBookingSection pg={pg} />
            </div>

          </div>

          {/* RIGHT: STICKY BOOKING CARD */}
          <div className="lg:col-span-5 relative ">
            <div className="hidden lg:block lg:sticky lg:top-28 ">
              <BookingStickyCard
                pg={pg}
                avgRating={avgRating}
                reviewCount={reviews.length}
              />

              {/* Policy Footer under card */}
              <div className="mt-6 p-5 border border-gray-200 rounded-xl bg-rose-50/40">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span className="font-semibold text-sm text-[#222222]">
                    House Rules
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  No smoking · No parties · Pets not allowed.
                  <br />

                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map Section — full width below grid */}
        <div className="pt-8 pb-4">
          <PGLocationMapWrapper
            coordinate={pg.coordinate}
            address={pg.address}
            city={pg.city}
          />
        </div>
      </div>
    </div>
  );
}
