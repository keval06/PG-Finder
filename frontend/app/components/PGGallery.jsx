"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Trash2,
  ImagePlus,
} from "lucide-react";
import { GALLERY_CATEGORIES, CATEGORY_LABELS } from "../../lib/constants";
import useLightbox from "../hooks/useLightbox";

export default function PGGallery({ images, onDelete, onUpload, uploading }) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeCategory, setActiveCategory] = useState("room");

  const filtered = images.filter((img) => img.category === activeCategory);

  // Safety: If an image is deleted and activeImage is now out of bounds
  if (activeImage >= filtered.length && filtered.length > 0) {
    setActiveImage(filtered.length - 1);
  }

  const {
    isOpen: lbOpen,
    index: lbIdx,
    setIndex: setLbIdx,
    openLightbox,
    closeLightbox,
    next: lbNext,
    prev: lbPrev,
  } = useLightbox(filtered);

  // Switch category and reset active image
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setActiveImage(0);
  };

  // Count images per category for badge
  const countByCategory = (cat) =>
    images.filter((img) => img.category === cat).length;

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {GALLERY_CATEGORIES.map((cat) => {
            const count = countByCategory(cat);
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-xl capitalize text-sm font-medium 
                  border flex-shrink-0 transition-all duration-200
                  ${
                    activeCategory === cat
                      ? "bg-[#FF385C] text-white border-[#FF385C] shadow-sm"
                      : "text-[#222222] border-gray-300 hover:border-[#FF385C] hover:text-[#FF385C] bg-white"
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
              className="group relative w-full h-[330px] sm:h-[480px] bg-slate-100 rounded-3xl overflow-hidden cursor-zoom-in shadow-inner"
              onClick={() => openLightbox(activeImage)}
            >
              <img
                src={filtered[activeImage]?.url}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                alt={activeCategory}
              />
              {!onDelete && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-black/60 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md">
                    <Maximize2 size={14} />
                    View Fullscreen
                  </div>
                </div>
              )}

              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(filtered[activeImage]._id); }}
                  className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              )}

              <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm">
                {activeImage + 1} / {filtered.length}
              </div>

              {filtered.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((i) => (i - 1 + filtered.length) % filtered.length);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 rounded-full w-9 h-9 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((i) => (i + 1) % filtered.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 rounded-full w-9 h-9 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

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
                          ? "border-[#FF385C] ring-2 ring-rose-50"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }
                    `}
                  >
                    <img src={img?.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}

                {onUpload && (
                  <label className={`w-[88px] h-[60px] flex-shrink-0 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-slate-400 hover:bg-slate-50"}`}>
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ImagePlus size={18} className="text-slate-400" />
                    )}
                    <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(e) => { if (e.target.files[0]) onUpload(e.target.files[0], activeCategory); e.target.value = ''; }} />
                  </label>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          onUpload ? (
            <label className={`w-full h-[300px] sm:h-[450px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-400 group transition-all ${uploading ? "opacity-70 cursor-not-allowed" : "hover:border-slate-400 hover:bg-slate-50/30 cursor-pointer"}`}>
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-1 transition-transform">
                {uploading ? (
                   <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                   <ImagePlus size={28} className="text-slate-400" />
                )}
              </div>
              <p className="text-sm font-semibold text-slate-600">
                {uploading ? "Uploading..." : `No ${CATEGORY_LABELS[activeCategory]} images yet`}
              </p>
              {!uploading && <p className="text-xs text-slate-400">Click to upload</p>}
              <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(e) => { if (e.target.files[0]) onUpload(e.target.files[0], activeCategory); e.target.value = ''; }} />
            </label>
          ) : (
            <div className="w-full h-[300px] sm:h-[450px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-1">
                <ImageIcon size={28} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-500">No {CATEGORY_LABELS[activeCategory]} photos yet</p>
              <p className="text-xs text-slate-400">Owner hasn&apos;t uploaded any photos for this area</p>
            </div>
          )
        )}
      </div>

      {/* LIGHTBOX */}
      {lbOpen && filtered.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-all z-10" onClick={closeLightbox}>
            <X size={20} />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">{lbIdx + 1} / {filtered.length}</div>
          <div className="absolute top-4 left-4 text-white/60 text-sm capitalize font-medium">{CATEGORY_LABELS[activeCategory]}</div>
          <div className="relative max-w-[92vw] max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img key={lbIdx} src={filtered[lbIdx]?.url} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl transition-all duration-300" />
          </div>
          {filtered.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full w-11 h-11 flex items-center justify-center transition-all" onClick={(e) => { e.stopPropagation(); lbPrev(); }}>
                <ChevronLeft size={22} />
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full w-11 h-11 flex items-center justify-center transition-all" onClick={(e) => { e.stopPropagation(); lbNext(); }}>
                <ChevronRight size={22} />
              </button>
            </>
          )}
          {filtered.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-2 pb-1 scrollbar-hide">
              {filtered.map((img, i) => (
                <button key={img._id} onClick={(e) => { e.stopPropagation(); setLbIdx(i); }} className={`flex-shrink-0 w-14 h-10 rounded-md overflow-hidden border-2 transition-all duration-150 ${lbIdx === i ? "border-white" : "border-transparent opacity-40 hover:opacity-75"}`}>
                  <img src={img?.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </>
  );
}