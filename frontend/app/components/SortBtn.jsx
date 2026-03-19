import { ArrowUp, ArrowDown } from "lucide-react";

export default function SortBtn({ label, field, sortField, sortOrder, onToggle }) {
  const active = sortField === field;
  return (
    <button
      onClick={() => onToggle(field)}
      className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-xl border transition-all font-medium ${
        active
          ? "bg-blue-50 border-blue-200 text-blue-700"
          : "bg-white border-slate-200 text-slate-600 hover:border-blue-200 hover:text-slate-900"
      }`}
    >
      {label}
      {active &&
        (sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
    </button>
  );
}
