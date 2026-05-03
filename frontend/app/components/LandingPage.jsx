"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  Star,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { pgApi } from "../../lib/api/pg";

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [landing, setLanding] = useState({
    totals: { pgs: 0, cities: 0 },
    cities: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pgApi
      .getLanding()
      .then((data) => setLanding(data || []))
      .catch(() => setLanding([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/home?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/home");
    }
  };

  return (
    <div className="bg-white">
      {/* ────── HERO ────── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-20 pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Heading + Search */}
          <div>
            <p className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
              India&apos;s Trusted PG Platform
            </p>

            <h1 className="text-[40px] md:text-[52px] lg:text-[58px] leading-[1.05] font-semibold tracking-tight text-[#222222] mb-6">
              Find your <br />
              perfect{" "}
              <span className="italic font-medium text-rose-500">
                paying guest
              </span>{" "}
              home.
            </h1>

            <p className="text-[17px] text-[#717171] leading-relaxed mb-8 max-w-md">
              Verified PGs across India. Zero brokerage. Direct owner contact.
              No middlemen, no surprises.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-white border border-[#DDDDDD] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-shadow max-w-md"
            >
              <div className="pl-6 pr-3 text-[#717171]">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city, locality or PG name"
                className="flex-1 py-4 text-[15px] text-[#222222] placeholder:text-[#A0A0A0] focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-2.5 m-1.5 rounded-full transition-colors text-[14px]"
              >
                Search
              </button>
            </form>

            {/* Stats strip */}
            <div className="flex items-center gap-8 mt-10 pt-8 border-t border-gray-100">
              <Stat
                label="Verified PGs"
                value={landing.totals.pgs.toLocaleString("en-IN")}
              />
              <div className="w-px h-10 bg-gray-200" />
              <Stat label="Cities" value={landing.totals.cities} />
              <div className="w-px h-10 bg-gray-200" />
              <Stat label="Brokerage" value="₹0" />
            </div>
          </div>

          {/* Right — Hero image card (Airbnb-style listing card) */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
              <Image
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=85"
                alt="Featured PG"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Floating price card */}
            <div className="absolute -left-6 top-12 bg-white rounded-2xl shadow-[0_8px_28px_rgba(0,0,0,0.15)] p-5 w-[200px]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#717171] mb-1">
                Avg. Monthly Rent
              </p>
              <p className="text-[28px] font-semibold text-[#222222] leading-none mb-2">
                ₹8,200
              </p>
              <div className="flex items-center gap-1 text-[13px] text-[#484848]">
                <Star size={13} className="fill-rose-500 text-rose-500" />
                <span className="font-semibold">4.8</span>
                <span className="text-[#717171]">· Verified</span>
              </div>
            </div>
            {/* Floating trust badge */}
            <div className="absolute -right-4 bottom-12 bg-white rounded-2xl shadow-[0_8px_28px_rgba(0,0,0,0.15)] p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                <ShieldCheck size={20} className="text-rose-500" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#222222] leading-tight">
                  100% Verified
                </p>
                <p className="text-[11px] text-[#717171]">By our team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────── WHY US — 3 small features (concise) ────── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Feature
            icon={<ShieldCheck size={20} />}
            title="Zero Brokerage"
            description="Connect directly with verified owners. No middlemen, no hidden fees."
          />
          <Feature
            icon={<Star size={20} />}
            title="Verified Listings"
            description="Every PG personally verified by our team. What you see is what you get."
          />
          <Feature
            icon={<Zap size={20} />}
            title="Instant Booking"
            description="Reserve your spot in one click. No calls, no waiting, no uncertainty."
          />
        </div>
      </section>

      {/* ────── TOP CITIES + TOP PGs ────── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-20 pb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-rose-500 mb-2">
              Explore
            </p>
            <h2 className="text-[32px] md:text-[36px] font-semibold tracking-tight text-[#222222]">
              Top cities &amp; top homes
            </h2>
          </div>
          <Link
            href="/home"
            className="hidden md:flex items-center gap-2 text-[15px] font-semibold text-[#222222] hover:text-rose-500 transition-colors"
          >
            Browse all <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-2xl bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {landing.cities.map((cityData) => (
              <CityBlock key={cityData.city} data={cityData} />
            ))}
          </div>
        )}
      </section>

      {/* ────── CTA STRIP ────── */}
      <section className="bg-[#222222] py-16">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-20 text-center">
          <h3 className="text-[32px] md:text-[40px] font-semibold text-white tracking-tight mb-4">
            Your next home is one search away.
          </h3>
          <p className="text-[#A0A0A0] text-[16px] mb-8 max-w-xl mx-auto">
            Join thousands of tenants who found their perfect PG without paying
            a single rupee in brokerage.
          </p>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-[#222222] font-semibold px-8 py-3.5 rounded-full transition-colors text-[15px]"
          >
            Browse PGs <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ────── FOOTER ────── */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-[#717171]">
            © 2026 QuickPG. All rights reserved.
          </p>
          <div className="flex gap-6 text-[13px] text-[#717171]">
            <a href="#" className="hover:text-[#222222] transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-[#222222] transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-[#222222] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ────── SUB-COMPONENTS ──────

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[22px] md:text-[26px] font-semibold text-[#222222] leading-none mb-1.5">
        {value}
      </p>
      <p className="text-[12px] uppercase tracking-wider text-[#717171] font-medium">
        {label}
      </p>
    </div>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all">
      <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-[16px] font-semibold text-[#222222] mb-1.5">
        {title}
      </h3>
      <p className="text-[14px] text-[#717171] leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function CityBlock({ data }) {
  return (
    <div>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h3 className="text-[24px] md:text-[28px] font-semibold text-[#222222] tracking-tight">
            {data.city.charAt(0).toUpperCase() + data.city.slice(1)}
          </h3>
          <p className="text-[14px] text-[#717171] mt-0.5">
            {data.totalCount} verified PGs
          </p>
        </div>
        <Link
          href={`/home?q=${encodeURIComponent(data.city)}`}
          className="text-[14px] font-semibold text-[#222222] hover:text-rose-500 transition-colors flex items-center gap-1.5"
        >
          View all <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
        {data.pgs.map((pg) => (
          <CityPGCard key={pg._id} pg={pg} />
        ))}
      </div>
    </div>
  );
}

function CityPGCard({ pg }) {
  return (
    <Link href={`/pg/${pg._id}`} className="group block">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 mb-3">
        {pg.image ? (
          <Image
            src={pg.image}
            alt={pg.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <MapPin size={32} />
          </div>
        )}
        {pg.avgRating > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur rounded-full px-2 py-0.5 flex items-center gap-1 text-[12px] font-semibold text-[#222222]">
            <Star size={11} className="fill-rose-500 text-rose-500" />
            {pg.avgRating.toFixed(1)}
          </div>
        )}
      </div>
      <h4 className="text-[14px] font-semibold text-[#222222] truncate group-hover:text-rose-500 transition-colors">
        {pg.name}
      </h4>
      <p className="text-[13px] text-[#717171] mt-0.5">
        ₹{pg.price?.toLocaleString("en-IN")} / month
      </p>
    </Link>
  );
}
