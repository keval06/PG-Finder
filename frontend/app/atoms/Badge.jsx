import React from "react";

export default function Badge({ 
  children, 
  variant = "blue", 
  className = "" 
}) {
  const variants = {
    blue: "bg-rose-50 text-rose-600 border-rose-100",
    green: "bg-green-50 text-green-700 border-green-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100",
    red: "bg-red-50 text-red-700 border-red-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold tracking-wide uppercase border whitespace-nowrap transition-all duration-200 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
