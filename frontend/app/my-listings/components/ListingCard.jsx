"use client";

import { useRouter } from "next/navigation";
import { MapPin, ChevronRight, ChevronLeft, X, Maximize2 } from "lucide-react";
import Image from "next/image";
import Badge from "../../atoms/Badge";
import { useState, useEffect, useCallback } from "react";

const genderLabel = { male: "Male", female: "Female", mix: "Co-ed" };

export default function ListingCard({ pg }) {
  const router = useRouter();
  const inactive = pg.isActive === false;
  const avg = pg.ratingData?.avg ? `★ ${pg.ratingData.avg}/5` : "★ No reviews";
  const count = pg.ratingData?.count || 0;

  const images = pg.images?.length
    ? pg.images
    : pg.image
    ? [{ url: pg.image, _id: "single" }]
    : [];

  const [cardIdx, setCardIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);

  const openLightbox = (e, i) => {
    e.stopPropagation();
    setLbIdx(i);
    setLightbox(true);
    document.body.style.overflow = "hidden";
  };
  const closeLightbox = useCallback(() => {
    setLightbox(false);
    document.body.style.overflow = "";
  }, []);
  const lbPrev = useCallback((e) => { e?.stopPropagation(); setLbIdx(i => (i - 1 + images.length) % images.length); }, [images.length]);
  const lbNext = useCallback((e) => { e?.stopPropagation(); setLbIdx(i => (i + 1) % images.length); }, [images.length]);

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
      <div
        onClick={() => router.push(`/my-listings/${pg._id}`)}
        className={`bg-white border rounded-2xl overflow-hidden transition-all cursor-pointer flex flex-col sm:flex-row hover:border-blue-300 hover:shadow-md hover:shadow-blue-50/50 ${
          inactive ? "border-slate-200 opacity-60" : "border-slate-200"
        }`}
      >
        {/* IMAGE */}
        <div className="group relative w-full sm:w-[240px] h-[200px] sm:h-[180px] flex-shrink-0 bg-slate-50 sm:self-start overflow-hidden">
          {images.length > 0 ? (
            <>
              <Image
                src={images[cardIdx]?.url}
                alt={pg.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, 240px"
                unoptimized={true}
              />
              <button
                onClick={(e) => openLightbox(e, cardIdx)}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-lg p-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
              >
                <Maximize2 size={12} />
              </button>
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setCardIdx(i => (i - 1 + images.length) % images.length); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full w-6 h-6 flex items-center justify-center shadow sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                    <ChevronLeft size={13} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setCardIdx(i => (i + 1) % images.length); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full w-6 h-6 flex items-center justify-center shadow sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                    <ChevronRight size={13} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-md">
                    {cardIdx + 1}/{images.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-3xl">🏠</div>
          )}
          {inactive && (
            <Badge variant="red" className="absolute top-2 left-2 shadow-sm z-10">Inactive</Badge>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-4 sm:p-5 min-w-0 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 truncate mb-0.5">{pg.name}</h2>
            <p className="text-xs text-yellow-600 font-medium mb-1">
              {avg}
              {count > 0 && <span className="text-slate-400 font-normal ml-1">({count} reviews)</span>}
            </p>
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
              <MapPin size={10} />
              <span className="truncate">{pg.address}, {pg.city}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="blue" className="normal-case">{genderLabel[pg.gender]}</Badge>
              <Badge variant="slate" className="normal-case font-medium">{pg.food}</Badge>
              {(pg.amenities || []).slice(0, 3).map(a => (
                <Badge key={a} variant="slate" className="normal-case font-normal border-slate-100">{a}</Badge>
              ))}
              {(pg.amenities?.length || 0) > 3 && (
                <span className="text-[10px] text-slate-400 font-medium">+{pg.amenities.length - 3} more</span>
              )}
            </div>
          </div>
        </div>

        {/* PRICE */}
        <div className="flex sm:flex-col items-center sm:items-stretch justify-between sm:justify-center gap-2 px-4 sm:px-5 pb-4 sm:py-5 sm:border-l border-slate-100 sm:w-36 flex-shrink-0">
          <div className="sm:text-center">
            <p className="text-xl font-bold text-slate-900 leading-none">₹{pg.price?.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">/month</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold sm:justify-center">
            Manage <ChevronRight size={13} />
          </div>
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightbox && images.length > 0 && (
        <div className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-9 h-9 flex items-center justify-center" onClick={closeLightbox}>
            <X size={18} />
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 text-xs">{lbIdx + 1} / {images.length}</div>
          <img
            key={lbIdx}
            src={images[lbIdx]?.url}
            alt={pg.name}
            className="max-w-[92vw] max-h-[85vh] object-contain rounded-xl"
            style={{ animation: "lbFade .18s ease" }}
            onClick={e => e.stopPropagation()}
          />
          {images.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full w-10 h-10 flex items-center justify-center" onClick={lbPrev}>
                <ChevronLeft size={20} />
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/25 rounded-full w-10 h-10 flex items-center justify-center" onClick={lbNext}>
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      )}
      <style>{`@keyframes lbFade{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}`}</style>
    </>
  );
}