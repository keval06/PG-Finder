"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Maximize2,
  Trash2,
  ImagePlus,
} from "lucide-react";

const CATEGORIES = [
  "room",
  "kitchen",
  "bathroom",
  "toilet",
  "building",
  "amenities",
];

const CATEGORY_LABELS = {
  room: "Room",
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  toilet: "Toilet",
  building: "Building",
  amenities: "Amenities",
};

export default function PGGallery({ images, onDelete, onUpload }) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeCategory, setActiveCategory] = useState("room");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filtered = images.filter((img) => img.category === activeCategory);

  // Switch category and reset active image
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setActiveImage(0);
  };

  // Open lightbox
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  // Close lightbox
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  }, []);

  // Navigate lightbox
  const lightboxPrev = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + filtered.length) % filtered.length);
  }, [filtered.length]);

  const lightboxNext = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % filtered.length);
  }, [filtered.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, lightboxPrev, lightboxNext, closeLightbox]);

  // Count images per category for badge
  const countByCategory = (cat) =>
    images.filter((img) => img.category === cat).length;

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const count = countByCategory(cat);
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-xl capitalize text-xs font-semibold 
                  border flex-shrink-0 transition-all duration-200
                  ${
                    activeCategory === cat
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                      : "text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600 bg-white"
                  }
                `}
              >
                {CATEGORY_LABELS[cat]}
                {count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                      activeCategory === cat
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {/* Main Image */}
            <div
              className="group relative w-full h-[300px] sm:h-[460px] bg-slate-900 rounded-2xl overflow-hidden cursor-zoom-in"
              onClick={() => openLightbox(activeImage)}
            >
              <img
                src={filtered[activeImage]?.url}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                alt={activeCategory}
              />
              {/* Dark overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-2xl" />

              {/* Expand hint (only when no delete) */}
              {!onDelete && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm">
                    <Maximize2 size={12} />
                    View full
                  </div>
                </div>
              )}

              {/* Delete button (edit mode only) */}
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(filtered[activeImage]._id); }}
                  className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              )}

              {/* Image counter badge */}
              <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm">
                {activeImage + 1} / {filtered.length}
              </div>

              {/* Prev/Next arrows on main image */}
              {filtered.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage(
                        (i) => (i - 1 + filtered.length) % filtered.length,
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 rounded-full w-9 h-9 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((i) => (i + 1) % filtered.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 rounded-full w-9 h-9 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails — always show in edit mode, or when >1 image in view mode */}
            {(filtered.length > 1 || onUpload) && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {filtered.map((img, i) => (
                  <button
                    key={img._id}
                    onClick={() => setActiveImage(i)}
                    className={`
                      relative flex-shrink-0 w-[88px] h-[60px] rounded-xl overflow-hidden border-2 transition-all duration-200
                      ${
                        activeImage === i
                          ? "border-blue-500 ring-2 ring-blue-100 scale-105"
                          : "border-transparent opacity-55 hover:opacity-90 hover:scale-[1.03]"
                      }
                    `}
                  >
                    <img
                      src={img?.url}
                      alt={img.category}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}

                {/* Upload button in thumbnail row (edit mode only) */}
                {onUpload && (
                  <label className="w-[88px] h-[60px] flex-shrink-0 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <ImagePlus size={18} className="text-slate-400" />
                    <input type="file" accept="image/*" hidden onChange={(e) => { if (e.target.files[0]) onUpload(e.target.files[0], activeCategory); }} />
                  </label>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          onUpload ? (
            <label className="w-full h-[340px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 group hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <ImagePlus size={28} className="text-blue-500/50" />
              </div>
              <p className="text-sm font-semibold text-slate-600">No {CATEGORY_LABELS[activeCategory]} images yet</p>
              <p className="text-xs text-slate-400">Click to upload</p>
              <input type="file" accept="image/*" hidden onChange={(e) => { if (e.target.files[0]) onUpload(e.target.files[0], activeCategory); }} />
            </label>
          ) : (
            <div className="w-full h-[340px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-1">
                <ImageIcon size={28} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-500">
                No {CATEGORY_LABELS[activeCategory]} photos yet
              </p>
              <p className="text-xs text-slate-400">
                Owner hasn&apos;t uploaded any photos for this area
              </p>
            </div>
          )
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      {lightboxOpen && filtered.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all z-10"
            onClick={closeLightbox}
          >
            <X size={20} />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
            {lightboxIndex + 1} / {filtered.length}
          </div>

          {/* Category label */}
          <div className="absolute top-4 left-4 text-white/60 text-sm capitalize font-medium">
            {CATEGORY_LABELS[activeCategory]}
          </div>

          {/* Main lightbox image */}
          <div
            className="relative max-w-[92vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              key={lightboxIndex}
              src={filtered[lightboxIndex]?.url}
              alt={activeCategory}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
              style={{ animation: "fadeIn 0.2s ease" }}
            />
          </div>

          {/* Prev */}
          {filtered.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full w-11 h-11 flex items-center justify-center transition-all hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  lightboxPrev();
                }}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full w-11 h-11 flex items-center justify-center transition-all hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  lightboxNext();
                }}
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Lightbox thumbnails strip */}
          {filtered.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-2 pb-1">
              {filtered.map((img, i) => (
                <button
                  key={img._id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(i);
                  }}
                  className={`flex-shrink-0 w-14 h-10 rounded-md overflow-hidden border-2 transition-all duration-150 ${
                    lightboxIndex === i
                      ? "border-white opacity-100 scale-110"
                      : "border-transparent opacity-40 hover:opacity-75"
                  }`}
                >
                  <img
                    src={img?.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}