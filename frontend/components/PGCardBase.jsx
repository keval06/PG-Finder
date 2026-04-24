"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  User,
  Utensils,
  Maximize2,
  X,
} from "lucide-react";
import Badge from "../app/atoms/Badge";
import { AMENITY_ICONS, GENDER_LABELS, FOOD_LABELS } from "../lib/constants";
import useLightbox from "../app/hooks/useLightbox";

export default function PGCardBase({
  pg,
  href,
  footerAction,
  showInactive = false,
}) {
  const images = pg.images?.length
    ? pg.images
    : pg.image
    ? [{ url: pg.image, _id: "single" }]
    : [];

  const [cardIdx, setCardIdx] = useState(0);
  const {
    isOpen: lightbox,
    index: lbIdx,
    openLightbox,
    closeLightbox,
    next: lbNext,
    prev: lbPrev,
  } = useLightbox(images);

  const avg = pg.ratingData?.avg
    ? parseFloat(pg.ratingData.avg).toFixed(1)
    : null;
  const count = pg.ratingData?.count || 0;
  const shown = (pg.amenities || []).slice(0, 5);
  const extra = (pg.amenities?.length || 0) - 5;
  const inactive = pg.isActive === false;

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCardIdx((i) => (i - 1 + images.length) % images.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCardIdx((i) => (i + 1) % images.length);
  };

  return (
    <>
      <Link
        href={href}
        className={`block group transition-all ${
          showInactive && inactive ? "opacity-70" : ""
        }`}
      >
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row transition-all duration-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-50/50">
          {/* IMAGE SECTION */}
          <div className="group/img relative w-full sm:w-[240px] h-[180px] sm:h-auto flex-shrink-0 bg-slate-50 overflow-hidden sm:min-h-[180px]">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[cardIdx]?.url}
                  alt={pg.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/img:scale-105"
                  sizes="(max-width: 640px) 100vw, 240px"
                  unoptimized={true}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    openLightbox(cardIdx);
                  }}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-lg p-1.5 sm:opacity-0 sm:group-hover/img:opacity-100 transition-all z-10"
                >
                  <Maximize2 size={12} />
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full w-7 h-7 flex items-center justify-center shadow sm:opacity-0 sm:group-hover/img:opacity-100 transition-all z-10"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={handleNext}
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
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                🏠
              </div>
            )}
            {showInactive && inactive && (
              <Badge variant="red" className="absolute top-2 left-2 shadow-sm z-10">
                Inactive
              </Badge>
            )}
          </div>

          {/* CONTENT SECTION */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between min-w-0">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors mb-0.5">
                {pg.name}
              </h2>

              <div className="flex items-center gap-1.5 mb-1">
                <MapPin size={12} className="text-blue-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-500 capitalize">
                  {pg.city}
                </span>
                {pg.address && (
                  <span className="text-xs text-slate-400 truncate">
                    · {pg.address}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mb-2">
                {avg ? (
                  <span className="text-yellow-500 text-sm">
                    ★ {avg}/5
                    <span className="text-slate-400 font-normal ml-1">
                      ({count} {count === 1 ? "review" : "reviews"})
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs">★ No reviews yet</span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Badge
                  variant="blue"
                  className="flex items-center gap-1 normal-case"
                >
                  <User size={10} /> {GENDER_LABELS[pg.gender] || pg.gender}
                </Badge>
                <Badge
                  variant="slate"
                  className="flex items-center gap-1 normal-case font-medium"
                >
                  <Utensils size={10} /> {FOOD_LABELS[pg.food] || pg.food}
                </Badge>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {shown.map((a) => {
                  const Icon = AMENITY_ICONS[a];
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

          {/* PRICE + ACTION SECTION */}
          <div className="flex sm:flex-col items-center sm:items-stretch justify-between sm:justify-center gap-3 px-4 sm:px-5 pb-4 sm:py-5 sm:border-l border-slate-100 sm:w-36 flex-shrink-0">
            <div className="sm:text-center">
              <p className="text-xl font-bold text-slate-900 leading-none">
                ₹{pg.price?.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">/month</p>
            </div>
            {footerAction}
          </div>
        </div>
      </Link>

      {/* LIGHTBOX — mobile-friendly with swipe + large touch targets */}
      {lightbox && images.length > 0 && (
        <div
          className="fixed inset-0 z-[999] bg-black/95 flex flex-col items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Top bar: counter + close */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-10">
            <span className="text-white/70 text-sm font-medium">
              {lbIdx + 1} / {images.length}
            </span>
            <span className="text-white/70 text-sm font-medium truncate max-w-[50vw] text-center">
              {pg.name}
            </span>
            <button
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center transition-all"
              onClick={closeLightbox}
            >
              <X size={20} />
            </button>
          </div>

          {/* Image with swipe support */}
          <div
            className="relative max-w-[95vw] max-h-[80vh] flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              e.currentTarget._touchStartX = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const startX = e.currentTarget._touchStartX;
              const endX = e.changedTouches[0].clientX;
              const diff = startX - endX;
              if (Math.abs(diff) > 50) {
                if (diff > 0) lbNext(); // swipe left → next
                else lbPrev(); // swipe right → prev
              }
            }}
          >
            <img
              key={lbIdx}
              src={images[lbIdx]?.url}
              alt={pg.name}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              style={{ animation: "pgFade .18s ease" }}
            />
          </div>

          {/* Arrow buttons — large touch targets, always visible */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white bg-white/15 hover:bg-white/25 active:bg-white/35 rounded-full w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  lbPrev();
                }}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white bg-white/15 hover:bg-white/25 active:bg-white/35 rounded-full w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  lbNext();
                }}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      )}
      <style>{`@keyframes pgFade{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}`}</style>
    </>
  );
}
