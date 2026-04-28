// app/my-listings/page.js

import MyListingsClient from "./MyListingClient";
import BackButton from "../components/BackButton";

export default function MyListingsPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-col gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Listings</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your PG listings</p>
        </div>
      </div>
      <MyListingsClient />
    </main>
  );
}