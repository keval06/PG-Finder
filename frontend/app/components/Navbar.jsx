"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, User, X } from "lucide-react";
import { useSearch } from "../context/SearchContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  //? Context API
  const { query, setQuery } = useSearch();
  const { user, logout } = useAuth();  //? logged in user + logout fn
  
  //? UI mattering
  const [open, setOpen] = useState(false);//?dropdown menu open

  const [scrolled, setScrolled] = useState(false);// *? Bool -> has user scrolled > 10px? > controls the navbar shadow:

  const isLanding = pathname === "/";


  // *? -> useEffect 1 — Scroll Listener
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);

    window.addEventListener("scroll", fn, { passive: true });
    
    return () => window.removeEventListener("scroll", fn);
  }, []);

// *? -> useEffect 2 — Click Outside to Close Dropdown
  useEffect(() => {
    const h = () => setOpen(false);
    if (open) 
      document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [open]);

  // ?3 things, clean order: clear auth → close UI → navigate.
  const handleLogout = () => {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          {/* LOGO */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold tracking-tight">
                PG
              </span>
            </div>
            <span className="font-semibold text-slate-900 text-sm tracking-tight">
              Finder
            </span>
          </button>

          {/* SEARCH desktop */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <div className="flex items-center w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
              
              <Search size={15} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search city or PG name…"
                value={query}   //? Tie the input to the cloud storage text
                onChange={(e) => setQuery(e.target.value)}  //?When they type, instantly update the cloud!
                className="flex-1 text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
              />
              {query && (
                <button onClick={() => setQuery("")}>
                  <X
                    size={17}
                    className="text-slate-400 hover:text-slate-600"
                  />
                </button>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="ml-auto flex items-center gap-2">
            {user ? 
            (
              <>
                <span className="hidden sm:block text-sm text-slate-500">
                  Hey,{" "}
                  <span className="text-slate-900 font-medium">
                    {user.name?.split(" ")[0]}
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
                  
                  {open && 
                  (
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
                      

                      {
                        pathname !== '/home' && 
                        <button
                        onClick={() => {
                          router.push("/home");
                          setOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                        >
                        Browse PGs
                        </button>
                      }
                      
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

                      {/* Logout */}
                    <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                  
                </div>
              </>
            ) 
            : 
            (
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
        <div className="md:hidden border-t border-slate-200 px-4 py-2">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 gap-2 focus-within:bg-white focus-within:border-blue-400 transition-all">
           
            <Search size={14} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search city or PG name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400"
            />

            {query && (
              <button onClick={() => setQuery("")}>
                <X size={13} className="text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
