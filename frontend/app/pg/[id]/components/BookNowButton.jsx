"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export default function BookNowButton({ pgId, className = "" }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (!ready) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    router.push(`/pg/${pgId}/book`);
  };

  return (
    <button
      onClick={handleClick}
      className={`bg-gradient-to-r from-[#FF385C] to-[#E31C5F] text-white font-bold hover:opacity-90 transition-all duration-200 shadow-sm ${className || "w-full py-3.5 rounded-xl text-lg"}`}
    >
      Reserve
    </button>
  );
}