import React from "react";

export default function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
  );
}
