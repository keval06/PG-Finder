import React from "react";

export default function Badge({ children, variant = "blue", className = "" }) {
  const variants = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
    red: "bg-red-50 text-red-700 border-red-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
