"use client";

import { User, Search } from "lucide-react";
import Image from "next/image";
import { useSearch } from "../context/SearchContext";

export default function Navbar() {
  const { query, setQuery } = useSearch();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-md px-6 py-3 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer">
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image
            src="/logo.png"
            alt="logo"
            fill
            className="rounded-full object-cover"
          />
        </div>
        <span className="font-bold text-lg">PG Finder</span>
      </div>

      {/* Search */}
      <div className="flex items-center border rounded-lg px-3 py-1">
        <input
          type="text"
          placeholder="Search city or name..."
          className="outline-none w-64"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query ? (
          <span
            onClick={() => setQuery("")}
            className="cursor-pointer ml-2 text-gray-400 text-lg"
          >
            ✕
          </span>
        ) : (
          <Search size={20} className="ml-2 text-gray-500" />
        )}
      </div>

      {/* User */}
      <div className="bg-gray-200 p-2 rounded-full cursor-pointer">
        <User size={30} />
      </div>
    </nav>
  );
}
