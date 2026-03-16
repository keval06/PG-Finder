"use client";

import { useState } from "react";
import { XCircle } from "lucide-react";

const AMENITIES_LIST = ["AC","WiFi","Parking","Laundry","Gym","CCTV","RO","TV","Lift","Refrigerator","Garden","Library"];

export default function PGForm({ initial, onSubmit, onCancel, saving }) {
  const blank = { name:"", price:"", address:"", city:"", gender:"male", room:"", bathroom:"", toilet:"", food:"flexible", amenities:[] };
  const [form, setForm] = useState(initial ? {
    ...initial,
    price:    initial.price    ?? "",
    room:     initial.room     ?? "",
    bathroom: initial.bathroom ?? "",
    toilet:   initial.toilet   ?? "",
  } : blank);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleA = a => set("amenities", form.amenities.includes(a) ? form.amenities.filter(x=>x!==a) : [...form.amenities, a]);

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name.trim() || form.name.trim().length < 2) return setErr("Name must be at least 2 characters");
    if (!form.price || Number(form.price) <= 0)           return setErr("Enter a valid price");
    if (!form.address.trim() || form.address.trim().length < 10) return setErr("Address must be at least 10 characters");
    if (!form.city.trim())      return setErr("City is required");
    if (!form.room || isNaN(form.room)) return setErr("Enter valid room count");
    onSubmit({ ...form, price: Number(form.price), room: Number(form.room), bathroom: Number(form.bathroom)||0, toilet: Number(form.toilet)||0 });
  };

  const inp = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none transition-all text-slate-900";
  const lab = "text-xs font-medium text-slate-500 mb-1.5 block";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 pt-4 mt-2 border-t border-slate-100">
      {err && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          <XCircle size={13}/> {err}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={lab}>PG Name</label>
          <input className={inp} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Royal Comfort PG" required />
        </div>
        <div>
          <label className={lab}>Price / month (₹)</label>
          <input type="number" className={inp} value={form.price} onChange={e=>set("price",e.target.value)} placeholder="e.g. 8000" required />
        </div>
        <div>
          <label className={lab}>City</label>
          <input className={inp} value={form.city} onChange={e=>set("city",e.target.value)} placeholder="City" required />
        </div>
        <div className="col-span-2">
          <label className={lab}>Full Address</label>
          <input className={inp} value={form.address} onChange={e=>set("address",e.target.value)} placeholder="Full address (min 10 chars)" required />
        </div>
        <div>
          <label className={lab}>Gender</label>
          <select className={inp} value={form.gender} onChange={e=>set("gender",e.target.value)}>
            <option value="male">Boys</option>
            <option value="female">Girls</option>
            <option value="mix">Co-ed</option>
          </select>
        </div>
        <div>
          <label className={lab}>Food</label>
          <select className={inp} value={form.food} onChange={e=>set("food",e.target.value)}>
            <option value="with food">With Food</option>
            <option value="without food">Without Food</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
        <div>
          <label className={lab}>Rooms</label>
          <input type="number" min="0" className={inp} value={form.room} onChange={e=>set("room",e.target.value)} placeholder="0" required />
        </div>
        <div>
          <label className={lab}>Bathrooms</label>
          <input type="number" min="0" className={inp} value={form.bathroom} onChange={e=>set("bathroom",e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className={lab}>Toilets</label>
          <input type="number" min="0" className={inp} value={form.toilet} onChange={e=>set("toilet",e.target.value)} placeholder="0" />
        </div>
      </div>
      <div>
        <label className={lab}>Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES_LIST.map(a => (
            <button type="button" key={a} onClick={() => toggleA(a)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                form.amenities.includes(a) ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"
              }`}>
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}