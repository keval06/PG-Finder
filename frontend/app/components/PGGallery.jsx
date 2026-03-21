"use client";

import { useState } from "react";
import { Image as ImageIcon } from "lucide-react";

const CATEGORIES = [
  "room",
  "kitchen",
  "bathroom",
  "toilet",
  "building",
  "amenities",
];

export default function PGGallery({ images }) {
  const [activeImage, setActiveImage] = useState(0);
  const [activeCategory, setActiveCategory] = useState("room");

  const filtered = images.filter((img) => img.category === activeCategory);

  return (
    <div className="flex flex-col gap-4">
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-4">
          {/* Main Image */}
          <img
            src={filtered[activeImage]?.url}
            className="w-full h-[380px] object-cover rounded-3xl shadow-sm border border-slate-100 transition duration-500 hover:scale-[1.005]"
            alt={activeCategory}
          />

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveImage(0);
                }}
                className={`px-4 py-1.5 rounded-full capitalize text-xs font-medium border flex-shrink-0 transition-all ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "text-slate-600 border-slate-200 hover:border-blue-300 bg-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {filtered.map((img, i) => (
              <img
                key={img._id}
                src={img?.url}
                onClick={() => setActiveImage(i)}
                alt={img.category}
                className={`w-20 h-14 object-cover rounded-xl cursor-pointer border-2 flex-shrink-0 transition-all ${
                  activeImage === i
                    ? "border-blue-500 scale-105 ring-4 ring-blue-50"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Empty State Placeholder */}
          <div className="w-full h-[380px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2">
              <ImageIcon size={32} className="text-slate-300" />
            </div>
            <p className="text-base font-semibold text-slate-500">
              No {activeCategory} images yet
            </p>
            <p className="text-sm text-slate-400">
              Owner hasn&apos;t uploaded any photos for this area
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveImage(0);
                }}
                className={`px-4 py-1.5 rounded-full capitalize text-xs font-medium border flex-shrink-0 transition-all ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "text-slate-600 border-slate-200 hover:border-blue-300 bg-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
