"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, SearchX, MapPinOff } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f8fafc] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Animated Icon Container */}
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto border border-rose-100 shadow-sm animate-pulse">
            <MapPinOff size={44} className="text-rose-500" />
          </div>
          <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg">
            <SearchX size={16} />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-slate-500 text-base mb-10 leading-relaxed max-w-xs mx-auto">
          The address you followed might be broken or the page has been moved.
        </p>

        {/* Big Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/home"
            className="flex items-center justify-center gap-2 bg-[#FF385C] text-white font-semibold py-3 px-6 rounded-2xl hover:bg-[#E31C5F] transition-all shadow-md shadow-rose-200"
          >
            <Home size={18} />
            Back to Home
          </Link>
          
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 text-slate-600 font-semibold py-3 px-6 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>

        {/* Subtle Footer */}
        <p className="mt-12 text-slate-400 text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-100">
          Error 404 — PGFinder
        </p>
      </div>
    </div>
  );
}
