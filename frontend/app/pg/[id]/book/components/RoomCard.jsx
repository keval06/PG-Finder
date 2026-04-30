import { Check, Users, Bed, IndianRupee } from "lucide-react";

export default function RoomCard({ room, selected, onSelect }) {
  const full = room.remainingBeds === 0;

  return (
    <button
      disabled={full}
      onClick={() => onSelect(room)}
      className={`w-full text-left border rounded-xl p-4 transition-all ${
        full
          ? "opacity-40 cursor-not-allowed border-slate-100 bg-slate-50"
          : selected
            ? "border-rose-500 bg-rose-50 ring-2 ring-rose-100"
            : "border-slate-200 hover:border-rose-300 bg-white"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold capitalize text-slate-900">
          {room.name}
        </span>
        {full ? (
          <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full">
            Full
          </span>
        ) : (
          selected && (
            <div className="w-5 h-5 rounded-full bg-[#FF385C] flex items-center justify-center">
              <Check size={11} className="text-white" />
            </div>
          )
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Users size={11} /> {room.sharingCount}-sharing
        </span>
        <span className="flex items-center gap-1">
          <Bed size={11} /> {room.remainingBeds} beds left
        </span>
        <span className="flex items-center gap-1 font-semibold text-slate-900 ml-auto">
          <IndianRupee size={11} />
          {room.price?.toLocaleString("en-IN")}/mo
        </span>
      </div>
    </button>
  );
}
