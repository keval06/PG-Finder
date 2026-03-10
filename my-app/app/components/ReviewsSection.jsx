"use client";

import { useState } from "react";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Highest", value: "highest" },
  { label: "Lowest", value: "lowest" },
];

export default function ReviewsSection({ reviews, avgRating }) {
  const [sort, setSort] = useState("newest");

  const sorted = [...reviews].sort((a, b) => {
    if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === "highest") return b.star - a.star;
    if (sort === "lowest") return a.star - b.star;
    return 0;
  });

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header — count + avg + sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold">
            Reviews
            <span className="text-gray-500 font-normal text-base ml-2">
              ({reviews.length})
            </span>
            {avgRating && (
              <span className="text-yellow-500 text-base font-normal ml-2">
                ★ {avgRating}/5
              </span>
            )}
          </h2>
        </div>

        {/* Sort tabs */}
        {reviews.length > 1 && (
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 self-start sm:self-auto">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                  sort === opt.value
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-gray-400 text-sm">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((r) => (
            <div
              key={r._id}
              className="border border-gray-100 rounded-xl p-4 bg-gray-50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <p className="font-medium text-sm capitalize">
                    {r.user?.name || "Anonymous"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-yellow-500 text-sm flex-shrink-0">
                  {"★".repeat(r.star)}
                  {"☆".repeat(5 - r.star)}
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-2">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
