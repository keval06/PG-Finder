"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  Star,
  CheckCircle,
  Shield,
  Zap,
  Filter,
  X,
  Menu,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const STATS = [
  { value: "2400", suffix: "+", label: "Verified PGs" },
  { value: "98", suffix: "%", label: "Happy Tenants" },
  { value: "180", suffix: "+", label: "Cities" },
  { value: "0", prefix: "₹", label: "Brokerage" },
];

const CITIES = [
  {
    name: "Mumbai",
    count: "340 PGs",
    img: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=500&q=80",
  },
  {
    name: "Bangalore",
    count: "520 PGs",
    img: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=500&q=80",
  },
  {
    name: "Delhi",
    count: "410 PGs",
    img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&q=80",
  },
  {
    name: "Pune",
    count: "280 PGs",
    img: "https://images.unsplash.com/photo-1612810806695-30f7a8258391?w=500&q=80",
  },
  {
    name: "Hyderabad",
    count: "310 PGs",
    img: "https://images.unsplash.com/photo-1621873495884-845a939892d4?w=500&q=80",
  },
  {
    name: "Chennai",
    count: "190 PGs",
    img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&q=80",
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Zero Brokerage",
    desc: "Connect directly with owners. No middlemen, no hidden charges, no surprises.",
  },
  {
    icon: CheckCircle,
    title: "Verified Listings",
    desc: "Every PG personally verified by our team. What you see is what you get.",
  },
  {
    icon: Filter,
    title: "Smart Filters",
    desc: "Filter by gender, food, price, amenities. Find your match in minutes.",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    desc: "Reserve your spot with one click. No calls, no waiting, no uncertainty.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Software Engineer, Bangalore",
    text: "Found my PG in 20 minutes. Filters are incredibly precise and every listing was exactly as described.",
    avatar: "PS",
    stars: 5,
  },
  {
    name: "Arjun Mehta",
    role: "MBA Student, Pune",
    text: "Zero brokerage saved me ₹15,000. Direct owner contact made everything smooth and transparent.",
    avatar: "AM",
    stars: 5,
  },
  {
    name: "Kavya Nair",
    role: "UX Designer, Mumbai",
    text: "Verified listings gave me real peace of mind moving alone. Couldn't recommend more.",
    avatar: "KN",
    stars: 5,
  },
];

function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function Counter({ end, prefix = "", suffix = "", inView }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let cur = 0;
    const step = end / 50;
    const t = setInterval(() => {
      cur += step;
      if (cur >= end) {
        setVal(end);
        clearInterval(t);
      } else setVal(Math.floor(cur));
    }, 28);
    return () => clearInterval(t);
  }, [inView]);
  return (
    <>
      {prefix}
      {val}
      {suffix}
    </>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const [heroRef, heroInView] = useInView();
  const [statRef, statInView] = useInView();
  const [featRef, featInView] = useInView();
  const [citRef, citInView] = useInView();
  const [testRef, testInView] = useInView();
  const [ctaRef, ctaInView] = useInView();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const h = () => setDropOpen(false);
    if (dropOpen) document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [dropOpen]);

  const go = () =>
    router.push(
      query.trim() ? `/home?search=${encodeURIComponent(query)}` : "/home"
    );

  const fly = (show, delay = 0) =>
    `transition-all duration-700 ease-out ${
      delay ? `[transition-delay:${delay}ms]` : ""
    }
     ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 overflow-x-hidden font-['Inter',sans-serif]">
      {/* ══ NAV ═══════════════════════════════════════════════════- */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center cursor-pointer"
            onClick={() => router.push("/")}>
              <span className="text-white text-[10px] font-bold">PG</span>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight cursor-pointer"
            onClick={() => router.push("/")}>
              Finder
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#cities"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Cities
            </a>
            <button
              onClick={() => router.push("/home")}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Browse PGs
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropOpen(!dropOpen);
                  }}
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm hover:border-blue-300 transition-colors shadow-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-[10px] font-semibold">
                      {user.name?.[0]}
                    </span>
                  </div>
                  <span className="font-medium text-slate-900">
                    {user.name?.split(" ")[0]}
                  </span>
                </button>
                {dropOpen && (
                  <div
                    className="absolute right-0 top-10 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 w-44 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => router.push("/profile/edit")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-xl"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => router.push("/bookings")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-xl"
                    >
                      My Bookings
                    </button>

                    <button
                        onClick={() => {
                          router.push("/my-listings");
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-xl"
                      >
                        My Listings
                      </button>
                    <div className="border-t border-slate-100 my-1" />
                    <button
                      onClick={() => {
                        logout();
                        setDropOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors"
                >
                  Sign in
                </button>
                <button
                  onClick={() => router.push("/auth/signup")}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={20} className="text-slate-700" />
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[200] flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenu(false)}
          />
          <div className="relative ml-auto w-72 bg-white h-full flex flex-col p-6 gap-3 shadow-2xl">
            <button
              onClick={() => setMobileMenu(false)}
              className="self-end mb-2"
            >
              <X size={20} className="text-slate-500" />
            </button>
             {user && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-2">
                <p className="text-xs text-blue-400 uppercase tracking-wider mb-0.5">
                  Signed in as
                </p>
                <p className="font-semibold text-slate-900">{user.name}</p>
              </div>
            )}
            <button
              onClick={() => {
                router.push("/home");
                setMobileMenu(false);
              }}
              className="text-left px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-50"
            >
              Browse PGs
            </button>
            {user ? (
              <>
              
                <button
                  onClick={() => {
                    router.push("/profile/edit");
                    setMobileMenu(false);
                  }}
                  className="text-left px-4 py-3 rounded-xl text-sm hover:bg-slate-50"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    router.push("/bookings");
                    setMobileMenu(false);
                  }}
                  className="text-left px-4 py-3 rounded-xl text-sm hover:bg-slate-50"
                >
                  My Bookings
                </button>
                <button
                  onClick={() => {
                    router.push("/my-listings");
                    setMobileMenu(false);
                  }}
                  className="text-left px-4 py-3 rounded-xl text-sm hover:bg-slate-50"
                >
                  My Listings
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenu(false);
                  }}
                  className="text-left px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    router.push("/auth/login");
                    setMobileMenu(false);
                  }}
                  className="text-left px-4 py-3 rounded-xl text-sm hover:bg-slate-50"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    router.push("/auth/signup");
                    setMobileMenu(false);
                  }}
                  className="px-4 py-3 rounded-xl text-sm bg-blue-600 text-white hover:bg-blue-700"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-16"
      >
        {/* blue gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-[#f8fafc] to-slate-50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] max-w-2xl rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] max-w-lg rounded-full bg-indigo-100/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className={`mb-6 ${fly(heroInView)}`}>
              <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                India&apos;s Trusted PG Platform
              </span>
            </div>

            <h1
              className={`text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight mb-5 ${fly(
                heroInView,
                80
              )}`}
            >
              Find your perfect
              <br />
              <span className="text-blue-600">paying guest</span>
              <br />
              home.
            </h1>

            <p
              className={`text-slate-500 text-lg leading-relaxed mb-8 max-w-md ${fly(
                heroInView,
                160
              )}`}
            >
              Thousands of verified PGs across India. Zero brokerage, direct
              owner contact, and a home you&apos;ll actually love.
            </p>

            <div className={fly(heroInView, 240)}>
              <div className="flex bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden max-w-lg focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                <div className="flex items-center pl-4">
                  <Search size={16} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by city, locality or PG name…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && go()}
                  className="flex-1 px-3 py-4 text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
                />
                <button
                  onClick={go}
                  className="m-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  Find PGs <ArrowRight size={14} />
                </button>
              </div>

              <div className="flex items-center gap-4 mt-4 flex-wrap">
                {["2,400+ PGs listed", "Zero brokerage", "180+ cities"].map(
                  (t, i) => (
                    <span
                      key={t}
                      className="flex items-center gap-1.5 text-xs text-slate-400"
                    >
                      {i > 0 && (
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                      )}
                      <CheckCircle size={11} className="text-blue-500" />
                      {t}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* hero image */}
          <div
            className={`relative hidden lg:block transition-all duration-1000 ${
              heroInView
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] max-h-[560px]">
              <img
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=85"
                alt="PG room"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            {/* floating cards */}
            <div className="absolute -left-8 bottom-1/3 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 min-w-[148px]">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                Available Now
              </p>
              <p className="text-2xl font-bold text-slate-900">340</p>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />↑ 12
                new today
              </p>
            </div>
            <div className="absolute -right-4 top-1/4 bg-white rounded-2xl shadow-xl border border-slate-100 p-4">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                Avg. Monthly Rent
              </p>
              <p className="text-2xl font-bold text-slate-900">₹8,200</p>
              <div className="flex items-center gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={10}
                    className="fill-blue-500 text-blue-500"
                  />
                ))}
                <span className="text-xs text-slate-400 ml-1">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════════ */}
      <section ref={statRef} className="bg-blue-600 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`transition-all duration-700 [transition-delay:${
                  i * 100
                }ms] ${
                  statInView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5"
                }`}
              >
                <p className="text-4xl sm:text-5xl font-bold text-white mb-1 tracking-tight">
                  <Counter
                    end={parseInt(s.value)}
                    prefix={s.prefix || ""}
                    suffix={s.suffix || ""}
                    inView={statInView}
                  />
                </p>
                <p className="text-xs text-blue-200 uppercase tracking-widest font-medium">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════ */}
      <section
        ref={featRef}
        id="features"
        className="py-20 sm:py-28 bg-[#f8fafc]"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className={`mb-14 ${fly(featInView)}`}>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
              Why PGFinder
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-slate-900 leading-tight">
              Everything you need,
              <br />
              <span className="text-slate-400 font-normal">
                nothing you don't.
              </span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`bg-white border border-slate-200 rounded-2xl p-7 hover:border-blue-300 hover:shadow-md hover:shadow-blue-50 transition-all group ${fly(
                    featInView,
                    i * 80
                  )}`}
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CITIES ════════════════════════════════════════════════ */}
      <section ref={citRef} id="cities" className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className={`mb-12 ${fly(citInView)}`}>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
              Explore
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-slate-900">
              PGs in cities
              <br />
              <span className="text-slate-400 font-normal">
                that matter most.
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {CITIES.map((c, i) => (
              <button
                key={c.name}
                onClick={() => router.push(`/home?city=${c.name}`)}
                className={`relative rounded-2xl overflow-hidden aspect-[3/4] group cursor-pointer text-left transition-all duration-700 [transition-delay:${
                  (i % 3) * 80
                }ms] ${
                  citInView ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
              >
                <img
                  src={c.img}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                  <div>
                    <p className="text-white font-bold text-lg leading-tight">
                      {c.name}
                    </p>
                    <p className="text-white/60 text-xs mt-0.5">{c.count}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                    <ArrowRight size={13} className="text-white" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
            Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-14 text-slate-900">
            3 steps to your <span className="text-blue-600">new home.</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                n: "01",
                title: "Search",
                desc: "Enter your city or locality and use smart filters to narrow down.",
              },
              {
                n: "02",
                title: "Explore",
                desc: "Browse verified PG listings with real photos and honest reviews.",
              },
              {
                n: "03",
                title: "Book",
                desc: "Book instantly with zero brokerage. Move in hassle-free.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="bg-white border border-slate-200 rounded-2xl p-8 text-left hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <span className="text-4xl font-bold text-blue-100 block mb-4">
                  {s.n}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════════ */}
      <section ref={testRef} className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className={`mb-12 ${fly(testInView)}`}>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
              Reviews
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 text-slate-900">
              Real people,
              <br />
              <span className="text-slate-400 font-normal">real homes.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className={`bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-700 [transition-delay:${
                  i * 100
                }ms] ${
                  testInView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5"
                }`}
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star
                      key={j}
                      size={13}
                      className="fill-blue-500 text-blue-500"
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-5">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════ */}
      <section
        ref={ctaRef}
        className="bg-blue-600 py-24 sm:py-32 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-600 to-blue-800 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blue-800/40 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-8">
          <span
            className={`inline-block text-xs font-semibold text-blue-200 uppercase tracking-widest border border-blue-400/40 bg-blue-500/30 px-4 py-1.5 rounded-full mb-6 ${
              ctaInView ? "opacity-100" : "opacity-0"
            } transition-opacity duration-700`}
          >
            Start for free
          </span>
          <h2
            className={`text-4xl sm:text-5xl font-bold text-white leading-tight mb-4 ${fly(
              ctaInView,
              100
            )}`}
          >
            Your next home is
            <br />
            one search away.
          </h2>
          <p
            className={`text-blue-200 text-base mb-10 max-w-md mx-auto leading-relaxed ${fly(
              ctaInView,
              200
            )}`}
          >
            Join thousands of tenants who found their perfect PG without paying
            a single rupee in brokerage.
          </p>
          <div
            className={`flex gap-3 justify-center flex-wrap ${fly(
              ctaInView,
              300
            )}`}
          >
            <button
              onClick={() => router.push("/home")}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Browse PGs →
            </button>
            <button
              onClick={() => router.push("/auth/signup")}
              className="bg-blue-500/40 hover:bg-blue-500/60 text-white border border-white/20 hover:border-white/40 px-8 py-3.5 rounded-xl font-medium text-sm transition-all"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════ */}
      <footer className="bg-slate-900 py-10 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">PG</span>
            </div>
            <span className="text-white font-semibold text-sm">Finder</span>
          </div>
          <p className="text-slate-500 text-xs">
            © 202 PGFinder. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-slate-500 hover:text-blue-400 text-xs uppercase tracking-wider transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
