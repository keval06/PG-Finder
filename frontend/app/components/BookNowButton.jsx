"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function BookNowButton({ pgId }) {
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
      className="w-full mt-5 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
    >
      Book Now
    </button>
  );                                                                                                                                                        
}