"use client";

import { useState } from "react";
import { Pencil, EyeOff, Eye, Check } from "lucide-react";
import PGForm from "./PGForm";

const genderLabel = { male:"Boys", female:"Girls", mix:"Co-ed" };

export default function ListingCard({ pg, onUpdated }) {
  const [editOpen,   setEditOpen]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [toggling,   setToggling]   = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const inactive = pg.isActive === false;
  const avg      = pg.ratingData?.avg ? `★ ${pg.ratingData.avg}/5` : "★ No reviews";
  const count    = pg.ratingData?.count || 0;
  const token    = () => localStorage.getItem("token");

  const handleEdit = async (formData) => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/pg/${pg._id}`, {
        method: "PATCH",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token()}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onUpdated(await res.json());
        setEditOpen(false);
        setSuccessMsg("Saved!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } finally { setSaving(false); }
  };

  const toggleActive = async () => {
    setToggling(true);
    try {
      const res = await fetch(`http://localhost:5000/api/pg/${pg._id}`, {
        method: "PATCH",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token()}` },
        body: JSON.stringify({ isActive: !pg.isActive }),
      });
      if (res.ok) onUpdated(await res.json());
    } finally { setToggling(false); }
  };

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all ${
      inactive ? "border-slate-200 opacity-60" : "border-slate-200 hover:border-blue-300 hover:shadow-md hover:shadow-blue-50/50"
    }`}>
      <div className="flex flex-col sm:flex-row">

        <div className="flex-1 p-4 sm:p-5 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-semibold text-slate-900 truncate">{pg.name}</h2>
            {inactive && <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">Inactive</span>}
          </div>
          <p className="text-sm text-yellow-500 mb-1">
            {avg}{count > 0 && <span className="text-slate-400 font-normal text-xs ml-1">({count} reviews)</span>}
          </p>
          <p className="text-xs text-slate-400 mb-3 truncate">{pg.address}, {pg.city}</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600">{genderLabel[pg.gender]}</span>
            <span className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 capitalize">{pg.food}</span>
            {(pg.amenities||[]).slice(0,4).map(a => (
              <span key={a} className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-slate-600">{a}</span>
            ))}
            {(pg.amenities||[]).length > 4 && <span className="text-xs text-slate-400">+{pg.amenities.length-4} more</span>}
          </div>
          {successMsg && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><Check size={12}/>{successMsg}</p>}
        </div>

        <div className="flex sm:flex-col items-center sm:items-stretch justify-between sm:justify-center gap-2 px-4 sm:px-5 pb-4 sm:py-5 sm:border-l border-slate-100 sm:w-40 flex-shrink-0">
          <div className="sm:text-center">
            <p className="text-xl font-bold text-slate-900 leading-none">₹{pg.price?.toLocaleString("en-IN")}</p>
            <p className="text-[12px] text-slate-400 mt-0.5">/month</p>
          </div>
          <div className="flex sm:flex-col gap-2">
            <button onClick={() => setEditOpen(o=>!o)}
              className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
                editOpen ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600"
              }`}>
              <Pencil size={12}/> Edit
            </button>
            <button onClick={toggleActive} disabled={toggling}
              className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
                inactive ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                         : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              }`}>
              {inactive ? <><Eye size={12}/> Activate</> : <><EyeOff size={12}/> Deactivate</>}
            </button>
          </div>
        </div>
      </div>

      {editOpen && (
        <div className="px-4 sm:px-5 pb-5">
          <PGForm initial={pg} onSubmit={handleEdit} onCancel={() => setEditOpen(false)} saving={saving} />
        </div>
      )}
    </div>
  );
}