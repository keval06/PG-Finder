"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { imageApi } from "../../lib/api/image";
const API = process.env.NEXT_PUBLIC_API_URL;


export default function InfoCard({ activePin, avg, count, setActivePin }) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [images, setImages] = useState([]);

  // Fetch images for this PG from /api/images/:pgId
 useEffect(() => {
  if (!activePin?._id) return;
  setIdx(0);
  setImages([]);
  imageApi.getByPgId(activePin._id)
    .then(data => {
      const urls = Array.isArray(data)
        ? data.map(i => i?.url).filter(Boolean)
        : [];
      setImages(urls.length ? urls : [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80"
      ]);
    })
    .catch(() => setImages([
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80"
    ]));
}, [activePin._id]);

  const genderLabel = { male: "Boys", female: "Girls", mix: "Co-ed" };
  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); };

  return (
    <div
      onClick={() => router.push(`/pg/${activePin._id}`)}
      className="cursor-pointer w-full bg-white rounded-2xl overflow-hidden"
    >
      {/* IMAGE SLIDER */}
      <div className="relative w-full h-44 bg-slate-100">
        {images.length > 0 ? (
          <img
            src={images[idx]}
            alt={activePin.name}
            className="w-full h-full object-cover"
            onError={e => {
              e.target.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80";
            }}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 animate-pulse" />
        )}

        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); setActivePin(null); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 flex items-center justify-center text-xs font-bold text-gray-700 shadow-md hover:bg-white"
        >✕</button>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/95 flex items-center justify-center font-bold text-gray-700 shadow-md text-base"
            >‹</button>
            <button onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/95 flex items-center justify-center font-bold text-gray-700 shadow-md text-base"
            >›</button>
          </>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-white scale-110" : "bg-white/50"}`} />
            ))}
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="px-3 pt-2.5 pb-3">
        <div className="flex justify-between items-start gap-2 mb-0.5">
          <p className="text-[13px] font-semibold text-gray-900 truncate">{activePin.name}</p>
          <span className="text-[12px] font-medium text-gray-900 shrink-0">
            ★ {avg ?? "New"}
            {count > 0 && <span className="text-gray-400 font-normal text-[11px]"> ({count})</span>}
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mb-2">
          {activePin.city} · {genderLabel[activePin.gender] || activePin.gender}
        </p>
        <div className="h-px bg-gray-100 mb-2" />
        <div className="flex items-baseline gap-1">
          <span className="text-[15px] font-bold text-gray-900">₹{activePin.price?.toLocaleString("en-IN")}</span>
          <span className="text-[11px] text-gray-400">/ month</span>
        </div>
      </div>
    </div>
  );
}