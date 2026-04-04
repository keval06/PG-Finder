"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors group"
    >
      <ArrowLeft
        size={16}
        className="group-hover:-translate-x-0.5 transition-transform"
      />
      Back
    </button>
  );
}
