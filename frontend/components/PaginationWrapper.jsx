"use client";

import { useState, useEffect } from "react";

export default function PaginationWrapper({
  data = [],
  itemsPerPage = 5,
  renderItem,
  // optional controlled mode — pass both or neither
  page: externalPage,
  onPageChange,
}) {
  const isControlled =
    externalPage !== undefined && typeof onPageChange === "function";

  const [internalPage, setInternalPage] = useState(1);

  const page    = isControlled ? externalPage : internalPage;
  const setPage = isControlled ? onPageChange : setInternalPage;

  const safeData   = Array.isArray(data) ? data : [];
  const totalPages = Math.max(1, Math.ceil(safeData.length / itemsPerPage));

  // clamp page if data shrinks (e.g. after cancel, filter, delete)
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages]); // eslint-disable-line

  const start     = (page - 1) * itemsPerPage;
  const paginated = safeData.slice(start, start + itemsPerPage);

  if (safeData.length === 0) return null;

  return (
    <div>
      <div className="flex flex-col gap-4">
        {paginated.map((item) => renderItem(item))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4 mb-8 flex-wrap">
          <button
            onClick={() => setPage(Math.max(page - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border bg-white disabled:opacity-40 hover:bg-gray-50 text-sm"
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setPage(num)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                page === num
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => setPage(Math.min(page + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border bg-white disabled:opacity-40 hover:bg-gray-50 text-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}