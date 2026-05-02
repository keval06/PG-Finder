"use client";
// TODO: Add map using google maps
// NEW MAP
import { useState, useCallback, useEffect } from "react";
import { XCircle, Plus, Trash2, MapPin } from "lucide-react";
import Button from "../../atoms/Button";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix broken Leaflet default icons in Next.js/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Component to handle map clicks inside MapContainer
function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e);
    },
  });
  return null;
}

// Pans map when coordinates change (e.g. from autocomplete selection)
function PanToCoordinate({ coordinate }) {
  const map = useMap();
  useEffect(() => {
    if (coordinate?.length === 2) {
      map.setView([coordinate[1], coordinate[0]], 15, { animate: true });
    }
  }, [map, coordinate?.[0], coordinate?.[1]]);
  return null;
}

import {
  AMENITIES_LIST,
  ROOM_TYPE_NAMES,
  GENDER_LABELS,
  FOOD_LABELS,
} from "../../../lib/constants";

import { memo } from "react";

const BLANK_RT = {
  name: "regular",
  sharingCount: "",
  availableRooms: "",
  price: "",
};

// Memoized Map to prevent re-renders on every keystroke
const MemoizedMap = memo(({ coordinate, mounted, onMapClick }) => {
  if (!mounted) return <div className="h-64 w-full bg-slate-50" />;
  
  return (
    <MapContainer
      center={
        coordinate.length === 2
          ? [coordinate[1], coordinate[0]]
          : [23.0225, 72.5714]
      }
      zoom={11}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <ClickHandler onClick={onMapClick} />
      <PanToCoordinate coordinate={coordinate} />

      {coordinate.length === 2 && (
        <Marker position={[coordinate[1], coordinate[0]]} />
      )}
    </MapContainer>
  );
});

MemoizedMap.displayName = "MemoizedMap";

export default function PGForm({
  initial,
  onSubmit,
  onCancel,
  saving,
  onRemoveRT,
}) {
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
    coordinate: [], // Empty default forces the user to manually click the map
  };

  const [form, setForm] = useState(
    initial
      ? {
          ...initial,
          price: initial.price ?? "",
          room: initial.room ?? "",
          bathroom: initial.bathroom ?? "",
          toilet: initial.toilet ?? "",
          coordinate:
            initial.coordinate?.coordinates?.length === 2
              ? initial.coordinate.coordinates
              : initial.coordinate?.length === 2
                ? initial.coordinate
                : [],
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

  const [suggestions, setSuggestions] = useState([]);
  const [searchText, setSearchText] = useState("");

  // Debounced search
  useEffect(() => {
    if (searchText.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText)}&format=json&limit=5&countrycodes=in&addressdetails=1`,
        { headers: { "User-Agent": "PGFinder/1.0" } },
      );
      const data = await res.json();
      setSuggestions(data);
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [searchText]);

  // track _ids of existing room types that were removed
  const [removedIds, setRemovedIds] = useState([]);
  const [err, setErr] = useState("");

  // Room Type Pagination
  const [rtPage, setRtPage] = useState(1);
  const rtPerPage = 5;
  const totalRtPages = Math.max(1, Math.ceil(roomTypes.length / rtPerPage));
  const paginatedRTs = roomTypes.slice((rtPage - 1) * rtPerPage, rtPage * rtPerPage);

  useEffect(() => {
    if (rtPage > totalRtPages) {
      setRtPage(totalRtPages);
    }
  }, [totalRtPages, rtPage]);


  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleA = (a) =>
    set(
      "amenities",
      form.amenities.includes(a)
        ? form.amenities.filter((x) => x !== a)
        : [...form.amenities, a],
    );
  //new map
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const handleMapClick = useCallback((e) => {
    const lng = e.latlng.lng;
    const lat = e.latlng.lat;
    set("coordinate", [lng, lat]);

    // Reverse geocode: get address from coordinates AND update form fields
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "User-Agent": "PGFinder/1.0" } }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.display_name) {
          setSearchText(data.display_name);
          set("address", data.display_name);
          // Extract city from address details
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || "";
          if (city) set("city", city);
        }
      })
      .catch(() => {}); // silently fail if reverse geocode fails
  }, []);

  //

  const addRT = () => setRoomTypes((p) => [...p, { ...BLANK_RT }]);
  const setRT = (i, k, v) =>
    setRoomTypes((p) =>
      p.map((rt, idx) => (idx === i ? { ...rt, [k]: v } : rt)),
    );
  const removeRT = (i) => {
    if (onRemoveRT) {
      onRemoveRT(i, () => {
        const rt = roomTypes[i];
        if (rt._id) setRemovedIds((p) => [...p, rt._id]);
        setRoomTypes((p) => p.filter((_, idx) => idx !== i));
      });
      return;
    }
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

    if (!form.coordinate || form.coordinate.length !== 2) {
      return setErr("Please pin your location on the map.");
    }

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
    "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-50 outline-none transition-all text-slate-900";
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

        {/* ── Map Coordinate Selection ── */}
        <div className="col-span-2">
          <label className={lab}>
            Pin Location on Map{" "}
            <span className="text-slate-400 font-normal">
              (Search or click map to set)
            </span>
          </label>

          {/* Location search autocomplete */}
          <div className="relative mb-2">
            <input
              className={inp}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search location... e.g. Koramangala, Bangalore"
            />
            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full bg-white border border-slate-200 rounded-xl shadow-lg z-[50] max-h-48 overflow-y-auto mt-1">
                {suggestions.map((s) => (
                  <li
                    key={s.place_id}
                    onClick={() => {
                      set("coordinate", [parseFloat(s.lon), parseFloat(s.lat)]);
                      set("address", s.display_name);
                      // Extract city from structured address object
                      const city = s.address?.city || s.address?.town || s.address?.village || s.address?.state_district || "";
                      if (city) set("city", city);
                      setSearchText(s.display_name);
                      setSuggestions([]);
                    }}
                    className="px-3 py-2.5 hover:bg-rose-50 cursor-pointer text-sm text-slate-700 border-b border-slate-100 last:border-0 transition-colors"
                  >
                    {s.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* new map - optimized with memoization */}
          <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
            <MemoizedMap 
              coordinate={form.coordinate} 
              mounted={mounted} 
              onMapClick={handleMapClick} 
            />
            <div
              className={`absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow border text-xs font-medium flex items-center gap-1.5 z-10 ${form.coordinate.length === 2 ? "border-rose-200 text-slate-700" : "border-red-200 text-red-600"}`}
            >
              <MapPin
                size={14}
                className={
                  form.coordinate.length === 2
                    ? "text-rose-500"
                    : "text-red-500"
                }
              />
              {form.coordinate.length === 2
                ? "Location Saved"
                : "Click map to set location"}
            </div>
          </div>
        </div>

        <div>
          <label className={lab}>Gender</label>
          <select
            className={inp}
            value={form.gender}
            onChange={(e) => set("gender", e.target.value)}
          >
            {Object.entries(GENDER_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={lab}>Food</label>
          <select
            className={inp}
            value={form.food}
            onChange={(e) => set("food", e.target.value)}
          >
            {Object.entries(FOOD_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
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
                  ? "bg-[#FF385C] text-white border-[#FF385C]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-rose-300"
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
          <Button
            onClick={addRT}
            variant="outline"
            size="sm"
            disabled={totalRoom > 0 && allocated >= totalRoom}
            icon={Plus}
          >
            Add Room Type
          </Button>
        </div>

        {roomTypes.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-xl">
            No room types added yet. Click `&quot;`Add Room Type`&quot;` to
            begin.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {paginatedRTs.map((rt, i) => {
            const actualIndex = (rtPage - 1) * rtPerPage + i;
            return (
              <div
                key={actualIndex}
                className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col gap-3 transition-all animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    Room Type {actualIndex + 1}
                    {rt._id && (
                      <span className="ml-2 text-[10px] text-rose-500 border border-rose-100 bg-rose-50 px-1.5 py-0.5 rounded-full">
                        existing
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRT(actualIndex)}
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
                      onChange={(e) => setRT(actualIndex, "name", e.target.value)}
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
                      onChange={(e) => setRT(actualIndex, "sharingCount", e.target.value)}
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
                      onChange={(e) => setRT(actualIndex, "availableRooms", e.target.value)}
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
                      onChange={(e) => setRT(actualIndex, "price", e.target.value)}
                      placeholder="e.g. 7500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Room Type Pagination Controls */}
        {totalRtPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={rtPage === 1}
              onClick={() => setRtPage(p => p - 1)}
              className="px-3 py-1 text-xs font-semibold text-[#222222] border border-gray-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-[10px] font-bold text-[#717171] uppercase tracking-widest">
              Page {rtPage} of {totalRtPages}
            </span>
            <button
              type="button"
              disabled={rtPage === totalRtPages}
              onClick={() => setRtPage(p => p + 1)}
              className="px-3 py-1 text-xs font-semibold text-[#222222] border border-gray-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ── actions ── */}
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Save
        </Button>
      </div>
    </form>
  );
}
