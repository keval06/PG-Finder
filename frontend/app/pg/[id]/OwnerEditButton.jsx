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
      className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors mt-2  "
    >
      <Pencil size={13} /> Edit Listing
    </button>
  );
}