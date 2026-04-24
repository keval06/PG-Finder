"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { pgApi } from "../../../lib/api/pg";
import { imageApi } from "../../../lib/api/image";
import { roomTypeApi } from "../../../lib/api/roomType";
import PGGallery from "../../components/PGGallery";
import ConfirmModal from "../../../components/ConfirmModal";
import Button from "../../atoms/Button";
import Badge from "../../atoms/Badge";
import dynamic from "next/dynamic";
const PGForm = dynamic(() => import("../components/PGForm"), { ssr: false });

import {
  ArrowLeft,
  Pencil,
  Eye,
  EyeOff,
  Check,
  X,
  MapPin,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
  Star,
  IndianRupee,
  Home,
  User,
  Utensils,
  Bath as BathIcon,
  Toilet,
  BedDouble,
  Bed,
} from "lucide-react";
import {
  AMENITY_ICONS,
  GENDER_LABELS,
  FOOD_LABELS,
} from "../../../lib/constants";

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

  const [deleteImgTarget, setDeleteImgTarget] = useState(null);

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
      "coordinate",
    ];
    const pgChanged =
      pgFields.some((f) => {
        if (f === "coordinate") {
           const old = pg.coordinate?.coordinates || pg.coordinate;
           const cur = pgData.coordinate?.coordinates || pgData.coordinate;
           return JSON.stringify(old) !== JSON.stringify(cur);
        }
        return pgData[f] !== pg[f];
      }) ||
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
      const updatedPgData = {
        ...pgData,
        coordinate: Array.isArray(pgData.coordinate) 
          ? { type: "Point", coordinates: pgData.coordinate } 
          : pgData.coordinate
      };
      const updated = await pgApi.update(pgId, updatedPgData, tok);

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
      const apiBase = `${window.location.protocol}//${window.location.hostname}:5000`;
      const res = await fetch(
        `${apiBase}/api/pg/${pgId}`,
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

  const handleUpload = async (file, category) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("pg", pgId);
      formData.append("category", category);

      const res = await imageApi.upload(formData, token());

      if (res._id) {
        await fetchAll();
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

    // Optimistic update — remove from local state
    setImages((prev) => prev.filter((img) => img._id !== imgId));

    try {
      await imageApi.delete(imgId, token());
    } catch (err) {
      console.error("Delete failed", err);
      // Revert by refetching from server
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/my-listings")}
            icon={ArrowLeft}
          >
            Back to listings
          </Button>
          {inactive && (
            <Badge variant="slate" className="px-3 py-1 font-semibold">
              Inactive — hidden from guests
            </Badge>
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
        <div className="mb-6">
          <PGGallery
            images={images}
            onUpload={handleUpload}
            onDelete={requestDeleteImg}
          />
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
                    value: GENDER_LABELS[pg.gender] || pg.gender,
                  },
                  {
                    icon: Utensils,
                    label: "Food",
                    value: FOOD_LABELS[pg.food] || pg.food,
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
                    const Icon = AMENITY_ICONS[a];
                    return (
                      <Badge
                        variant="slate"
                        key={a}
                        className="flex items-center gap-1.5 normal-case font-medium"
                      >
                        {Icon && <Icon size={12} className="text-blue-500" />}
                        {a}
                      </Badge>
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
              <Button
                onClick={() => setEditOpen(!editOpen)}
                variant={editOpen ? "primary" : "outline"}
                icon={Pencil}
              >
                {editOpen ? "Close Editor" : "Edit Listing"}
              </Button>

              {/* activate / deactivate */}
              <Button
                onClick={() => setStatusConfirmOpen(true)}
                loading={toggling}
                variant={inactive ? "secondary" : "danger"}
                icon={inactive ? Eye : EyeOff}
                className={inactive ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : ""}
              >
                {inactive ? "Activate Listing" : "Deactivate Listing"}
              </Button>

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