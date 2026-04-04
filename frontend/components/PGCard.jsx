"use client";

import { useState, useEffect, useCallback } from "react";
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
  Utensils,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
} from "lucide-react";
import BookNowButton from "../app/pg/[id]/components/BookNowButton";
import Badge from "../app/atoms/Badge";
import imageLoader from "../lib/imageLoader";

const amenityIcons = {
  WiFi: Wifi,
  Parking: Car,
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

const genderLabel = { male: "Male", female: "Female", mix: "Co-ed" };
const foodLabel = {
  "with food": "With Food",
  "without food": "Without Food",
  flexible: "Flexible",
};

export default function PGCard({ pg }) {
  const avg = pg.ratingData?.avg
    ? parseFloat(pg.ratingData.avg).toFixed(1)
    : null;
  const count = pg.ratingData?.count || 0;
  const shown = (pg.amenities || []).slice(0, 5);
  const extra = (pg.amenities?.length || 0) - 5;

  // ── Mini Gallery State ──
  const images = pg.images?.length
    ? pg.images
    : pg.image
    ? [{ url: pg.image, _id: "single" }]
    : [];

  const [cardIdx, setCardIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);

  const openLightbox = (e, i) => {
    e.preventDefault();
    e.stopPropagation();
    setLbIdx(i);
    setLightbox(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = useCallback(() => {
    setLightbox(false);
    document.body.style.overflow = "";
  }, []);

  const lbPrev = useCallback(
    (e) => {
      e?.preventDefault();
      e?.stopPropagation();
      setLbIdx((i) => (i - 1 + images.length) % images.length);
    },
    [images.length],
  );

  const lbNext = useCallback(
    (e) => {
      e?.preventDefault();
      e?.stopPropagation();
      setLbIdx((i) => (i + 1) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    const h = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lbPrev();
      if (e.key === "ArrowRight") lbNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [lightbox, closeLightbox, lbPrev, lbNext]);

  return (
    <>
      <Link href={`/pg/${pg._id}`} className="block group">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row transition-all duration-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-50/50">
          {/* ── IMAGE GALLERY ── */}
          <div className="group/img relative w-full sm:w-52 h-48 sm:h-auto flex-shrink-0 bg-slate-50 overflow-hidden">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[cardIdx]?.url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=75"}
                  alt={pg.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/img:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, 208px"
                  unoptimized={true}
                />

                {/* Expand button */}
                <button
                  onClick={(e) => openLightbox(e, cardIdx)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-lg p-1.5 sm:opacity-0 sm:group-hover/img:opacity-100 transition-all z-10"
                >
                  <Maximize2 size={12} />
                </button>

                {/* Left/right arrows + counter */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCardIdx((i) => (i - 1 + images.length) % images.length);
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full w-7 h-7 flex items-center justify-center shadow sm:opacity-0 sm:group-hover/img:opacity-100 transition-all z-10"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCardIdx((i) => (i + 1) % images.length);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full w-7 h-7 flex items-center justify-center shadow sm:opacity-0 sm:group-hover/img:opacity-100 transition-all z-10"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-md z-10">
                      {cardIdx + 1}/{images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=75"
                  alt={pg.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 208px"
                  unoptimized={true}
                />
              </div>
            )}
          </div>

          {/* ── CONTENT ── */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors mb-1">
                {pg.name}
              </h2>

              <div className="flex items-center gap-1.5 mb-2">
                {avg ? (
                  <span className="text-yellow-500">
                    ★ {avg}/5
                    <span className="text-slate-400 font-normal ml-1">
                      ({count} {count === 1 ? "review" : "reviews"})
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs">★ No reviews yet</span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                <MapPin size={11} className="flex-shrink-0" />
                <span className="truncate">
                  {pg.address ? `${pg.address}, ` : ""}
                  {pg.city}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Badge variant="blue" className="flex items-center gap-1 normal-case">
                  <User size={10} /> {genderLabel[pg.gender] || pg.gender}
                </Badge>
                <Badge variant="slate" className="flex items-center gap-1 normal-case font-medium">
                  <Utensils size={10} /> {foodLabel[pg.food] || pg.food}
                </Badge>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {shown.map((a) => {
                  const Icon = amenityIcons[a];
                  return (
                    <div
                      key={a}
                      className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full"
                    >
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
            <BookNowButton pgId={pg._id} />
          </div>
        </div>
      </Link>

      {/* ── LIGHTBOX ── */}
      {lightbox && images.length > 0 && (
        <div
          className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-9 h-9 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <X size={18} />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">
            {lbIdx + 1} / {images.length}
          </div>
          <img
            key={lbIdx}
            src={images[lbIdx]?.url}
            alt={pg.name}
            className="max-w-[92vw] max-h-[85vh] object-contain rounded-xl"
            style={{ animation: "pgFade .18s ease" }}
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full w-10 h-10 flex items-center justify-center"
                onClick={lbPrev}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full w-10 h-10 flex items-center justify-center"
                onClick={lbNext}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      )}
      <style>{`@keyframes pgFade{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}`}</style>
    </>
  );
}
