import React from "react";

export default function Button({
  children,
  onClick,
  variant = "primary", // primary, secondary, outline, danger
  size = "md", // sm, md, lg
  className = "",
  disabled = false,
  loading = false,
  type = "button",
  icon: Icon,
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#FF385C] text-white hover:bg-[#E31C5F] shadow-sm shadow-rose-200",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline:
      "bg-transparent border border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-500",
    danger:
      "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && <Icon size={size === "sm" ? 14 : 18} />}
          {children}
        </>
      )}
    </button>
  );
}
