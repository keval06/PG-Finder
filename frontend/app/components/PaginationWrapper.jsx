
import { useState } from "react";
import PGCard from "./PGCard";

const PAGE_SIZE = 5;

export default function PaginationWrapper({ data }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const paginated = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      {paginated.map((pg) => (
        <PGCard key={pg._id} pg={pg} />
      ))}

      {/* Pagination */}

      <div className="flex justify-center items-center gap-2 mt-4 mb-8">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg border bg-white disabled:opacity-40 hover:bg-gray-50"
        >
          ← Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => setPage(num)}
            className={`px-4 py-2 rounded-lg border ${
              page === num
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-lg border bg-white disabled:opacity-40 hover:bg-gray-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
