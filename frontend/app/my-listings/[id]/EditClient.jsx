"use client";

import { useState, useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
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
import BackButton from "../../../components/BackButton";
import { reviewApi } from "../../../lib/api/review";
import EditModal from "../components/EditModal";

import {
  Pencil,
  Eye,
  EyeOff,
  MapPin,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
  Star,
  User,
  Utensils,
  Bath as BathIcon,
  Toilet,
  BedDouble,
  Bed,
  ShieldCheck,
  Info,
  Calendar,
  X,
} from "lucide-react";
import {
  AMENITY_ICONS,
  GENDER_LABELS,
  FOOD_LABELS,
  ROOM_DETAIL_ICONS,
} from "../../../lib/constants";

export default function EditListingClient({ pgId }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  const [rtDeleteTarget, setRtDeleteTarget] = useState(null);
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
  const [uploadingImg, setUploadingImg] = useState(false);
  const [deletingImg, setDeletingImg] = useState(false);

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
      const [pgData, imgData, rtData, reviewRes] = await Promise.all([
        pgApi.getById(pgId),
        imageApi.getByPgId(pgId),
        roomTypeApi.getByPgId(pgId),
        reviewApi.getByPgId(pgId).catch(() => []),
      ]);

      // Calculate rating data (matches MyListingClient logic)
      const reviews = Array.isArray(reviewRes)
        ? reviewRes
        : (reviewRes?.reviews ?? []);
      const total = Array.isArray(reviewRes)
        ? reviews.length
        : (reviewRes?.total ?? 0);
      let ratingData = null;
      if (reviews.length > 0) {
        const avg = reviews.reduce((s, rv) => s + rv.star, 0) / reviews.length;
        ratingData = { avg: avg.toFixed(1), count: total };
      }

      setPg({ ...pgData, ratingData });
      setImages(Array.isArray(imgData) ? imgData : []);
      setRoomTypes(Array.isArray(rtData) ? rtData : []);

      const ownerId = pgData.owner?._id || pgData.owner;
      if (ownerId && ownerId !== user._id) {
        router.replace("/my-listings");
      }
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleEdit = ({ pgData, roomTypes: newRTs, removedIds }) => {
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
          : pgData.coordinate,
      };
      const updated = await pgApi.update(pgId, updatedPgData, tok);

      if (!updated._id) {
        showToast("error", "Failed to update PG.");
        return;
      }

      for (const id of removedIds) {
        await roomTypeApi.delete(id, tok);
        // Add this line to clean up the UI instantly:
        setRoomTypes((prev) => prev.filter((rt) => rt._id !== id));
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

  const toggleActive = async () => {
    setStatusConfirmOpen(false);
    setToggling(true);
    try {
      const updated = await pgApi.update(
        pgId,
        { isActive: !pg.isActive },
        token(),
      );
      if (updated._id) {
        setPg(updated);
        showToast(
          "success",
          updated.isActive ? "Listing activated!" : "Listing deactivated.",
        );
      }
    } finally {
      setToggling(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const apiBase = "";
      const res = await fetch(`${apiBase}/api/pg/${pgId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
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
      setUploadingImg(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("pg", pgId);
      formData.append("category", category);
      await imageApi.upload(formData, token());
      await fetchAll();
      showToast("success", "Image uploaded successfully!");
    } catch (err) {
      console.error(err.message);
      showToast("error", "Failed to upload image.");
    } finally {
      setUploadingImg(false);
    }
  };

  const requestDeleteImg = (imgId) => setDeleteImgTarget(imgId);

  const handleDeleteImg = async () => {
    const imgId = deleteImgTarget;
    try {
      setDeletingImg(true);
      await imageApi.delete(imgId, token());
      setImages((prev) => prev.filter((img) => img._id !== imgId));
      setDeleteImgTarget(null);
      showToast("success", "Image deleted successfully!");
    } catch (err) {
      console.error("Delete failed", err);
      showToast("error", "Failed to delete image.");
    } finally {
      setDeletingImg(false);
    }
  };

  if (!ready || loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!pg) notFound();

  const inactive = pg.isActive === false;
  const bathroomRatio =
    pg.bathroom && pg.room
      ? `${pg.bathroom} (${pg.bathroom >= pg.room ? "Attached" : `1:${Math.round(pg.room / pg.bathroom)}`})`
      : "—";
  const toiletRatio =
    pg.toilet && pg.room
      ? `${pg.toilet} (${pg.toilet >= pg.room ? "Attached" : `1:${Math.round(pg.room / pg.toilet)}`})`
      : "—";
  const totalBeds = roomTypes.reduce(
    (s, rt) => s + rt.availableRooms * rt.sharingCount,
    0,
  );
  const freeBeds = roomTypes.reduce(
    (s, rt) =>
      s +
      (rt.remainingBeds ??
        rt.availableRooms * rt.sharingCount - (rt.occupiedBeds || 0)),
    0,
  );

  return (
    <div className="bg-white min-h-screen text-[#222222] font-sans selection:bg-rose-100">
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 lg:px-12 py-6">
        {/* TOP NAV/BACK */}
        <div className="mb-4 flex items-center justify-between">
          <BackButton />
          {inactive && (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
              <EyeOff size={14} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">
                Hidden from Public Search
              </span>
            </div>
          )}
        </div>

        {/* TITLE & HEADER */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#222222] capitalize">
                {pg.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px]">
                <div className="flex items-center gap-1 font-semibold underline">
                  <Star className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>{pg.ratingData?.avg || "New"}</span>
                  <span className="text-[#717171] font-normal">
                    · {pg.ratingData?.count || 0} reviews
                  </span>
                </div>
                <div className="flex items-center gap-1 font-semibold underline">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="capitalize">{pg.city}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditOpen(!editOpen)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#DDDDDD] rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all hover:shadow-sm"
              >
                <Pencil size={14} />{" "}
                {editOpen ? "Close Editor" : "Edit Listing"}
              </button>
            </div>
          </div>
        </div>

        {toast && (
          <div
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold shadow-xl border animate-in fade-in slide-in-from-bottom-5 duration-300 ${
              toast.type === "success"
                ? "bg-[#222222] text-white border-transparent"
                : "bg-red-600 text-white border-transparent"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={16} />
            ) : (
              <XCircle size={16} />
            )}
            {toast.text}
          </div>
        )}

        {/* GALLERY AREA */}
        <div className="rounded-2xl overflow-hidden shadow-sm">
          <PGGallery
            images={images}
            onUpload={handleUpload}
            onDelete={requestDeleteImg}
            uploading={uploadingImg}
          />
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT: CONTENT */}
          <div className="lg:col-span-7">
            {/* Editor Modal Component */}
            <EditModal
              isOpen={editOpen}
              onClose={() => setEditOpen(false)}
              pg={pg}
              roomTypes={roomTypes}
              onEdit={handleEdit}
              saving={saving}
              setRtDeleteTarget={setRtDeleteTarget}
            />

            {/* Quick Info */}
            <div className="pb-6 border-b border-[#DDDDDD]">
              <h2 className="text-[22px] font-semibold text-[#222222]">
                Management Dashboard
              </h2>
              <p className="text-[#484848] text-base mt-1">
                {pg.room} rooms · {totalBeds} total beds · {freeBeds} currently
                free
              </p>
            </div>

            {/* Owner Highlights */}
            <div className="py-8 border-b border-[#DDDDDD] space-y-6">
              <div className="flex gap-4 items-start">
                <ShieldCheck className="w-6 h-6 mt-0.5 flex-shrink-0 text-gray-700" />
                <div>
                  <h3 className="text-[15px] font-semibold text-[#222222]">
                    Property Status
                  </h3>
                  <p className="text-[#717171] text-sm mt-0.5 leading-relaxed">
                    This listing is currently{" "}
                    {pg.isActive ? (
                      <span className="text-emerald-600 font-bold">Active</span>
                    ) : (
                      <span className="text-rose-600 font-bold">Inactive</span>
                    )}
                    .{" "}
                    {pg.isActive
                      ? "It is visible to all potential guests on the platform."
                      : "Guests cannot find or book this property."}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <Info className="w-6 h-6 mt-0.5 flex-shrink-0 text-gray-700" />
                <div>
                  <h3 className="text-[15px] font-semibold text-[#222222]">
                    Inventory Management
                  </h3>
                  <p className="text-[#717171] text-sm mt-0.5 leading-relaxed">
                    You have {roomTypes.length} room types defined. Keep your
                    prices and availability updated to maintain high search
                    rankings.
                  </p>
                </div>
              </div>
            </div>

            {/* Room configurations */}
            <div className="py-8 border-b border-[#DDDDDD]">
              <h2 className="text-[22px] font-semibold mb-5 text-[#222222]">
                Room configurations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {[
                  {
                    icon: ROOM_DETAIL_ICONS.Rooms,
                    label: "Private & Shared Rooms",
                    value: `${pg.room} rooms`,
                  },
                  {
                    icon: ROOM_DETAIL_ICONS.Gender,
                    label: "Gender Specification",
                    value: GENDER_LABELS[pg.gender] || pg.gender,
                  },
                  {
                    icon: ROOM_DETAIL_ICONS.Food,
                    label: "Food Service",
                    value: FOOD_LABELS[pg.food] || pg.food,
                  },
                  {
                    icon: ROOM_DETAIL_ICONS.Bathroom,
                    label: "Bathroom Ratio",
                    value: bathroomRatio,
                  },
                  {
                    icon: ROOM_DETAIL_ICONS.Toilet,
                    label: "Toilet Facility",
                    value: toiletRatio,
                  },
                  {
                    icon: ROOM_DETAIL_ICONS["Free Beds"],
                    label: "Current Availability",
                    value: `${freeBeds} beds free`,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="p-3 border border-gray-200 rounded-xl flex items-center gap-3"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-[#222222]">
                        {label}
                      </p>
                      <p className="text-sm text-gray-600">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Types Details */}
            {roomTypes.length > 0 && (
              <div className="py-8 border-b border-gray-200">
                <h2 className="text-[22px] font-semibold mb-5">
                  Room Type Performance
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {roomTypes.map((rt) => {
                    const occupied = rt.occupiedBeds || 0;
                    const total = rt.availableRooms * rt.sharingCount;
                    const free = total - occupied;
                    return (
                      <div
                        key={rt._id}
                        className="p-5 border border-gray-200 rounded-2xl bg-white shadow-sm hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-base font-bold text-[#222222] capitalize">
                              {rt.name}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                              {rt.sharingCount}-sharing · {rt.availableRooms}{" "}
                              rooms
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-rose-500">
                              ₹{rt.price?.toLocaleString("en-IN")}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              Per Bed
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                            <span className="text-gray-600">
                              Occupancy Level
                            </span>
                            <span
                              className={
                                free > 0 ? "text-emerald-600" : "text-rose-600"
                              }
                            >
                              {free} beds available
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${occupied / total > 0.8 ? "bg-rose-500" : "bg-[#222222]"}`}
                              style={{ width: `${(occupied / total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Amenities Section */}
            <div className="py-8 border-b border-[#DDDDDD]">
              <h2 className="text-[22px] font-semibold mb-5 text-[#222222]">
                What this place offers
              </h2>
              <div className="grid grid-cols-2 gap-y-5">
                {(pg.amenities || []).map((item) => {
                  const Icon = AMENITY_ICONS[item];
                  return (
                    <div
                      key={item}
                      className="flex items-center gap-4 text-gray-700"
                    >
                      {Icon && <Icon className="w-6 h-6 opacity-80" />}
                      <span className="text-[15px] text-[#484848] font-normal">
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: STICKY MANAGEMENT CARD */}
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-28">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Owner Controls
                    </span>
                    <h3 className="text-xl font-bold mt-1">Listing Status</h3>
                  </div>
                  <Badge variant={pg.isActive ? "green" : "red"}>
                    {pg.isActive ? "Online" : "Offline"}
                  </Badge>
                </div>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => setStatusConfirmOpen(true)}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border ${
                      inactive
                        ? "bg-[#222222] text-white border-transparent hover:bg-black"
                        : "bg-white text-rose-600 border-rose-600 hover:bg-rose-50"
                    }`}
                  >
                    {inactive ? <Eye size={18} /> : <EyeOff size={18} />}
                    {inactive ? "Publish Listing" : "Deactivate Listing"}
                  </button>

                  <p className="text-[11px] text-center text-gray-400 px-4">
                    {inactive
                      ? "Currently hidden. Click publish to make it visible to guests."
                      : "Active and visible. Click deactivate to hide it temporarily."}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 mb-6">
                  <p className="text-[10px] font-bold uppercase text-gray-400 mb-3 tracking-widest">
                    Occupancy Stats
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Total Capacity
                      </span>
                      <span className="text-sm font-bold">
                        {totalBeds} beds
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Current Vacancy
                      </span>
                      <span
                        className={`text-sm font-bold ${freeBeds > 0 ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {freeBeds} beds
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Allocated Rooms
                      </span>
                      <span className="text-sm font-bold">
                        {pg.allocatedRooms || 0} / {pg.room}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/pg/${pgId}`)}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-[#222222] rounded-xl text-sm font-bold hover:bg-gray-50 transition-all mb-4"
                >
                  <Eye size={18} /> View Guest Perspective
                </button>

                <div className="pt-4 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400 italic leading-snug">
                  <Info size={14} className="shrink-0" />
                  <span>
                    Only you can see this dashboard. Guests see the premium
                    booking interface.
                  </span>
                </div>
              </div>

              {/* Policy Quick-Add/Edit Info */}
              <div className="mt-6 p-5 border border-gray-200 rounded-xl bg-gray-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-700" />
                  <span className="font-bold text-sm">Last Updated</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Listing updated on{" "}
                  {new Date(pg.updatedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  . Keep your availability and pricing current to improve
                  conversion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* confirm modals */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmEdit}
        title="Confirm Changes"
        description="Are you sure you want to save these property updates?"
        confirmText="Save Changes"
        variant="primary"
        processing={saving}
      />

      <ConfirmModal
        isOpen={statusConfirmOpen}
        onClose={() => setStatusConfirmOpen(false)}
        onConfirm={toggleActive}
        title={inactive ? "Publish Listing?" : "Deactivate Listing?"}
        description={
          inactive
            ? "This will make your PG visible to all students."
            : "Students will no longer be able to find or book this PG."
        }
        confirmText={inactive ? "Yes, Publish" : "Yes, Deactivate"}
        variant={inactive ? "primary" : "danger"}
        processing={toggling}
      />

      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Permanently Delete?"
        description="This action cannot be undone. All images and booking history will be lost."
        confirmText="Delete Property"
        variant="danger"
        processing={deleting}
      />

      <ConfirmModal
        isOpen={!!rtDeleteTarget}
        onClose={() => setRtDeleteTarget(null)}
        onConfirm={() => {
          rtDeleteTarget.doDelete();
          setRtDeleteTarget(null);
        }}
        title="Remove Room Type?"
        description="This room configuration will be removed from your inventory."
        confirmText="Remove"
        variant="danger"
      />

      <ConfirmModal
        isOpen={!!deleteImgTarget}
        onClose={() => setDeleteImgTarget(null)}
        onConfirm={handleDeleteImg}
        title="Delete Image?"
        description="This image will be permanently removed from the gallery."
        confirmText="Delete"
        variant="danger"
        processing={deletingImg}
      />
    </div>
  );
}
