"use client";

import { useState } from "react";
import { XCircle, Plus, Trash2 } from "lucide-react";

const AMENITIES_LIST = [
  "AC",
  "WiFi",
  "Parking",
  "Laundry",
  "Gym",
  "CCTV",
  "RO",
  "TV",
  "Lift",
  "Refrigerator",
  "Garden",
  "Library",
];
const ROOM_TYPE_NAMES = ["regular", "deluxe", "luxurious", "premium", "suite"];
const BLANK_RT = {
  name: "regular",
  sharingCount: "",
  availableRooms: "",
  price: "",
};

export default function PGForm({ initial, onSubmit, onCancel, saving , onRemoveRT}) {
  const blank = {
    name: "",
    price: "",
    address: "",
    city: "",
    gender: "male",
    room: "",
    bathroom: "",
    toilet: "",
    food: "flexible",
    amenities: [],
  };

  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          price: initial.price ?? "",
          room: initial.room ?? "",
          bathroom: initial.bathroom ?? "",
          toilet: initial.toilet ?? "",
        }
      : blank,
  );

  const [roomTypes, setRoomTypes] = useState(
    initial?.roomTypes?.length
      ? initial.roomTypes.map((rt) => ({
          ...rt,
          sharingCount: rt.sharingCount ?? "",
          availableRooms: rt.availableRooms ?? "",
          price: rt.price ?? "",
        }))
      : [],
  );

  // track _ids of existing room types that were removed
  const [removedIds, setRemovedIds] = useState([]);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleA = (a) =>
    set(
      "amenities",
      form.amenities.includes(a)
        ? form.amenities.filter((x) => x !== a)
        : [...form.amenities, a],
    );

  const addRT = () => setRoomTypes((p) => [...p, { ...BLANK_RT }]);
  const setRT = (i, k, v) =>
    setRoomTypes((p) =>
      p.map((rt, idx) => (idx === i ? { ...rt, [k]: v } : rt)),
    );
  const removeRT = (i) => {
  if (onRemoveRT) { onRemoveRT(i, () => {
    const rt = roomTypes[i];
    if (rt._id) setRemovedIds((p) => [...p, rt._id]);
    setRoomTypes((p) => p.filter((_, idx) => idx !== i));
  }); return; }
  // fallback if no prop
  const rt = roomTypes[i];
  if (rt._id) setRemovedIds((p) => [...p, rt._id]);
  setRoomTypes((p) => p.filter((_, idx) => idx !== i));
};

  // live allocation check
  const totalRoom = Number(form.room) || 0;
  const allocated = roomTypes.reduce(
    (s, rt) => s + (Number(rt.availableRooms) || 0),
    0,
  );
  const overAllocated = allocated > totalRoom;

  const submit = (e) => {
    e.preventDefault();
    setErr("");

    if (!form.name.trim() || form.name.trim().length < 2)
      return setErr("Name must be at least 2 characters");
    if (!form.price || Number(form.price) <= 0)
      return setErr("Enter a valid price");
    if (!form.address.trim() || form.address.trim().length < 10)
      return setErr("Address must be at least 10 characters");
    if (!form.city.trim()) return setErr("City is required");
    if (!form.room || isNaN(form.room)) return setErr("Enter valid room count");
    if (overAllocated)
      return setErr(
        `Allocated rooms (${allocated}) exceed total rooms (${totalRoom})`,
      );

    // validate each room type block
    for (let i = 0; i < roomTypes.length; i++) {
      const rt = roomTypes[i];
      if (!rt.sharingCount || Number(rt.sharingCount) < 1)
        return setErr(`Room type ${i + 1}: sharing count must be at least 1`);
      if (!rt.availableRooms || Number(rt.availableRooms) < 1)
        return setErr(`Room type ${i + 1}: available rooms must be at least 1`);
      if (!rt.price || Number(rt.price) <= 0)
        return setErr(`Room type ${i + 1}: enter a valid price`);
    }

    onSubmit({
      pgData: {
        ...form,
        price: Number(form.price),
        room: Number(form.room),
        bathroom: Number(form.bathroom) || 0,
        toilet: Number(form.toilet) || 0,
      },
      roomTypes: roomTypes.map((rt) => ({
        ...rt,
        sharingCount: Number(rt.sharingCount),
        availableRooms: Number(rt.availableRooms),
        price: Number(rt.price),
      })),
      removedIds,
    });
  };

  const inp =
    "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none transition-all text-slate-900";
  const lab = "text-xs font-medium text-slate-500 mb-1.5 block";

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 pt-4 mt-2 border-t border-slate-100"
    >
      {err && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          <XCircle size={13} /> {err}
        </div>
      )}

      {/* ── PG fields ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={lab}>PG Name</label>
          <input
            className={inp}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Royal Comfort PG"
            required
          />
        </div>
        <div>
          <label className={lab}>Base Price / month (₹)</label>
          <input
            type="number"
            className={inp}
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="e.g. 8000"
            required
          />
        </div>
        <div>
          <label className={lab}>City</label>
          <input
            className={inp}
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="City"
            required
          />
        </div>
        <div className="col-span-2">
          <label className={lab}>Full Address</label>
          <input
            className={inp}
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Full address (min 10 chars)"
            required
          />
        </div>
        <div>
          <label className={lab}>Gender</label>
          <select
            className={inp}
            value={form.gender}
            onChange={(e) => set("gender", e.target.value)}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="mix">Co-ed</option>
          </select>
        </div>
        <div>
          <label className={lab}>Food</label>
          <select
            className={inp}
            value={form.food}
            onChange={(e) => set("food", e.target.value)}
          >
            <option value="with food">With Food</option>
            <option value="without food">Without Food</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
        <div>
          <label className={lab}>Total Rooms</label>
          <input
            type="number"
            min="0"
            className={inp}
            value={form.room}
            onChange={(e) => set("room", e.target.value)}
            placeholder="0"
            required
          />
        </div>
        <div>
          <label className={lab}>Bathrooms</label>
          <input
            type="number"
            min="0"
            className={inp}
            value={form.bathroom}
            onChange={(e) => set("bathroom", e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label className={lab}>Toilets</label>
          <input
            type="number"
            min="0"
            className={inp}
            value={form.toilet}
            onChange={(e) => set("toilet", e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      {/* ── Amenities ── */}
      <div>
        <label className={lab}>Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES_LIST.map((a) => (
            <button
              type="button"
              key={a}
              onClick={() => toggleA(a)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                form.amenities.includes(a)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* ── Room Types ── */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-slate-700">Room Types</p>
            {totalRoom > 0 && (
              <p
                className={`text-[10px] mt-0.5 ${overAllocated ? "text-red-500" : "text-slate-400"}`}
              >
                {allocated}/{totalRoom} rooms allocated
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={addRT}
            disabled={totalRoom > 0 && allocated >= totalRoom}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={12} /> Add Room Type
          </button>
        </div>

        {roomTypes.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-xl">
            No room types added yet. Click `&quot;`Add Room Type`&quot;` to begin.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {roomTypes.map((rt, i) => (
            <div
              key={i}
              className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">
                  Room Type {i + 1}
                  {rt._id && (
                    <span className="ml-2 text-[10px] text-blue-500 border border-blue-100 bg-blue-50 px-1.5 py-0.5 rounded-full">
                      existing
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => removeRT(i)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className={lab}>Type</label>
                  <select
                    className={inp}
                    value={rt.name}
                    onChange={(e) => setRT(i, "name", e.target.value)}
                  >
                    {ROOM_TYPE_NAMES.map((n) => (
                      <option key={n} value={n} className="capitalize">
                         {n.charAt(0).toUpperCase() + n.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lab}>Sharing Count</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className={inp}
                    value={rt.sharingCount}
                    onChange={(e) => setRT(i, "sharingCount", e.target.value)}
                    placeholder="e.g. 2"
                  />
                </div>
                <div>
                  <label className={lab}>No. of Rooms</label>
                  <input
                    type="number"
                    min="1"
                    className={inp}
                    value={rt.availableRooms}
                    onChange={(e) => setRT(i, "availableRooms", e.target.value)}
                    placeholder="e.g. 3"
                  />
                </div>
                <div className="col-span-2">
                  <label className={lab}>Price / bed / month (₹)</label>
                  <input
                    type="number"
                    min="0"
                    className={inp}
                    value={rt.price}
                    onChange={(e) => setRT(i, "price", e.target.value)}
                    placeholder="e.g. 7500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── actions ── */}
      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
