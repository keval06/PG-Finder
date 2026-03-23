"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, ArrowRight, Star, CheckCircle, Shield,
  Zap, Filter, X, Menu, MapPin, Home, TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ── DATA ──────────────────────────────────────────────────────────────────────
const STATS = [
  { value: 2400, suffix: "+", label: "Verified PGs" },
  { value: 98,   suffix: "%", label: "Happy Tenants" },
  { value: 180,  suffix: "+", label: "Cities" },
  { value: 0,  prefix: "₹",  label: "Brokerage" },
];

const CITIES = [
  { name: "Mumbai",    count: "340 PGs", img: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=600&q=80" },
  { name: "Bangalore", count: "520 PGs", img: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600&q=80" },
  { name: "Delhi",     count: "410 PGs", img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80" },
  { name: "Pune",      count: "280 PGs", img: "https://images.unsplash.com/photo-1612810806695-30f7a8258391?w=600&q=80" },
  { name: "Hyderabad", count: "310 PGs", img: "https://images.unsplash.com/photo-1621873495884-845a939892d4?w=600&q=80" },
  { name: "Chennai",   count: "190 PGs", img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80" },
];

const FEATURES = [
  { icon: Shield,      title: "Zero Brokerage",    desc: "Connect directly with owners. No middlemen, no hidden charges, no surprises." },
  { icon: CheckCircle, title: "Verified Listings",  desc: "Every PG personally verified by our team. What you see is what you get." },
  { icon: Filter,      title: "Smart Filters",      desc: "Filter by gender, food, price, amenities. Find your match in minutes." },
  { icon: Zap,         title: "Instant Booking",    desc: "Reserve your spot with one click. No calls, no waiting, no uncertainty." },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", role: "Software Engineer, Bangalore", text: "Found my PG in 20 minutes. Filters are incredibly precise and every listing was exactly as described.", avatar: "PS", stars: 5 },
  { name: "Arjun Mehta",  role: "MBA Student, Pune",            text: "Zero brokerage saved me ₹15,000. Direct owner contact made everything smooth and transparent.",           avatar: "AM", stars: 5 },
  { name: "Kavya Nair",   role: "UX Designer, Mumbai",          text: "Verified listings gave me real peace of mind moving alone. Couldn't recommend more.",                     avatar: "KN", stars: 5 },
];

// ── HOOKS ─────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
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
    const step = end / 60;
    const t = setInterval(() => {
      cur += step;
      if (cur >= end) { setVal(end); clearInterval(t); }
      else setVal(Math.floor(cur));
    }, 22);
    return () => clearInterval(t);
  }, [inView, end]);
  return <>{prefix}{val}{suffix}</>;
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [query,       setQuery]       = useState("");
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileMenu,  setMobileMenu]  = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const [mounted,     setMounted]     = useState(false);

  const [heroRef,  heroInView]  = useInView(0.05);
  const [statRef,  statInView]  = useInView();
  const [featRef,  featInView]  = useInView();
  const [citRef,   citInView]   = useInView();
  const [testRef,  testInView]  = useInView();
  const [ctaRef,   ctaInView]   = useInView();

  useEffect(() => { setMounted(true); }, []);

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

  const go = () => router.push(query.trim() ? `/home?q=${encodeURIComponent(query)}` : "/home");

  // Fade + slide up utility
  const reveal = (show, delay = 0) =>
    `transition-all duration-700 ease-out ${delay ? `delay-[${delay}ms]` : ""} ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 overflow-x-hidden" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

      {/* ══ NAVBAR ════════════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push("/")}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200">
              <span className="text-white text-[10px] font-bold tracking-tight">PG</span>
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-[15px]">Finder</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {[["#features","Features"],["#cities","Cities"],].map(([href, label]) => (
              <a key={label} href={href} className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">{label}</a>
            ))}
            <button onClick={() => router.push("/home")} className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">Browse PGs</button>
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setDropOpen(!dropOpen); }}
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm hover:border-blue-300 transition-all shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">{user.name?.[0]}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{user.name?.split(" ")[0]}</span>
                </button>
                {dropOpen && (
                  <div className="absolute right-0 top-11 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/60 p-1.5 w-48 z-50" onClick={(e) => e.stopPropagation()}>
                    {[
                      { label: "Edit Profile",       path: "/profile/edit" },
                      { label: "My Bookings",         path: "/bookings" },
                      { label: "My Listings",         path: "/my-listings" },
                      { label: "Received Bookings",   path: "/received-bookings" },
                    ].map(({ label, path }) => (
                      <button key={label} onClick={() => router.push(path)} className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 rounded-xl text-slate-700 font-medium transition-colors">{label}</button>
                    ))}
                    <div className="border-t border-slate-100 my-1" />
                    <button onClick={() => { logout(); setDropOpen(false); }} className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => router.push("/auth/login")} className="text-sm text-slate-600 hover:text-slate-900 font-semibold transition-colors">Sign in</button>
                <button onClick={() => router.push("/auth/signup")} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-95">Get Started</button>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors" onClick={() => setMobileMenu(true)}>
            <Menu size={20} className="text-slate-700" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[200] flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenu(false)} />
          <div className="relative ml-auto w-72 bg-white h-full flex flex-col p-6 gap-2 shadow-2xl">
            <button onClick={() => setMobileMenu(false)} className="self-end mb-3 p-1.5 hover:bg-slate-100 rounded-lg">
              <X size={18} className="text-slate-500" />
            </button>
            {user && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 mb-2">
                <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-0.5 font-semibold">Signed in as</p>
                <p className="font-bold text-slate-900">{user.name}</p>
              </div>
            )}
            {[
              { label: "Browse PGs",        path: "/home",              show: true },
              { label: "Edit Profile",       path: "/profile/edit",      show: !!user },
              { label: "My Bookings",        path: "/bookings",          show: !!user },
              { label: "My Listings",        path: "/my-listings",       show: !!user },
              { label: "Received Bookings",  path: "/received-bookings", show: !!user },
            ].filter(i => i.show).map(({ label, path }) => (
              <button key={label} onClick={() => { router.push(path); setMobileMenu(false); }} className="text-left px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-50 text-slate-700 transition-colors">{label}</button>
            ))}
            {user ? (
              <button onClick={() => { logout(); setMobileMenu(false); }} className="text-left px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-1">Logout</button>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <button onClick={() => { router.push("/auth/login"); setMobileMenu(false); }} className="px-4 py-3 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50">Sign In</button>
                <button onClick={() => { router.push("/auth/signup"); setMobileMenu(false); }} className="px-4 py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700">Get Started</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ HERO ══════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16 overflow-hidden">

        {/* Ambient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 pointer-events-none" />
        <div className="absolute top-[-10%] right-[-5%] w-[55vw] h-[55vw] max-w-3xl rounded-full bg-blue-100/50 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] max-w-xl rounded-full bg-indigo-100/40 blur-[80px] pointer-events-none" />

        {/* Subtle dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.35,
        }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div>
            {/* Badge */}
            <div className={`mb-6 ${reveal(mounted, 0)}`}>
              <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-700 text-xs font-bold px-4 py-2 rounded-full shadow-sm shadow-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                India&apos;s Trusted PG Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className={`text-[2.75rem] sm:text-5xl lg:text-[3.5rem] font-black leading-[1.08] tracking-tight mb-6 ${reveal(mounted, 80)}`}>
              Find your perfect
              <br />
              <span className="relative inline-block">
                <span className="text-blue-600">paying guest</span>
                {/* underline accent */}
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 opacity-60" />
              </span>
              <br />
              home.
            </h1>

            <p className={`text-slate-500 text-lg leading-relaxed mb-9 max-w-md ${reveal(mounted, 160)}`}>
              Thousands of verified PGs across India. Zero brokerage, direct owner contact, and a home you&apos;ll actually love.
            </p>

            {/* Search box */}
            <div className={reveal(mounted, 240)}>
              <div className="flex bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-100/80 overflow-hidden max-w-lg focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-200">
                <div className="flex items-center pl-4">
                  <Search size={16} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="City, locality or PG name…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && go()}
                  className="flex-1 px-3 py-4 text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
                />
                <button
                  onClick={go}
                  className="m-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md shadow-blue-200"
                >
                  Find PGs <ArrowRight size={14} />
                </button>
              </div>

              {/* Trust chips */}
              <div className="flex items-center gap-4 mt-4 flex-wrap">
                {["2,400+ PGs listed", "Zero brokerage", "180+ cities"].map((t, i) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    {i > 0 && <span className="w-1 h-1 rounded-full bg-slate-300" />}
                    <CheckCircle size={11} className="text-blue-500" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — image */}
          <div className={`relative hidden lg:block transition-all duration-1000 delay-[200ms] ${mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-100/60 aspect-[4/5] max-h-[580px] ring-1 ring-slate-200/60">
              <img
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=85"
                alt="PG room"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent" />
            </div>

            {/* Floating card — Available */}
            <div className="absolute -left-10 bottom-1/3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/60 border border-white/80 p-4 min-w-[152px] animate-[float_4s_ease-in-out_infinite]">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Available Now</p>
              <p className="text-2xl font-black text-slate-900">340</p>
              <p className="text-xs text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ↑ 12 new today
              </p>
            </div>

            {/* Floating card — Avg rent */}
            <div className="absolute -right-6 top-1/4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/60 border border-white/80 p-4 animate-[float_4s_ease-in-out_infinite_1.5s]">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Avg. Monthly Rent</p>
              <p className="text-2xl font-black text-slate-900">₹8,200</p>
              <div className="flex items-center gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-blue-500 text-blue-500" />)}
                <span className="text-xs text-slate-400 ml-1 font-medium">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════════ */}
      <section ref={statRef} className="relative py-16 sm:py-20 overflow-hidden">
        {/* Rich gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.3),transparent_60%)] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <div key={s.label} className={`transition-all duration-700 delay-[${i * 100}ms] ${statInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
                <p className="text-4xl sm:text-5xl font-black text-white mb-1.5 tracking-tight tabular-nums">
                  <Counter end={s.value} prefix={s.prefix || ""} suffix={s.suffix || ""} inView={statInView} />
                </p>
                <p className="text-[10px] text-blue-200 uppercase tracking-[0.2em] font-bold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════ */}
      <section ref={featRef} id="features" className="py-20 sm:py-28 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className={`mb-14 ${reveal(featInView)}`}>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Why PGFinder</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-3 text-slate-900 leading-tight">
              Everything you need,
              <br />
              <span className="text-slate-300 font-normal">nothing you don&apos;t.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className={`group bg-white border border-slate-200 rounded-2xl p-7 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/80 hover:-translate-y-1 transition-all duration-300 ${reveal(featInView, i * 80)}`}
                >
                  <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:shadow-lg group-hover:shadow-blue-200 transition-all duration-300">
                    <Icon size={20} className="text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CITIES ════════════════════════════════════════════════ */}
      <section ref={citRef} id="cities" className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className={`mb-12 ${reveal(citInView)}`}>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Explore</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-3 text-slate-900">
              PGs in cities
              <br />
              <span className="text-slate-300 font-normal">that matter most.</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {CITIES.map((c, i) => (
              <button
                key={c.name}
                onClick={() => router.push(`/home?q=${c.name}`)}
                className={`relative rounded-2xl overflow-hidden aspect-[3/4] group cursor-pointer text-left transition-all duration-700 hover:-translate-y-1 delay-[${(i % 3) * 80}ms] ${citInView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
              >
                <img src={c.img} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {/* hover shimmer */}
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                  <div>
                    <p className="text-white font-black text-lg leading-tight">{c.name}</p>
                    <p className="text-white/60 text-xs mt-0.5 font-medium">{c.count}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300 group-hover:scale-110">
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
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Process</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-3 mb-14 text-slate-900">
            3 steps to your <span className="text-blue-600">new home.</span>
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { n: "01", icon: Search,      title: "Search",  desc: "Enter your city or locality and use smart filters to narrow down." },
              { n: "02", icon: CheckCircle, title: "Explore", desc: "Browse verified PG listings with real photos and honest reviews." },
              { n: "03", icon: Zap,         title: "Book",    desc: "Book instantly with zero brokerage. Move in hassle-free." },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.n} className="bg-white border border-slate-200 rounded-2xl p-8 text-left hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/80 hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-200">
                      <Icon size={18} className="text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-4xl font-black text-blue-100 group-hover:text-blue-200 transition-colors">{s.n}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════════ */}
      <section ref={testRef} className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className={`mb-12 ${reveal(testInView)}`}>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Reviews</span>
            <h2 className="text-3xl sm:text-4xl font-black mt-3 text-slate-900">
              Real people,
              <br />
              <span className="text-slate-300 font-normal">real homes.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className={`bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/60 hover:-translate-y-1 transition-all duration-500 delay-[${i * 100}ms] ${testInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(t.stars)].map((_, j) => <Star key={j} size={13} className="fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <span className="text-4xl text-blue-100 font-serif leading-none select-none">&ldquo;</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-xs font-black shadow-md shadow-blue-200/50">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════ */}
      <section ref={ctaRef} className="relative py-24 sm:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.3),transparent_55%)] pointer-events-none" />
        {/* dot grid on dark */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        <div className="relative z-10 max-w-2xl mx-auto px-5 sm:px-8">
          <span className={`inline-block text-xs font-bold text-blue-200 uppercase tracking-widest border border-blue-400/40 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6 transition-all duration-700 ${ctaInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Start for free
          </span>
          <h2 className={`text-4xl sm:text-5xl font-black text-white leading-tight mb-5 transition-all duration-700 delay-100 ${ctaInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
            Your next home is
            <br />one search away.
          </h2>
          <p className={`text-blue-200 text-base mb-10 max-w-md mx-auto leading-relaxed transition-all duration-700 delay-200 ${ctaInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
            Join thousands of tenants who found their perfect PG without paying a single rupee in brokerage.
          </p>
          <div className={`flex gap-3 justify-center flex-wrap transition-all duration-700 delay-300 ${ctaInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
            <button
              onClick={() => router.push("/home")}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3.5 rounded-xl font-black text-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/30 active:scale-95"
            >
              Browse PGs →
            </button>
            <button
              onClick={() => router.push("/auth/signup")}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 hover:border-white/40 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════ */}
      <footer className="bg-slate-900 pt-14 pb-8 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-900/40">
                  <span className="text-white text-[10px] font-black">PG</span>
                </div>
                <span className="text-white font-bold text-sm">Finder</span>
              </div>
              <p className="text-slate-500 text-xs max-w-xs leading-relaxed">India&apos;s trusted PG platform. Zero brokerage, verified listings, and a home you&apos;ll love.</p>
            </div>
            <div className="flex gap-12 sm:gap-16">
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Platform</p>
                {["Browse PGs","How it Works","Features"].map((l) => (
                  <a key={l} href="#" className="text-slate-500 hover:text-blue-400 text-xs transition-colors font-medium">{l}</a>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Legal</p>
                {["Privacy","Terms","Contact"].map((l) => (
                  <a key={l} href="#" className="text-slate-500 hover:text-blue-400 text-xs transition-colors font-medium">{l}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center">
            <p className="text-slate-600 text-[11px] font-medium">© 2026 PGFinder. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Float animation */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}