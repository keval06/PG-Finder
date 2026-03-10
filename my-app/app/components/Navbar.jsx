"use client";

import { User, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSearch } from "../context/SearchContext";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const router = useRouter();
  const { query, setQuery } = useSearch();
  const { user, logout } = useAuth(); // ← single source of truth

  const [open, setOpen] = useState(false);

  // close dropdown on outside click
  useEffect(() => {
    const handler = () => setOpen(false);
    if (open) document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [open]);

  const handleLogout = () => {
    logout(); // context clears localStorage + sets user to null
    setOpen(false);
    router.push("/auth/login");
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white shadow-md px-6 py-3 flex justify-between items-center">
        {/* LOGO */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="relative w-10 h-10">
            <Image
              src="/logo.png"
              alt="logo"
              fill
              className="object-cover rounded-full"
            />
          </div>
          <span className="font-bold text-lg">PG Finder</span>
        </div>

        {/* SEARCH — hidden on mobile */}
        <div className="hidden md:flex items-center border rounded-lg px-3 py-1">
          <input
            type="text"
            placeholder="Search city or name..."
            className="outline-none w-64"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query ? (
            <span
              className="cursor-pointer ml-2 text-gray-400"
              onClick={() => setQuery("")}
            >
              ✕
            </span>
          ) : (
            <Search size={20} className="ml-2 text-gray-500" />
          )}
        </div>

        {/* USER SECTION */}
        <div className="relative flex items-center gap-3">
          {user && (
            <span className="hidden sm:block text-sm font-medium">
              Hey, {user.name}
            </span>
          )}

          <div
            onClick={(e) => {
              e.stopPropagation();
              if (user) setOpen(!open);
              else router.push("/auth/login");
            }}
            className="bg-gray-200 p-2 rounded-full cursor-pointer hover:bg-gray-300"
          >
            <User size={26} />
          </div>

          {open && user && (
            <div
              className="absolute right-0 top-14 bg-white shadow-lg rounded-xl p-2 w-44 border border-gray-100 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sm:hidden px-3 py-2 mb-1 border-b border-gray-100">
                <p className="text-xs text-gray-400">Signed in as</p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user.name}
                </p>
              </div>

              <button
                onClick={() => {
                  router.push("/profile/edit");
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Profile
              </button>

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* MOBILE SEARCH */}
      <div className="md:hidden sticky top-[57px] z-40 bg-white border-b border-gray-100 px-4 py-2 shadow-sm">
        <div className="flex items-center border rounded-lg px-3 py-1.5">
          <input
            type="text"
            placeholder="Search city or name..."
            className="outline-none flex-1 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query ? (
            <span
              className="cursor-pointer ml-2 text-gray-400 text-sm"
              onClick={() => setQuery("")}
            >
              ✕
            </span>
          ) : (
            <Search size={16} className="ml-2 text-gray-500" />
          )}
        </div>
      </div>
    </>
  );
}
