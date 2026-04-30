import { ArrowUp, ArrowDown } from "lucide-react";

export default function SortBtn({ 
  label,
  field, 
  sortField, 
  sortOrder, 
  onToggle,
}) {
  const active = (sortField === field);
  return (
    <button
      onClick={() => onToggle(field)}
      className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-xl border transition-all font-medium h-[38px] ${
        active
          ? "bg-rose-50 border-rose-200 text-[#FF385C]"
          : "bg-white border-[#DDDDDD] text-[#717171] hover:border-[#222222] hover:text-[#222222]"
      }`}
    >
      {label}
      {active &&
        (sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
    </button>
  );
}
