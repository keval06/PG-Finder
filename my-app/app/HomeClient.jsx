"use client";

import { useSearch } from "./context/SearchContext";
import PGCard from "./components/PGCard";

export default function HomeClient({ data }) {
  const { query } = useSearch();

  const filtered = query.trim()
    ? data.filter(
        (pg) =>
          (pg.name || "").toLowerCase().includes(query.toLowerCase()) ||
          (pg.city || "").toLowerCase().includes(query.toLowerCase())
      )
    : data;

  return (
    <div className="flex flex-col items-center gap-6">
      {filtered.length === 0 ? (
        <p className="text-gray-400 mt-10">No PGs found for "{query}"</p>
      ) : (
        filtered.map((pg) => <PGCard key={pg._id} pg={pg} />)
      )}
    </div>
  );
}
