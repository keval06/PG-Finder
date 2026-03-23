"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { pgApi } from "../../../lib/api/pg";
import { imageApi } from "../../../lib/api/image";
import { roomTypeApi } from "../../../lib/api/roomType";
import PGForm from "../components/PGForm";
import ConfirmModal from "../../../components/ConfirmModal";

import {
  ArrowLeft,
  Pencil,
  Eye,
  EyeOff,
  Check,
  X,
  Wifi,
  Car,
  Snowflake,
  Tv,
  Camera,
  Dumbbell,
  Book,
  Trees,
  Refrigerator,
  WashingMachine,
  ArrowUpDown,
  Utensils,
  User,
  MapPin,
  Bed,
  Bath,
  Home,
  Star,
  ImagePlus,
  Trash2,
  Users,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Toilet,
  BathIcon,
  BedDouble,
  ImagePlusIcon,
} from "lucide-react";
import Image from "next/image";

const amenityIcons = {
  WiFi: Wifi,
  Parking: Car,
  AC: Snowflake,
  Laundry: WashingMachine,
  Lift: ArrowUpDown,
  CCTV: Camera,
  RO: Refrigerator,
  TV: Tv,
  Refrigerator: Refrigerator,
  Gym: Dumbbell,
  Garden: Trees,
  Library: Book,
};
const genderLabel = { male: "Male", female: "Female", mix: "Co-ed" };
const foodLabel = {
  "with food": "With Food",
  "without food": "No Food",
  flexible: "Flexible",
};
const CATEGORIES = [
  "room",
  "kitchen",
  "bathroom",
  "toilet",
  "building",
  "amenities",
];

export default function EditListingClient({ pgId }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [rtDeleteTarget, setRtDeleteTarget] = useState(null); // { index, doDelete }
  const [pg, setPg] = useState(null);
  const [images, setImages] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [activeCategory, setActiveCategory] = useState("room");
  const [activeImg, setActiveImg] = useState(0);
  const [deleteImgTarget, setDeleteImgTarget] = useState(null); // holds the img._id

  const token = () => localStorage.getItem("token");

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetchAll();
  }, [ready, user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pgData, imgData, rtData] = await Promise.all([
        pgApi.getById(pgId),
        imageApi.getByPgId(pgId),
        roomTypeApi.getByPgId(pgId),
      ]);

      setPg(pgData);
      setImages(Array.isArray(imgData) ? imgData : []);
      setRoomTypes(Array.isArray(rtData) ? rtData : []);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  // ── edit ──
  const handleEdit = ({ pgData, roomTypes: newRTs, removedIds }) => {
    const pgFields = [
      "name",
      "price",
      "address",
      "city",
      "gender",
      "room",
      "bathroom",
      "toilet",
      "food",
    ];
    const pgChanged =
      pgFields.some((f) => pgData[f] !== pg[f]) ||
      JSON.stringify([...(pgData.amenities || [])].sort()) !==
        JSON.stringify([...(pg.amenities || [])].sort());

    const rtChanged =
      removedIds.length > 0 ||
      newRTs.length !== roomTypes.length ||
      newRTs.some((rt, i) => {
        const old = roomTypes[i];
        if (!old) return true;
        return (
          rt.name !== old.name ||
          rt.sharingCount !== old.sharingCount ||
          rt.availableRooms !== old.availableRooms ||
          rt.price !== old.price
        );
      });
    if (!pgChanged && !rtChanged) {
      showToast("info", "No changes detected.");
      return;
    }
    setPendingData({ pgData, roomTypes: newRTs, removedIds });
    setConfirmOpen(true);
  };

  const confirmEdit = async () => {
    if (!pendingData) return;
    const { pgData, roomTypes: newRTs, removedIds } = pendingData;
    setSaving(true);
    try {
      const tok = token();
      const updated = await pgApi.update(pgId, pgData, tok);

      if (!updated._id) {
        showToast("error", "Failed to update PG.");
        return;
      }

      for (const id of removedIds) {
        await roomTypeApi.delete(id, tok);
      }
      for (const rt of newRTs) {
        if (rt._id) {
          await roomTypeApi.update(rt._id, rt, tok);
        } else {
          await roomTypeApi.create({ ...rt, pg: pgId }, tok);
        }
      }
      setPg(updated);
      await fetchAll();
      setConfirmOpen(false);
      setEditOpen(false);
      setPendingData(null);
      showToast("success", "Changes saved!");
    } finally {
      setSaving(false);
    }
  };

  // ── toggle active ──
  const toggleActive = async () => {
    setStatusConfirmOpen(false);
    setToggling(true);
    try {
      const updated = await pgApi.update(
        pgId,
        { isActive: !pg.isActive },
        token()
      );
      if (updated._id) {
        setPg(updated);
        showToast(
          "success",
          updated.isActive ? "Listing activated!" : "Listing deactivated."
        );
      }
    } finally {
      setToggling(false);
    }
  };

  // ── delete PG ──
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pg/${pgId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token()}` },
        }
      );
      if (res.ok) {
        router.push("/my-listings");
      } else {
        showToast("error", "Failed to delete listing.");
        setDeleteConfirmOpen(false);
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("pg", pgId);
      formData.append("category", activeCategory);

      const res = await imageApi.upload(formData, token());

      if (res._id) {
        await fetchAll(); // refresh images
        setActiveImg(0);
      } else {
        console.error("Upload failed");
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  // step 1 — just open the modal, don't delete yet
  const requestDeleteImg = (imgId) => {
    setDeleteImgTarget(imgId);
  };

  // step 2 — called on modal confirm
  const handleDeleteImg = async () => {
    const imgId = deleteImgTarget;
    setDeleteImgTarget(null);

    setImages((prev) => prev.filter((img) => img._id !== imgId));
    setActiveImg(0);

    try {
      await imageApi.delete(imgId, token());
    } catch (err) {
      console.error("Delete failed", err);
      await fetchAll();
    }
  };

  if (!ready || loading)
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!pg)
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <p className="text-slate-500">PG not found.</p>
      </div>
    );

  const filteredImgs = images.filter((img) => img.category === activeCategory);
  const inactive = pg.isActive === false;

  // add this before return
  const bathroomRatio =
    pg.bathroom && pg.room
      ? `${pg.bathroom} (${
          pg.bathroom >= pg.room
            ? "Attached"
            : `1:${Math.round(pg.room / pg.bathroom)}`
        })`
      : "—";

  const toiletRatio =
    pg.toilet && pg.room
      ? `${pg.toilet} (${
          pg.toilet >= pg.room
            ? "Attached"
            : `1:${Math.round(pg.room / pg.toilet)}`
        })`
      : "—";

  const totalBeds = roomTypes.reduce(
    (s, rt) => s + rt.availableRooms * rt.sharingCount,
    0
  );
  const freeBeds = roomTypes.reduce(
    (s, rt) =>
      s +
      (rt.remainingBeds ??
        rt.availableRooms * rt.sharingCount - rt.occupiedBeds),
    0
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* back + toast */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => router.push("/my-listings")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} /> Back to listings
          </button>
          {inactive && (
            <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-3 py-1 rounded-full border border-slate-200">
              Inactive — hidden from guests
            </span>
          )}
        </div>

        {toast && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium mb-5 border ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : toast.type === "error"
                ? "bg-red-50 text-red-600 border-red-100"
                : "bg-blue-50 text-blue-600 border-blue-100"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={15} />
            ) : (
              <XCircle size={15} />
            )}
            {toast.text}
          </div>
        )}

        {/* ── GALLERY ── */}
        <input
          type="file"
          accept="image/*"
          id="imageUpload"
          hidden
          onChange={(e) => {
            if (e.target.files[0]) handleUpload(e.target.files[0]);
          }}
        />

        <div className="mb-6">
          {/* main image or empty placeholder */}
          {filteredImgs.length > 0 ? (
            <div className="group relative w-full h-[380px]">
              <Image
                src={filteredImgs[activeImg]?.url}
                alt={activeCategory}
                fill
                className="object-cover rounded-2xl"
                sizes="100vw"
                priority
              />

              {/* delete button on main image */}
              <button
                onClick={() => requestDeleteImg(filteredImgs[activeImg]._id)}
                className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          ) : (
            <div
              onClick={() => document.getElementById("imageUpload").click()}
              className="w-full h-[380px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-400 group hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <ImagePlus size={32} className="text-blue-500/50" />
              </div>
              <p className="text-base font-semibold text-slate-600">
                No {activeCategory} images yet
              </p>
              <p className="text-sm text-slate-400">Click to upload</p>
            </div>
          )}

          {/* category tabs */}
          <div className="flex gap-2 mt-3 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveImg(0);
                }}
                className={`px-4 py-1.5 rounded-full capitalize text-xs font-medium border flex-shrink-0 transition-colors ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "text-slate-600 border-slate-200 hover:border-blue-300 bg-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* thumbnail row */}
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {filteredImgs.map((img, i) => (
              <div
                key={img._id}
                onClick={() => setActiveImg(i)}
                className={`group relative w-20 h-14 flex-shrink-0 overflow-hidden rounded-xl cursor-pointer border-2 transition-all ${
                  activeImg === i
                    ? "border-blue-500 scale-105 ring-4 ring-blue-50"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt="thumb"
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ))}

            {/* + add button */}
            <div
              onClick={() => document.getElementById("imageUpload").click()}
              className="w-20 h-14 flex-shrink-0 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <ImagePlus size={18} className="text-slate-400" />
            </div>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 lg:gap-8">
          {/* ── LEFT: details view ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* name + location + rating */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 capitalize">
                    {pg.name}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-sm">
                    <MapPin size={14} />
                    <span className="capitalize">
                      {pg.address}, {pg.city}
                    </span>
                  </div>
                  {pg.ratingData?.avg && (
                    <p className="text-yellow-500 mt-1.5 text-sm font-medium">
                      ★ {pg.ratingData.avg}/5
                      <span className="text-slate-400 font-normal ml-1">
                        ({pg.ratingData.count} reviews)
                      </span>
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-2xl font-bold text-slate-900">
                    ₹{pg.price?.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-slate-400">/month</p>
                </div>
              </div>
            </div>

            {/* room details */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h2 className="text-base font-semibold text-slate-900 mb-4">
                Room Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  { icon: Home, label: "Rooms", value: pg.room },
                  // { icon: Bath, label: "Bathrooms", value: pg.bathroom },
                  {
                    icon: User,
                    label: "Gender",
                    value: genderLabel[pg.gender] || pg.gender,
                  },
                  {
                    icon: Utensils,
                    label: "Food",
                    value: foodLabel[pg.food] || pg.food,
                  },
                  { icon: BathIcon, label: "Bathroom", value: bathroomRatio },
                  { icon: Toilet, label: "Toilet", value: toiletRatio },
                  { icon: BedDouble, label: "Total Beds", value: totalBeds },
                  { icon: BedDouble, label: "Free Beds", value: freeBeds },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center justify-center bg-slate-50 rounded-xl p-3 gap-1.5 border border-slate-100"
                  >
                    <Icon size={18} className="text-blue-500" />
                    <span className="text-[10px] text-slate-400">{label}</span>
                    <span className="text-sm font-semibold capitalize text-slate-700">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* room types */}
            {roomTypes.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h2 className="text-base font-semibold text-slate-900 mb-4">
                  Room Types
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roomTypes.map((rt) => {
                    const occupied = rt.occupiedBeds || 0;
                    const total = rt.availableRooms * rt.sharingCount;
                    const free = total - occupied;
                    return (
                      <div
                        key={rt._id}
                        className="border border-slate-100 rounded-xl p-4 bg-slate-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-slate-900 capitalize">
                            {rt.name}
                            <span className="text-xs text-slate-400 font-normal ml-1">
                              ({rt.sharingCount}-sharing)
                            </span>
                          </p>
                          <p className="text-sm font-bold text-blue-600">
                            ₹{rt.price?.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users size={11} />
                            {rt.sharingCount}-sharing
                          </span>
                          <span className="flex items-center gap-1">
                            <Bed size={11} />
                            {rt.availableRooms} rooms
                          </span>
                          <span
                            className={`font-semibold ${
                              free > 0 ? "text-emerald-600" : "text-red-500"
                            }`}
                          >
                            {free} beds free
                          </span>
                        </div>
                        {/* occupancy bar */}
                        <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{
                              width:
                                total > 0
                                  ? `${(occupied / total) * 100}%`
                                  : "0%",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* amenities */}
            {(pg.amenities || []).length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <h2 className="text-base font-semibold text-slate-900 mb-4">
                  Amenities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {pg.amenities.map((a) => {
                    const Icon = amenityIcons[a];
                    return (
                      <div
                        key={a}
                        className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full"
                      >
                        {Icon && <Icon size={12} className="text-blue-500" />}
                        {a}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: actions + edit form ── */}
          <div className="order-first lg:order-none mb-5 lg:mb-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 lg:sticky lg:top-24 flex flex-col gap-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Manage Listing
              </p>

              {/* edit toggle */}
              <button
                onClick={() => setEditOpen((o) => !o)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  editOpen
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                }`}
              >
                <Pencil size={14} />{" "}
                {editOpen ? "Close Editor" : "Edit Listing"}
              </button>

              {/* activate / deactivate */}
              <button
                onClick={() => setStatusConfirmOpen(true)}
                disabled={toggling}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-50 ${
                  inactive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                }`}
              >
                {inactive ? (
                  <>
                    <Eye size={14} /> Activate Listing
                  </>
                ) : (
                  <>
                    <EyeOff size={14} /> Deactivate Listing
                  </>
                )}
              </button>

              {/* stats */}
              <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2">
                {[
                  { label: "Total Rooms", value: pg.room },
                  { label: "Bathrooms", value: pg.bathroom },
                  { label: "Allocated", value: pg.allocatedRooms ?? "—" },
                  {
                    label: "Unallocated Rooms",
                    value: pg.unallocatedRooms ?? "—",
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-slate-50 rounded-xl p-3 border border-slate-100"
                  >
                    <p className="text-[10px] text-slate-400">{label}</p>
                    <p className="text-sm font-bold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── EDIT FORM (full width below grid) ── */}
        {editOpen && (
          <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm border border-blue-200 animate-in fade-in slide-in-from-top-2 duration-300">
            <h2 className="text-base font-semibold text-slate-900 mb-1">
              Edit Listing
            </h2>
            <p className="text-xs text-slate-400 mb-2">
              Changes will apply after confirmation.
            </p>
            <PGForm
              initial={{ ...pg, roomTypes }}
              onSubmit={handleEdit}
              onCancel={() => setEditOpen(false)}
              saving={saving}
              onRemoveRT={(i, doDelete) => setRtDeleteTarget({ i, doDelete })}
            />
          </div>
        )}
      </div>

      {/* confirm edit */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmEdit}
        title="Save Changes?"
        description="Are you sure you want to save these changes?"
        confirmText="Save"
        variant="primary"
        processing={saving}
      >
        <div className="overflow-y-auto pr-1 flex flex-col gap-3 max-h-52 mt-2">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Name:</span>{" "}
              {pendingData?.pgData?.name}
            </p>
            <p>
              <span className="font-semibold">City:</span>{" "}
              {pendingData?.pgData?.city}
            </p>
          </div>
          {pendingData?.roomTypes?.length > 0 && (
            <div className="flex flex-col gap-2">
              {pendingData.roomTypes.map((rt, i) => (
                <div
                  key={i}
                  className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 flex justify-between text-xs"
                >
                  <span className="font-semibold capitalize">
                    {rt.name} — {rt.availableRooms} rooms
                  </span>
                  <span className="font-bold text-blue-600">₹{rt.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </ConfirmModal>

      {/* confirm status toggle */}
      <ConfirmModal
        isOpen={statusConfirmOpen}
        onClose={() => setStatusConfirmOpen(false)}
        onConfirm={toggleActive}
        title={inactive ? "Activate Listing?" : "Deactivate Listing?"}
        description={
          inactive
            ? "This listing will become visible to all guests."
            : "This listing will be hidden from guests."
        }
        confirmText={inactive ? "Yes, Activate" : "Yes, Deactivate"}
        variant={inactive ? "primary" : "danger"}
        processing={toggling}
      />

      {/* confirm delete */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Listing?"
        description="This will permanently delete this PG and all its room types. This cannot be undone."
        confirmText="Yes, Delete"
        variant="danger"
        processing={deleting}
      />

      {/* confirm room delete */}
      <ConfirmModal
        isOpen={!!rtDeleteTarget}
        onClose={() => setRtDeleteTarget(null)}
        onConfirm={() => {
          rtDeleteTarget.doDelete();
          setRtDeleteTarget(null);
        }}
        title="Remove Room Type?"
        description="This room type will be removed when you save."
        confirmText="Remove"
        variant="danger"
      />

      {/* confirm img delete */}

      <ConfirmModal
        isOpen={!!deleteImgTarget}
        onClose={() => setDeleteImgTarget(null)}
        onConfirm={handleDeleteImg}
        title="Delete Image?"
        description="This image will be permanently removed from S3 and your listing."
        confirmText="Yes, Delete"
        variant="danger"
      />
    </div>
  );
}
