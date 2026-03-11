"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PGCard from "../components/PGCard";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function MyListingsPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [pgs,     setPgs]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.push("/auth/login"); return; }

    const fetchMyPGs = async () => {
      try {
        const token = localStorage.getItem("token");
        // fetch all PGs then filter by owner on client
        // (or use /api/pg?owner=id if you add that route later)
        const [pgsRes, reviewsRes] = await Promise.all([
          fetch("http://localhost:5000/api/pg", { cache: "no-store" }),
          fetch(`http://localhost:5000/api/review`, { cache: "no-store" }),
        ]);
        const allPgs = await pgsRes.json();
        const mine   = Array.isArray(allPgs)
          ? allPgs.filter(pg => pg.owner === user._id || pg.owner?._id === user._id || pg.owner?.toString() === user._id)
          : [];

        // attach ratingData per pg
        const withRatings = await Promise.all(
          mine.map(async pg => {
            try {
              const r = await fetch(`http://localhost:5000/api/review?pg=${pg._id}`, { cache: "no-store" });
              const reviews = await r.json();
              if (!Array.isArray(reviews) || reviews.length === 0) return { ...pg, ratingData: null };
              const avg = reviews.reduce((s, r) => s + r.star, 0) / reviews.length;
              return { ...pg, ratingData: { avg: avg.toFixed(1), count: reviews.length } };
            } catch { return { ...pg, ratingData: null }; }
          })
        );
        setPgs(withRatings);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPGs();
  }, [ready, user]);

  if (!ready || loading) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f8fafc] max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
          <p className="text-sm text-slate-400 mt-0.5">{pgs.length} PG{pgs.length !== 1 ? "s" : ""} posted by you</p>
        </div>
        <button
          onClick={() => router.push("/pg/new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} /> Add PG
        </button>
      </div>

      {pgs.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-4xl mb-3">🏠</p>
          <p className="font-semibold text-slate-900 mb-1">No listings yet</p>
          <p className="text-sm text-slate-500 mb-4">Post your first PG and start getting bookings</p>
          <button onClick={() => router.push("/pg/new")}
            className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
            + Add PG
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pgs.map(pg => <PGCard key={pg._id} pg={pg} />)}
        </div>
      )}
    </main>
  );
}