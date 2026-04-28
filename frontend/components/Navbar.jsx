"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, User, X, SlidersHorizontal, MapPin } from "lucide-react";
import { useSearch } from "../app/context/SearchContext";
import { useAuth } from "../app/context/AuthContext";
import ConfirmModal from "./ConfirmModal";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  //? Context API
  const { query, setQuery, setDrawerOpen, filterCount } = useSearch();
  const { user, logout, ready } = useAuth(); //? logged in user + logout fn

  const [open, setOpen] = useState(false); //?dropdown menu open
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [scrolled, setScrolled] = useState(false); // *? Bool -> has user scrolled > 10px? > controls the navbar shadow:
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const isLanding = pathname === "/";
  const isBrowse = pathname === "/home" || pathname === "/my-listings";

  // Fetch suggestions — searches both DB (PG names/cities) and Nominatim (locations)
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const API = `${window.location.protocol}//${window.location.hostname}:5000`;

        // Fire both requests in parallel
        const [dbRes, nominatimRes] = await Promise.allSettled([
          fetch(`${API}/api/pg?q=${encodeURIComponent(query)}&limit=3&page=1`)
            .then(r => r.ok ? r.json() : { data: [] }),
          fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=in&limit=4&dedupe=1&accept-language=en`)
            .then(r => r.json()),
        ]);

        const results = [];

        // DB results → extract unique cities from matching PGs
        if (dbRes.status === "fulfilled" && dbRes.value?.data?.length) {
          const seenCities = new Set();
          for (const pg of dbRes.value.data) {
            const city = pg.city?.trim();
            if (city && !seenCities.has(city.toLowerCase())) {
              seenCities.add(city.toLowerCase());
              results.push({
                _source: "db",
                name: city,
                display_name: `${city} — ${dbRes.value.totalCount || "?"} PGs found`,
                address: { city, state: "" },
              });
            }
          }
        }

        // Nominatim results — deduplicated
        if (nominatimRes.status === "fulfilled" && nominatimRes.value?.length) {
          const unique = Array.from(new Map(nominatimRes.value.map(item => [item.display_name, item])).values());
          // Don't add if we already have that city from DB
          for (const item of unique) {
            const city = item.address?.city || item.address?.town || item.address?.village || item.name;
            const alreadyHave = results.some(r => r.name?.toLowerCase() === city?.toLowerCase());
            if (!alreadyHave) results.push(item);
          }
        }

        setSuggestions(results.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300); // debounce 300ms
    return () => clearTimeout(timer);
  }, [query]);

  // *? -> useEffect 1 — Scroll Listener
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);

    window.addEventListener("scroll", fn, { passive: true });

    return () => window.removeEventListener("scroll", fn);
  }, []);

  // *? -> useEffect 2 — Click Outside to Close Dropdown / Autocomplete
  useEffect(() => {
    const h = () => {
      setOpen(false);
      setShowSuggestions(false);
    };
    if (open || showSuggestions) document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [open, showSuggestions]);

  // ?3 things, clean order: clear auth → close UI → navigate.
  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    setOpen(false);
    router.push("/");
  };

  if (isLanding) return null;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200"
            : "bg-white border-b border-slate-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* LEFT: LOGO */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center flex-shrink-0"
          >
            <img src="/logo.png" alt="PGVista Logo" className="h-10 sm:h-11 w-auto object-contain" />
          </button>

          {/* MIDDLE: SEARCH + FILTER (desktop) */}
          <div className="hidden md:flex flex-1 justify-center max-w-2xl px-4">
           <div className="flex items-center gap-2 w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all z-10 relative">
              <Search size={15} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search city or PG name…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                className="flex-1 text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
              />
              {query && (
                <button onClick={() => { setQuery(""); setSuggestions([]); setShowSuggestions(false); }}>
                  <X
                    size={17}
                    className="text-slate-400 hover:text-slate-600"
                  />
                </button>
              )}
            </div>
            
            {/* Filter button with text (desktop only) */}
            {isBrowse && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm relative group"
              >
                <SlidersHorizontal size={15} className="text-slate-500" />
                <span>Filter</span>
                {filterCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold absolute -top-1.5 -right-1.5 shadow-sm border border-white">
                    {filterCount}
                  </span>
                )}
              </button>
            )}

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-12 left-0 w-full bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50">
                {suggestions.map((s, i) => {
                  const city = s.address?.city || s.address?.town || s.address?.village || s.name;
                  const state = s.address?.state || "";
                  return (
                    <button
                      key={i}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
                      onClick={() => {
                        setQuery(city);
                        setShowSuggestions(false);
                        setSuggestions([]);
                        // Always push to /home with query — triggers SSR refetch
                        router.push(`/home?q=${encodeURIComponent(city)}`);
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                        <MapPin size={14} />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold text-slate-900 truncate">{city}</span>
                        <span className="text-xs text-slate-500 truncate">{state ? `${state}, India` : s.display_name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
           </div>
          </div>

          {/* RIGHT: USER SECTION */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!ready ? (
              // Placeholder with same dimensions as the sign-in buttons so layout doesn't shift
              <div className="w-20 h-8" />
            ) : user ? (
              <>
                <span className="hidden sm:block text-sm text-slate-500">
                  Hey,{" "}
                  <span className="text-slate-900 font-medium truncate max-w-[100px]">
                    {user.name?.split(" ")[0]?.slice(0, 10)}
                    {(user.name?.split(" ")[0]?.length || 0) > 10 ? "..." : ""}
                  </span>
                </span>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpen(!open);
                    }}
                    className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <User size={15} />
                  </button>

                  {open && (
                    <div
                      className="absolute right-0 top-10 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 w-48 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                          Signed in as
                        </p>
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user.name}
                        </p>
                      </div>
                      {/* Home */}

                      <button
                        onClick={() => {
                          router.push("/");
                          setOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        Home
                      </button>

                      {pathname !== "/home" && (
                        <button
                          onClick={() => {
                            router.push("/home");
                            setOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                          Browse PGs
                        </button>
                      )}

                      {/* Edit Profile */}
                      <button
                        onClick={() => {
                          router.push("/profile/edit");
                          setOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        Edit Profile
                      </button>

                      {/* My Bookings */}
                      <button
                        onClick={() => {
                          router.push("/bookings");
                          setOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        My Bookings
                      </button>

                      {/* My Listings */}
                      <button
                        onClick={() => {
                          router.push("/my-listings");
                          setOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        My Listings
                      </button>

                      {/* Received Bookings */}
                      <button
                        onClick={() => {
                          router.push("/received-bookings");
                          setOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        Received Bookings
                      </button>

                      {/* Logout */}
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {/* Sign In */}
                <button
                  onClick={() => router.push("/auth/login")}
                  className="text-sm text-slate-500 hover:text-slate-900 font-medium px-3 py-1.5 transition-colors"
                >
                  Sign in
                </button>

                {/* Sign up */}
                <button
                  onClick={() => router.push("/auth/signup")}
                  className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE SEARCH */}
        <div className="md:hidden border-t border-slate-200 px-4 py-2 relative" onClick={(e) => e.stopPropagation()}>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 focus-within:bg-white focus-within:border-blue-400 transition-all">
              <Search size={14} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search city or PG name…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400"
              />
              {query && (
                <button onClick={() => { setQuery(""); setSuggestions([]); }}>
                  <X size={13} className="text-slate-400 shadow-sm" />
                </button>
              )}
            </div>
            
            {isBrowse && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-[38px] flex-shrink-0 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors relative"
                aria-label="Filter"
              >
                <SlidersHorizontal size={16} />
                {filterCount > 0 && (
                  <span className="bg-blue-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold absolute -top-1.5 -right-1.5 shadow-sm border border-white">
                    {filterCount}
                  </span>
                )}
              </button>
            )}
          </div>
          
          {/* Autocomplete Dropdown (Mobile) */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-14 left-4 right-4 bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden z-[60]">
              {suggestions.map((s, i) => {
                const city = s.address?.city || s.address?.town || s.address?.village || s.name;
                const state = s.address?.state || "";
                return (
                  <button
                    key={i}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
                    onClick={() => {
                      setQuery(city);
                      setShowSuggestions(false);
                      setSuggestions([]);
                      router.push(`/home?q=${encodeURIComponent(city)}`);
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                      <MapPin size={14} />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold text-slate-900 truncate">{city}</span>
                      <span className="text-xs text-slate-500 truncate">{state ? `${state}, India` : s.display_name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Logout?"
        description="Are you sure you want to sign out of your account?"
        confirmText="Yes, Logout"
        variant="danger"
      />
    </>
  );
}
