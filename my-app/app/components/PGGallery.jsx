"use client";

import { useState } from "react";

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

  // If no images in selected category, show placeholder
  if (filtered.length === 0) {
    return (
      <div>
        <div className="w-full h-[420px] bg-gray-200 rounded-2xl flex items-center justify-center">
          <p className="text-gray-500 capitalize">No {activeCategory} images available</p>
        </div>

        {/* Categories still show */}
        <div className="flex gap-3 mt-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setActiveImage(0);
              }}
              className={`px-4 py-1 rounded-full capitalize text-sm border ${
                activeCategory === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-600 border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Main Image */}
      <img
        // ?filtered[active] = current category array at selected index
        src={filtered[activeImage]?.url} 
        className="w-full h-[420px] object-cover rounded-2xl cursor-pointer"
        alt={activeCategory}
      />

      {/* Category Tabs */}
      <div className="flex gap-3 mt-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setActiveImage(0);
            }}
            className={`px-4 py-1 rounded-full capitalize text-sm border ${
              activeCategory === cat
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-600 border-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 mt-3 flex-wrap">
        {filtered.map((img, i) => (
          <img
            key={img._id}
            src={img?.url}
            onClick={() => setActiveImage(i)}
            alt={img.category}
            className={`w-24 h-16 object-cover rounded cursor-pointer border-2 ${
              activeImage === i ? "border-blue-500" : "border-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
