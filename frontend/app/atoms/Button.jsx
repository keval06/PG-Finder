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
      "bg-[#FF385C] text-white hover:bg-[#E31C5F] shadow-sm",
    secondary: "bg-gray-100 text-[#222222] hover:bg-gray-200",
    outline:
      "bg-transparent border border-[#DDDDDD] text-[#222222] hover:border-[#222222]",
    danger:
      "bg-rose-50 text-[#FF385C] border border-rose-100 hover:bg-[#FF385C] hover:text-white",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs",
    md: "px-3.5 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm",
    lg: "px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base",
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
