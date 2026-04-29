"use client";

import { useState, useEffect } from "react";

export default function PaginationWrapper({
  data = [],
  itemsPerPage = 10,
  renderItem,
  page: externalPage,
  onPageChange,
  totalPages: externalTotalPages,
  totalItems = 0, // total count across ALL pages (from server)
}) {
  const isControlled =
    externalPage !== undefined && typeof onPageChange === "function";

  const [internalPage, setInternalPage] = useState(1);

  const page = isControlled ? externalPage : internalPage;
  const setPage = isControlled ? onPageChange : setInternalPage;

  const safeData = Array.isArray(data) ? data : [];

  // if totalPages is passed externally (server-side), use it directly
  // otherwise calculate from local data length (client-side mode)
  const totalPages = externalTotalPages
    ? Math.max(1, externalTotalPages)
    : Math.max(1, Math.ceil(safeData.length / itemsPerPage));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]); // eslint-disable-line

  // in server-side mode data is already the current page slice — render as-is
  // in client-side mode slice it ourselves

  const isRemote = externalTotalPages !== undefined;

  const paginated = isRemote
    ? safeData
    : safeData.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (safeData.length === 0 && !isRemote) return null;

  // ── How many total items exist ──
  // server mode: totalCount prop tells us the real total across all pages
  // client mode: safeData.length is the full list
  // fallback: if not passed, estimate from totalPages × itemsPerPage
  const totalCount = externalTotalPages
    ? totalItems > 0
      ? totalItems
      : totalPages * itemsPerPage
    : safeData.length;

  // ── "Showing X–Y of Z" calculation ──
  // startItem: first item number on this page  e.g. page 2, 5/page → 6
  // endItem:   last item number on this page   e.g. page 2, 5/page → 10
  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalCount);

  // ── Smart page numbers with ellipsis ──
  // e.g. total=10, current=5 → [1, '...', 4, 5, 6, '...', 10]
  function getPageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  }

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div>
      <div className="flex flex-col gap-4">
        {paginated.map((item) => renderItem(item))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 mb-8 pt-4 border-t border-slate-100 flex-col sm:flex-row gap-4">
          {/* Showing X–Y of Z PGs */}
          <p className="text-xs text-[#717171] text-center sm:text-left">
            Showing{" "}
            <span className="font-semibold text-[#222222]">
              {startItem}–{endItem}
            </span>{" "}
            of <span className="font-semibold text-[#222222]">{totalCount}</span>{" "}
            PGs
          </p>

          {/* Prev + page numbers + Next */}
          <div className="flex items-center gap-1 mx-auto sm:mx-0">
            <button
              onClick={() => setPage(Math.max(page - 1, 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-1">
              {pageNumbers.map((num, idx) =>
                num === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-8 text-center text-xs text-slate-400 select-none"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                      page === num
                        ? "bg-[#FF385C] text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    {num}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() => setPage(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
