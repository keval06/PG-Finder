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
  Star,
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
  const shown = (pg.amenities || []).slice(0, 4);
  const extra = (pg.amenities?.length || 0) - 4;
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
        className={`block group transition-all mb-4 ${
          showInactive && inactive ? "opacity-70" : ""
        }`}
      >
        <div className="bg-white border border-[#DDDDDD] rounded-2xl overflow-hidden flex flex-col sm:flex-row transition-all duration-300 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] hover:border-gray-300">
          {/* IMAGE SECTION */}
          <div className="group/img relative w-full sm:w-[280px] h-[210px] sm:h-auto flex-shrink-0 bg-slate-50 overflow-hidden">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[cardIdx]?.url}
                  alt={pg.name}
                  fill
                  className="object-cover transition-opacity duration-500"
                  sizes="(max-width: 640px) 100vw, 280px"
                  unoptimized={true}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    openLightbox(cardIdx);
                  }}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-900 rounded-full w-8 h-8 flex items-center justify-center shadow-md opacity-0 group-hover/img:opacity-100 transition-all z-10"
                >
                  <Maximize2 size={14} />
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 rounded-full w-8 h-8 flex items-center justify-center shadow-md opacity-0 group-hover/img:opacity-100 transition-all z-10"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 rounded-full w-8 h-8 flex items-center justify-center shadow-md opacity-0 group-hover/img:opacity-100 transition-all z-10"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                      {images.slice(0, 5).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 rounded-full transition-all ${
                            i === cardIdx ? "bg-white w-3" : "bg-white/60 w-1.5"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-300">
                <MapPin size={48} strokeWidth={1} />
              </div>
            )}
            {showInactive && inactive && (
              <Badge variant="red" className="absolute top-3 left-3 shadow-md z-10">
                Inactive
              </Badge>
            )}
          </div>

          {/* CONTENT SECTION */}
          <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1.5">
                <h2 className="text-[17px] font-semibold text-[#222222] truncate leading-tight flex-1">
                  {pg.name}
                </h2>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star size={13} className="text-[#FF385C] fill-[#FF385C]" />
                  <span className="text-[15px] font-semibold text-[#222222]">
                    {avg || "New"}
                  </span>
                  {count > 0 && (
                    <span className="text-[15px] text-[#717171]">({count})</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[#484848] text-[15px] mb-3 flex-wrap">
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  <span className="font-medium text-[#222222] truncate">{pg.city}</span>
                </div>
                {pg.address && (
                  <span className="text-[#717171] truncate hidden sm:inline opacity-80">
                    · {pg.address}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-4">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-[10px] font-bold uppercase tracking-wider">
                  <User size={12} /> {GENDER_LABELS[pg.gender] || pg.gender}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                  <Utensils size={12} /> {FOOD_LABELS[pg.food] || pg.food}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {shown.map((a) => {
                  const Icon = AMENITY_ICONS[a];
                  return (
                    <div
                      key={a}
                      className="flex items-center gap-1.5 text-[12px] text-[#484848] bg-white border border-gray-200 px-3 py-1.5 rounded-xl hover:border-rose-200 hover:bg-rose-50/30 transition-colors"
                    >
                      {Icon && <Icon size={14} className="text-gray-400" />}
                      <span>{a}</span>
                    </div>
                  );
                })}
                {extra > 0 && (
                  <span className="text-[12px] text-[#717171] px-2">
                    +{extra} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
              <div className="flex items-baseline gap-1">
                <span className="text-[17px] font-bold text-[#222222]">
                  ₹{pg.price?.toLocaleString("en-IN")}
                </span>
                <span className="text-[14px] text-[#717171]">/ month</span>
              </div>
              <div className="flex-shrink-0">
                {footerAction}
              </div>
            </div>
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
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-4 z-10">
            <span className="text-white/70 text-sm font-medium">
              {lbIdx + 1} / {images.length}
            </span>
            <span className="text-white/70 text-sm font-medium truncate max-w-[50vw] text-center">
              {pg.name}
            </span>
            <button
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all"
              onClick={closeLightbox}
            >
              <X size={22} />
            </button>
          </div>

          {/* Image */}
          <div
            className="relative max-w-[95vw] max-h-[85vh] flex items-center justify-center select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={lbIdx}
              src={images[lbIdx]?.url}
              alt={pg.name}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              style={{ animation: "pgFade .2s ease" }}
            />
          </div>

          {/* Arrow buttons */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/15 hover:bg-white/25 rounded-full w-12 h-12 flex items-center justify-center transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  lbPrev();
                }}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/15 hover:bg-white/25 rounded-full w-12 h-12 flex items-center justify-center transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  lbNext();
                }}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      )}
      <style>{`@keyframes pgFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  );
}
