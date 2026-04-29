"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Pencil } from "lucide-react";

export default function OwnerEditButton({ pgOwnerId, pgId }) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;
  if (user._id !== pgOwnerId?.toString()) return null;

  return (
    <button
      onClick={() => router.push(`/my-listings/${pgId}`)}
      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#DDDDDD] rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all hover:shadow-sm"
    >
      <Pencil size={14} /> Edit Listing
    </button>
  );
}